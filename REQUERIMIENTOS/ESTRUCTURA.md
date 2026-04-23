#  Arquitectura Técnica - Cafetería U

## Visión General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (NAVEGADOR)                      │
│  Frontend: HTML5, CSS3, Vanilla JavaScript + Socket.io      │
│  Storage: localStorage (carrito, sesión usuario)             │
└────────────────┬────────────────────────────────────────────┘
                 │
          HTTP + WebSocket
                 │
┌────────────────▼────────────────────────────────────────────┐
│              EXPRESS.JS API SERVER                          │
│  ✓ Autenticación JWT                                        │
│  ✓ Gestión de usuarios                                      │
│  ✓ Manejo de productos                                      │
│  ✓ Procesamiento de pedidos                                 │
│  ✓ Reportes y analytics                                     │
│  ✓ Socket.io (actualizaciones en tiempo real)               │
└────────────────┬────────────────────────────────────────────┘
                 │
              MySQL
                 │
┌────────────────▼────────────────────────────────────────────┐
│            BASE DE DATOS MYSQL (cafeteria)                  │
│  ✓ usuarios                                                 │
│  ✓ productos                                                │
│  ✓ pedido                                                   │
│  ✓ detalle_pedido                                           │
└─────────────────────────────────────────────────────────────┘
```

---

##  Estructura de Base de Datos

### Tabla: usuarios
```
id                INT AUTO_INCREMENT PRIMARY KEY
nombre            VARCHAR(100) - Nombre completo usuario
email             VARCHAR(100) UNIQUE - Email único
password_hash     VARCHAR(255) - Contraseña hasheada (bcrypt)
tipo              ENUM('cliente', 'cafeteria') - Rol del usuario
created_at        TIMESTAMP - Fecha de creación
```

**Propósito**: Almacenar información de usuarios (estudiantes y personal de cafetería)
**Seguridad**: Contraseñas hasheadas con bcrypt, email único

---

### Tabla: productos
```
id                INT AUTO_INCREMENT PRIMARY KEY
nombre            VARCHAR(100) - Nombre del producto
precio            DECIMAL(10, 2) - Precio unitario
stock             INT - Cantidad disponible
disponible        TINYINT (0=no, 1=sí) - Mostrar en menú
created_at        TIMESTAMP - Fecha de creación
```

**Propósito**: Catálogo de alimentos/bebidas disponibles
**Gestión**: Solo admins pueden crear/editar/eliminar

---

### Tabla: pedido
```
id                INT AUTO_INCREMENT PRIMARY KEY
usuario_id        INT FOREIGN KEY → usuarios.id
estado            ENUM('pendiente', 'preparando', 'listo', 
                       'entregado', 'cancelado')
