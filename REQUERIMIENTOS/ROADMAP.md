#  ROADMAP Y MEJORAS SUGERIDAS

Mejoras futuras y evolución del proyecto Cafetería U.

---

##  Estado Actual (v1.0)

**Funcionalidades Implementadas**:
-  Autenticación JWT + bcrypt
-  Sistema de pedidos completo
-  Carrito de compras
-  WebSockets en tiempo real
-  Panel administrativo
-  Reportes básicos
-  CRUD de productos
-  Seguimiento de pedidos

**Limitaciones Actuales**:
-  Sin pagos online
-  Sin notificaciones //notificaciones reales
-  Sin historial cliente
-  Sin categorías de productos
-  Sin horarios
-  Sin promociones

---

##  Roadmap por Fase

### FASE 1: Mejoras Críticas (1-2 semanas)

#### 1.1 Seguridad en Producción
**Importancia**:  CRÍTICA

```bash
# Instalar
npm install helmet express-rate-limit
npm install --save-dev nodemon
```

**Cambios**:
```javascript
// server.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());  // Headers de seguridad

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100  // 100 requests por IP
});
app.use('/api/', limiter);

// HTTPS obligatorio en producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

**Ventajas**: Previene ataques DDoS, XSS, CSRF

---

#### 1.2 Validación de Entrada Completa
**Importancia**:  CRÍTICA

```bash
npm install express-validator
```

**Cambios**:
```javascript
const { body, validationResult } = require('express-validator');

app.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... resto de lógica
});
```

**Ventajas**: Previene inyecciones, valida tipos datos

---

#### 1.3 Logging & Monitoreo
**Importancia**:  ALTA

```bash
npm install winston cors helmet
```

**Cambios**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usar
logger.info('Pedido creado', { pedido_id: 123 });
logger.error('Error crítico', { error: err.message });
```

**Ventajas**: Historial de eventos, debugging fácil

---

### FASE 2: Funcionalidades Nuevas (2-3 semanas)

#### 2.1 Sistema de Pagos Integrado
**Importancia**:  CRÍTICA para producción

**Opciones**:
- Stripe (recomendado)
- PayPal
- MercadoPago (Latinoamérica)

**Pasos**:
```bash
npm install stripe
```

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET);

app.post('/crear-pago', authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.nombre },
          unit_amount: item.precio * 100
        },
        quantity: item.cantidad
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/exito`,
      cancel_url: `${process.env.FRONTEND_URL}/carrito`
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Ventajas**: Monetización, seguridad de pago, múltiples métodos

**Costo**: Stripe cobra 2.9% + $0.30 por transacción

---

#### 2.2 Notificaciones por Email/SMS
**Importancia**:  ALTA

**Email - Nodemailer**:
```bash
npm install nodemailer
```

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD  // App password
  }
});

// Enviar email
const mailOptions = {
  from: process.env.EMAIL,
  to: user.email,
  subject: 'Tu pedido está listo #' + pedido_id,
  html: `<h1>Tu pedido está listo</h1>
         <p>Retira en cafetería en 5 minutos</p>`
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) console.error(err);
  else console.log('Email enviado: ' + info.response);
});
```

**SMS - Twilio**:
```bash
npm install twilio
```

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT, process.env.TWILIO_TOKEN);

client.messages.create({
  body: 'Tu pedido #123 está listo',
  from: process.env.TWILIO_PHONE,
  to: '+569XXXXXXXX'
}).then(msg => console.log(msg.sid));
```

**Ventajas**: Cliente informado, respuesta rápida

**Costo**: Gmail gratis, Twilio ~$0.01/SMS

---

#### 2.3 Sistema de Categorías
**Importancia**:  MEDIA

**DB Update**:
```sql
ALTER TABLE productos ADD COLUMN categoria VARCHAR(50);

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE,
  icono VARCHAR(50),
  color VARCHAR(7)
);

ALTER TABLE productos 
ADD CONSTRAINT fk_categoria 
FOREIGN KEY (categoria_id) REFERENCES categorias(id);
```

**API**:
```javascript
app.get('/categorias', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categorias');
  res.json(rows);
});

