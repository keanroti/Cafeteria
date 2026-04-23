require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pool de conexiones MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafeteria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const pool = db.promise();

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.tipo !== 'cafeteria') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de cafetería.' });
  }
  next();
};

// Validación de email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ---------- RUTAS ----------

// Registro
app.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, tipo) VALUES (?, ?, ?, ?)',
      [nombre.trim(), email.trim().toLowerCase(), hashedPassword, 'cliente']
    );
    res.status(201).json({ id: result.insertId, nombre, email: email.trim().toLowerCase(), tipo: 'cliente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, password_hash, tipo FROM usuarios WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, tipo: user.tipo }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password_hash, ...safeUser } = user;
    res.json({ ...safeUser, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
});

// Productos (público)
app.get('/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE disponible = 1 ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar productos' });
  }
});

// Pedido completo (protegido)
app.post('/pedido-completo', authenticateToken, async (req, res) => {
  const { usuario_id, total, items } = req.body;
  if (!usuario_id || total === undefined || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  if (req.user.id !== usuario_id) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  if (total < 0) return res.status(400).json({ error: 'Total no puede ser negativo' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0 || !item.precio_unitario || item.precio_unitario < 0) {
        throw new Error('Datos de item inválidos');
      }
      const [rows] = await connection.query('SELECT stock FROM productos WHERE id = ? FOR UPDATE', [item.producto_id]);
      if (rows.length === 0) throw new Error(`Producto ID ${item.producto_id} no existe`);
      if (rows[0].stock < item.cantidad) throw new Error(`Stock insuficiente para producto ID ${item.producto_id}`);
    }
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedido (usuario_id, estado, total, fecha) VALUES (?, "pendiente", ?, NOW())',
      [usuario_id, total]
    );
    const pedido_id = pedidoResult.insertId;
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido_id, item.producto_id, item.cantidad, item.precio_unitario]
      );
      await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }
    await connection.commit();
    io.emit('nuevo_pedido', { pedido_id });
    res.status(201).json({ pedido_id, ok: true });
  } catch (error) {
    await connection.rollback();
    console.error('Error en pedido-completo:', error);
    res.status(500).json({ error: error.message || 'Error al crear pedido' });
  } finally {
    connection.release();
  }
});

// Pedidos (admin)
app.get('/pedidos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre, p.estado, p.total, p.fecha
      FROM pedido p
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.fecha DESC, p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar pedidos' });
  }
});

// Pedidos de un usuario
app.get('/pedido-usuario/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (req.user.id !== userId && req.user.tipo !== 'cafeteria') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, usuario_id, estado, total, fecha FROM pedido WHERE usuario_id = ? ORDER BY fecha DESC, id DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar pedidos del usuario' });
  }
});

// Detalle de un pedido
app.get('/pedido/:id', authenticateToken, async (req, res) => {
  const pedidoId = req.params.id;
  try {
    const [pedidos] = await pool.query('SELECT usuario_id FROM pedido WHERE id = ?', [pedidoId]);
    if (pedidos.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (req.user.tipo !== 'cafeteria' && pedidos[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const [detalles] = await pool.query(`
      SELECT pr.nombre, dp.cantidad, dp.precio_unitario
      FROM detalle_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = ?
    `, [pedidoId]);
    res.json(detalles);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar detalle' });
  }
});

// Actualizar estado de pedido
app.put('/pedido/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  try {
    await pool.query('UPDATE pedido SET estado = ? WHERE id = ?', [estado, req.params.id]);
    io.emit('pedido_actualizado', { pedidoId: req.params.id, estado });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// CRUD de productos (admin)
app.get('/admin/productos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/admin/productos', authenticateToken, requireAdmin, async (req, res) => {
  const { nombre, precio, stock, disponible } = req.body;
  if (!nombre || precio === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  if (precio < 0) return res.status(400).json({ error: 'Precio no puede ser negativo' });
  if (stock < 0) return res.status(400).json({ error: 'Stock no puede ser negativo' });
  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, precio, stock, disponible) VALUES (?, ?, ?, ?)',
      [nombre.trim(), precio, stock || 0, disponible ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/admin/productos/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { nombre, precio, stock, disponible } = req.body;
  if (precio < 0) return res.status(400).json({ error: 'Precio no puede ser negativo' });
  if (stock < 0) return res.status(400).json({ error: 'Stock no puede ser negativo' });
  try {
    await pool.query(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ?, disponible = ? WHERE id = ?',
      [nombre.trim(), precio, stock, disponible ? 1 : 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto

app.delete('/admin/productos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
   
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ ok: true, message: 'Producto eliminado correctamente' });
  } catch (error) {
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'No se puede eliminar: Este producto ya está registrado en pedidos anteriores. Intenta desactivarlo (Disponible = No).' 
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reportes (consolidados sin duplicados)
app.get('/admin/reportes/ventas-diarias', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(fecha) as dia, COUNT(*) as num_pedidos, SUM(total) as total_ventas
      FROM pedido WHERE estado != 'cancelado'
      GROUP BY DATE(fecha) ORDER BY dia DESC LIMIT 30
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

app.get('/admin/reportes/productos-populares', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pr.nombre, SUM(dp.cantidad) as total_vendido, SUM(dp.cantidad * dp.precio_unitario) as ingresos
      FROM detalle_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      JOIN pedido p ON dp.pedido_id = p.id
      WHERE p.estado != 'cancelado'
      GROUP BY pr.id
      ORDER BY total_vendido DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

app.get('/admin/reportes/kpis', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const [pedidosHoy] = await pool.query(`SELECT COUNT(*) as total FROM pedido WHERE DATE(fecha) = ?`, [hoy]);
    const [ingresosHoy] = await pool.query(`SELECT SUM(total) as total FROM pedido WHERE DATE(fecha) = ? AND estado != 'cancelado'`, [hoy]);
    const [productoTop] = await pool.query(`
      SELECT pr.nombre FROM detalle_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      GROUP BY pr.id ORDER BY SUM(dp.cantidad) DESC LIMIT 1
    `);
    const [pendientes] = await pool.query(`SELECT COUNT(*) as total FROM pedido WHERE estado = 'pendiente'`);
    res.json({
      pedidosHoy: pedidosHoy[0].total,
      ingresosHoy: ingresosHoy[0].total || 0,
      productoTop: productoTop[0]?.nombre || '--',
      pedidosPendientes: pendientes[0].total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en KPIs' });
  }
});

app.get('/admin/reportes/ventas-semana', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE(fecha) as dia, SUM(total) as total
      FROM pedido
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND estado != 'cancelado'
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const data = rows.map(r => ({
      dia: diasSemana[new Date(r.dia).getDay()],
      total: r.total
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error en ventas semana' });
  }
});

// WebSockets
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('registrar_usuario', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});