total             DECIMAL(10, 2) - Monto total del pedido
fecha             TIMESTAMP - Cuándo se hizo el pedido
```

**Propósito**: Registrar pedidos principales
**Estados**: 
- pendiente: Recién creado, sin procesar
- preparando: En cocina
- listo: Listo para retirar
- entregado: Completado
- cancelado: Rechazado

---

### Tabla: detalle_pedido
```
id                INT AUTO_INCREMENT PRIMARY KEY
pedido_id         INT FOREIGN KEY → pedido.id
producto_id       INT FOREIGN KEY → productos.id
cantidad          INT - Cantidad ordenada
precio_unitario   DECIMAL(10, 2) - Precio en el momento
```

**Propósito**: Detallar qué productos van en cada pedido
**Relación**: Cada pedido puede tener muchos detalles

---

##  API REST - Endpoints

### AUTENTICACIÓN

#### POST /register
- **Parámetros**: nombre, email, password
- **Validaciones**: Email válido, password ≥6 caracteres, email único
- **Respuesta**: Usuario creado (tipo: 'cliente')
- **Hash**: bcrypt round 10

#### POST /login
- **Parámetros**: email, password
- **Validaciones**: Email y password correctos
- **Respuesta**: Token JWT (expira en 1 día) + datos usuario
- **Token**: Incluir en header Authorization: Bearer <token>

---

### PRODUCTOS (Público)

#### GET /productos
- **Autenticación**: No requerida
- **Respuesta**: Array de productos disponibles (disponible=1)
- **Campos**: id, nombre, precio, stock, disponible
- **Orden**: Por ID descendente

---

### PEDIDOS (Protegido)

#### POST /pedido-completo
- **Autenticación**: JWT requerido
- **Parámetros**: usuario_id, total, items[]
- **Items**: {producto_id, cantidad, precio_unitario}
- **Validaciones**: 
  - usuario_id coincide con token
  - stock suficiente
  - total >= 0
- **Transacción**: Crea pedido + detalles + actualiza stock
- **Respuesta**: pedido_id
- **WebSocket**: Emite 'nuevo_pedido'

#### GET /pedido-usuario/:id
- **Autenticación**: JWT requerido
- **Validación**: Solo su propio usuario o admin
- **Respuesta**: Array de pedidos del usuario

#### GET /pedido/:id
- **Autenticación**: JWT requerido
- **Validación**: Dueño o admin
- **Respuesta**: Detalles del pedido (productos en él)

#### PUT /pedido/:id
- **Autenticación**: JWT requerido (solo admin)
- **Parámetros**: estado
- **Estados válidos**: pendiente, preparando, listo, entregado, cancelado
- **WebSocket**: Emite 'pedido_actualizado'

---

### ADMINISTRACIÓN (solo tipo='cafeteria')

#### GET /admin/productos
- **Respuesta**: Todos los productos (incluidos desactivados)

#### POST /admin/productos
- **Parámetros**: nombre, precio, stock, disponible
- **Validaciones**: precio ≥ 0, stock ≥ 0

#### PUT /admin/productos/:id
- **Parámetros**: nombre, precio, stock, disponible
- **Validaciones**: Ídem POST

#### DELETE /admin/productos/:id
- **Protección**: No elimina si está en pedidos (error ER_ROW_IS_REFERENCED)
- **Alternativa**: Usar disponible=0 para desactivar

#### GET /admin/reportes/ventas-diarias
- **Respuesta**: Ventas agrupadas por día (últimos 30)
- **Campos**: dia, num_pedidos, total_ventas

#### GET /admin/reportes/productos-populares
- **Respuesta**: Top 10 productos más vendidos
- **Campos**: nombre, total_vendido, ingresos

#### GET /admin/reportes/kpis
- **Respuesta**: 
  - pedidosHoy
  - ingresosHoy
  - productoTop
  - pedidosPendientes

#### GET /admin/reportes/ventas-semana
- **Respuesta**: Ventas últimos 7 días con día de semana

---

##  Frontend - Estructura HTML/CSS

### Páginas Principales

#### index.html (Login/Registro)
- **Componentes**:
  - Formulario login (email sin contraseña - flujo simplificado)
  - Formulario registro (nombre, email, password)
  - Visual dashboard con orbs animados
- **Estilos**: Diseño moderno con gradientes, cursor personalizado
- **Scripts**: auth.js

#### menu.html (Catálogo de Productos)
- **Componentes**:
  - Buscador de productos
  - Filtro por categorías
  - Grid de producto (nombre, emoji, precio, stock)
  - Botón agregar al carrito
  - Navbar flotante
  - Carrito badge
- **Scripts**: app.js, menu.js
- **Storage**: Carrito en localStorage

#### carrito.html (Carrito de Compras)
- **Componentes**:
  - Lista de items con cantidad
  - Botones +/- para cantidad
  - Botón eliminar item
  - Resumen de totales
  - Botón confimar pedido
- **Scripts**: app.js, carrito.js
- **Validaciones**: Carrito no vacío

#### estado.html (Seguimiento de Pedidos)
- **Componentes**:
  - Estadísticas (total, pendientes, entregas)
  - Lista de pedidos con estado
  - Detalles expandibles
  - Auto-refresh cada 5s
- **Scripts**: app.js, estado.js
- **WebSocket**: Escucha 'pedido_actualizado'

#### admin.html (Panel Administrativo)
- **Componentes**:
  - Tabs: Pedidos activos, Historial, Productos, Gráficos
  - Grid de pedidos con colores por estado
  - Selector para cambiar estado
  - Tabla CRUD de productos
  - Gráficos de ventas (Chart.js)
  - KPIs del día
- **Scripts**: app.js, admin.js
- **Permisos**: Solo tipo='cafeteria'

#### register.html (Página Registro)
- Similar a index.html pero enfocado en registro

---

##  Autenticación & Autorización

### Flujo JWT
1. User hace login → servidor verifica credenciales
2. Si son válidas → genera JWT con {id, tipo}
3. JWT se almacena en localStorage
4. Cliente envía en header: `Authorization: Bearer <token>`
5. Server verifica token antes de procesar
6. Token expira en 1 día

### Middleware authenticateToken
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'].split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({error: 'Token inválido'});
    req.user = user;
    next();
  });
}
```