app.get('/productos/categoria/:id', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM productos WHERE categoria_id = ? AND disponible = 1',
    [req.params.id]
  );
  res.json(rows);
});
```

**UI Update**:
```javascript
// En menu.js
async function cargarCategorias() {
  const res = await fetch('/categorias');
  const cats = await res.json();
  
  const container = document.getElementById('categoriesBar');
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = `${cat.icono} ${cat.nombre}`;
    btn.onclick = () => filtrarPorCategoria(cat.id);
    container.appendChild(btn);
  });
}
```

**Ventajas**: Mejor organización, experiencia mejorada

---

#### 2.4 Horarios y Disponibilidad
**Importancia**:  MEDIA

```sql
CREATE TABLE horarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana INT (0=domingo, 6=sábado),
  hora_apertura TIME,
  hora_cierre TIME,
  abierto BOOLEAN
);
```

```javascript
function validarHorario() {
  const ahora = new Date();
  const hora = ahora.getHours();
  const dia = ahora.getDay();
  
  const [horario] = await pool.query(
    'SELECT * FROM horarios WHERE dia_semana = ?',
    [dia]
  );
  
  if (!horario || !horario.abierto) {
    return { abierto: false, mensaje: 'Cafetería cerrada' };
  }
  
  // Validar hora
  return { abierto: true };
}

// En routes
app.post('/pedido-completo', authenticateToken, async (req, res) => {
  const horario = validarHorario();
  if (!horario.abierto) {
    return res.status(400).json({ error: horario.mensaje });
  }
  // ... crear pedido
});
```

---

### FASE 3: Experiencia de Usuario (2 semanas)

#### 3.1 App Móvil Nativa
**Importancia**:  CRÍTICA para expansión

**Opciones**:
- React Native (multiplataforma)
- Flutter (Google)
- Swift (iOS) + Kotlin (Android)

**Conceptos**:
```javascript
// App móvil conecta a mismo API
// Solo necesita cambiar frontend

// Mantener API igual
// Crear nueva carpeta: /mobile con React Native
```

**Ventaja**: Acceso offline, push notifications, UX nativa

---

#### 3.2 Rating y Reseñas
**Importancia**:  ALTA

```sql
CREATE TABLE resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  producto_id INT,
  calificacion INT (1-5),
  comentario TEXT,
  fecha TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

```javascript
app.post('/resena', authenticateToken, [
  body('producto_id').isInt(),
  body('calificacion').isInt({ min: 1, max: 5 }),
  body('comentario').optional().trim()
], async (req, res) => {
  const { producto_id, calificacion, comentario } = req.body;
  
  await pool.query(
    'INSERT INTO resenas (usuario_id, producto_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
    [req.user.id, producto_id, calificacion, comentario]
  );
  
  res.json({ ok: true });
});

app.get('/resenas/:producto_id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.nombre, r.calificacion, r.comentario 
     FROM resenas r
     JOIN usuarios u ON r.usuario_id = u.id
     WHERE r.producto_id = ?
     ORDER BY r.fecha DESC`,
    [req.params.producto_id]
  );
  res.json(rows);
});
```

---

#### 3.3 Historial de Compras Usuarios
**Importancia**:  MEDIA

Crear dashboard personal:

```javascript
app.get('/mi-historial', authenticateToken, async (req, res) => {
  const [pedidos] = await pool.query(
    `SELECT p.id, p.total, p.fecha, p.estado,
            COUNT(dp.id) as items
     FROM pedido p
     LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
     WHERE p.usuario_id = ?
     GROUP BY p.id
     ORDER BY p.fecha DESC`,
    [req.user.id]
  );
  
  res.json(pedidos);
});
```

**UI**: Nueva página `historial.html` con:
- Gráfico de gastos
- Productos favoritos
- Frecuencia de compra
- Estadísticas

---

### FASE 4: Análisis y Reportes (1 semana)

#### 4.1 Dashboard Avanzado Admin
**Importancia**:  ALTA

Instalar Chart.js (ya en proyecto):

```javascript
// Gráfico de ingresos por hora
app.get('/admin/reportes/ingresos-hora', authenticateToken, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT HOUR(fecha) as hora, SUM(total) as ingresos
    FROM pedido
    WHERE DATE(fecha) = CURDATE() AND estado != 'cancelado'
    GROUP BY HOUR(fecha)
    ORDER BY hora
  `);
  res.json(rows);
});

// Gráfico de productos por categoría
app.get('/admin/reportes/por-categoria', authenticateToken, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(`
    SELECT c.nombre, SUM(dp.cantidad) as total_vendido
    FROM detalle_pedido dp
    JOIN productos p ON dp.producto_id = p.id
    JOIN categorias c ON p.categoria_id = c.id
    WHERE DATE(dp.created_at) = CURDATE()
    GROUP BY c.id
  `);
  res.json(rows);
});
```

---

#### 4.2 Exportar Reportes (Excel, PDF)
**Importancia**:  MEDIA

```bash
npm install xlsx pdfkit
```

```javascript
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

app.get('/admin/exportar/excel', authenticateToken, requireAdmin, (req, res) => {
  // Obtener datos
  const [pedidos] = await pool.query('SELECT * FROM pedido WHERE DATE(fecha) = CURDATE()');
  
  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(pedidos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
  
  // Enviar archivo
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=pedidos.xlsx');
  XLSX.write(wb, { type: 'stream', stream: res });
});
```

---

### FASE 5: Escalado y Optimización (2-3 semanas)

#### 5.1 Caché con Redis
**Importancia**:  CRÍTICA en producción (10,000+ usuarios)

```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient({ host: 'localhost', port: 6379 });

// Caché de productos
app.get('/productos', async (req, res) => {
  const cached = await client.get('productos_list');
  if (cached) return res.json(JSON.parse(cached));
  
  const [rows] = await pool.query('SELECT * FROM productos WHERE disponible = 1');
  
  await client.setEx('productos_list', 300, JSON.stringify(rows));  // Cache 5 minutos
  res.json(rows);
});
```

**Ventaja**: Reducir carga BD, respuestas más rápidas

---

#### 5.2 Load Balancing y Replicación
**Importancia**:  CRÍTICA en producción masiva

Opciones:
- Nginx reverse proxy
- AWS ELB
- Kubernetes

```bash
# nginx.conf
upstream cafeteria_backend {
  server 192.168.1.10:3000;  # Server 1
  server 192.168.1.11:3000;  # Server 2
  server 192.168.1.12:3000;  # Server 3
}

server {
  listen 80;
  location / {
    proxy_pass http://cafeteria_backend;
  }
}
```

---

#### 5.3 Base de Datos Replicada
**Importancia**:  ALTA en producción

```bash
# Master-Slave replication o Master-Master
# MySQL native replication

# En servidor Master:
# binary logging habilitado
# En servidor Slave:
CHANGE MASTER TO
  MASTER_HOST='master.ip',
  MASTER_USER='replication',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;
```

---

#### 5.4 Compresión y CDN
**Importancia**:  MEDIA

```javascript
const compression = require('compression');
app.use(compression()); // Comprime respuestas

// Para archivos estáticos, usar CloudFlare o AWS CloudFront
```

**Instalación**:
```bash
npm install compression
```

---

##  Mejoras de UI/UX

### Corto Plazo (2 semanas)

- [ ] Dark mode automático
- [ ] Filtros avanzados de búsqueda
- [ ] Favoritos de productos
- [ ] Compartir pedido (generador links)
- [ ] QR code para retiro
- [ ] Predicción de tiempo de espera
- [ ] Sugerencias basadas en historial
- [ ] Notificaciones del navegador (push)

### Medio Plazo (1 mes)

- [ ] Avatar/perfil usuario
- [ ] Guardar métodos de pago
- [ ] Direcciones guardadas
- [ ] Cupones/códigos promocionales
- [ ] Programa de lealtad (puntos)
- [ ] Chat soporte en vivo
- [ ] Video tutorial inicial
- [ ] Onboarding interactivo

---

##  Mantenimiento Continuo

### Cada Semana
- Revisar logs de errores
- Backups de BD
- Monitoreo de performance

### Cada Mes
- Actualizar dependencias npm
- Revisar seguridad (npm audit)
- Limpiar datos obsoletos
- Performance review

### Cada Trimestre
- Análisis de uso (qué funciona)
- Feedback de usuarios
- Planificación de features nuevos
- Code review general

---

##  Métricas de Éxito

Antes de implementar cada fase, definir:

| Métrica | Meta | Método Medición |
|---------|------|-----------------|
| Uptime | 99.9% | Monitoreo continuo |
| Response Time | <200ms | APM (New Relic) |
| Usuarios mensuales | 5,000+ | Google Analytics |
| Conversion rate | 10%+ | Stripe/Analytics |
| Satisfacción | 4.5/5 | Rating sistema |
| Transactions/día | 500+ | BD query |

---



##  Timeline Recomendado

```
Semanas 1-2:   Fase 1 (Seguridad)
Semanas 3-5:   Fase 2 Part A (Pagos)
Semanas 6-7:   Fase 2 Part B (Notificaciones)
Semanas 8-10:  Fase 3 (UX improvements)
Semanas 11-12: Fase 4 (Reportes)
Semanas 13+:   Fase 5 (Escalado) & Mantenimiento
```

---

##  Lo Que NO Recomiendamos

-  Cambiar BD a NoSQL sin razón
-  Usar framework pesado (Next.js) sin necesidad
-  Implementar microservicios antes de 10k usuarios
-  Ignorar seguridad por "speed to market"
-  Hacer todo en paralelo sin priorizar
-  Compilar todo a una sola función serverless

---

##  Recomendaciones Finales

1. **Primero**: Asegurar base sólida (seguridad, tests)
2. **Segundo**: Validar con usuarios reales
3. **Tercero**: Escalar solo cuando sea necesario
4. **Cuarto**: Mantener código limpio y documentado
5. **Quinto**: Medir - no asumir

---