### Middleware requireAdmin
```javascript
const requireAdmin = (req, res, next) => {
  if (req.user.tipo !== 'cafeteria') {
    return res.status(403).json({error: 'Acceso denegado'});
  }
  next();
}
```

---

## 🔌 WebSocket (Socket.io)

### Eventos Emitidos
- `nuevo_pedido`: Cuando se crea un pedido
  ```javascript
  io.emit('nuevo_pedido', { pedido_id })
  ```

- `pedido_actualizado`: Cuando cambia estado
  ```javascript
  io.emit('pedido_actualizado', { pedidoId, estado })
  ```

### Uso en Frontend
```javascript
// Conecta automáticamente
// Cliente se une a sala específica
socket.emit('registrar_usuario', userId);
```

---

##  Flujos Principales

### 1. Registro e Inicio de Sesión
```
User → /register (POST) → Hash password + INSERT usuarios
       → /login (POST) → Verify password + JWT token
       → localStorage (token + user data)
       → Redirige a /menu.html
```

### 2. Realizar Pedido
```
User selecciona productos → localStorage.carrito
       → /pedido-completo (POST, JWT)
       → Transaction BEGIN
       → INSERT pedido
       → INSERT detalle_pedido (múltiple)
       → UPDATE productos (stock -= cantidad)
       → COMMIT
       → WebSocket: 'nuevo_pedido'
       → localStorage.carrito = []
       → Redirige a /estado.html
```

### 3. Admin Gestiona Pedidos
```
Admin accede /admin.html
       → /pedidos (GET, JWT+admin)
       → Filtra por estado activo
       → Selecciona nuevo estado
       → PUT /pedido/:id (nuevo estado)
       → WebSocket: 'pedido_actualizado'
       → UI actualiza en tiempo real
       → Cliente ve cambio en /estado.html
```

### 4. Admin Gestiona Productos
```
Admin en tab productos
       → GET /admin/productos
       → Formulario CRUD
       → POST /admin/productos (nuevo)
       → PUT /admin/productos/:id (editar)
       → DELETE /admin/productos/:id (eliminar con validación)
```

---

##  Medidas de Seguridad

### Backend
- **Contraseñas**: bcrypt con salt 10
- **XSS**: No se ejecutan scripts inyectados
- **CSRF**: Implícito (JWT en header, no cookie)
- **SQL Injection**: Prepared statements (?)
- **Rate Limiting**: No implementado (agregar en producción)
- **HTTPS**: No en dev, SÍ en producción

### Frontend
- **XSS Prevention**: esc() limpia texto antes de innerHTML
- **localStorage**: Solo datos públicos/UUID, no passwords
- **CORS**: Validado en server.js

---

##  Escalabilidad Consideraciones

- **Pool MySQL**: 10 conexiones máximo (configurable)
- **Transacciones**: Para atomicidad en pedidos
- **Indexes**: Faltan en DB para optimizar queries
- **Caché**: No implementado
- **Session**: JWT stateless (escalable)

---


