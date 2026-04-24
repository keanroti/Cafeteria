#  Dependencias del Proyecto

## Package.json Overview
```json
{
  "name": "cafeteria-backend",
  "version": "1.0.0",
  "description": "Sistema de pedidos anticipados para cafetería universitaria - PGC Facultad de Ingeniería UdeC",
  "main": "server.js",
  "type": "commonjs"
}
```

---

## Dependencias NPM Instaladas (9 total)

### 1. **express** ^5.2.1
**Propósito**: Framework web para Node.js  
**Uso**: Crear servidor HTTP, rutas, middlewares  
**Funciones principales**:
- `app.get()`, `app.post()`, `app.put()`, `app.delete()` - Definen rutas
- `express.json()` - Middleware para parsear JSON
- `express.static()` - Servir archivos estáticos (HTML, CSS, JS)
- `app.use()` - Aplicar middlewares globales

**Instalación**: `npm install express`

---

### 2. **mysql2** ^3.20.0
**Propósito**: Driver para conectar y ejecutar queries en MySQL  
**Uso**: Interacción con base de datos  
**Funciones principales**:
- `mysql.createPool()` - Crea pool de conexiones reutilizables
- `pool.promise()` - Wrapper para usar async/await
- `pool.query()` - Ejecutar queries SQL (SELECT, INSERT, UPDATE, DELETE)
- Prepared statements (?) - Prevenir SQL injection

**Instalación**: `npm install mysql2`

**Datos a necesitar**:
- Host: localhost (o IP del servidor MySQL)
- Usuario: root (o usuario configurado)
- Password: contraseña de MySQL
- Database: cafeteria (nombre de la BD)

---

### 3. **bcrypt** ^6.0.0
**Propósito**: Hashear y verificar contraseñas  
**Uso**: Seguridad de autenticación  
**Funciones principales**:
- `bcrypt.hash(password, saltRounds)` - Hashear contraseña nueva
- `bcrypt.compare(password, hash)` - Verificar contraseña contra hash

**Instalación**: `npm install bcrypt`

**Ejemplo de uso**:
```javascript
// Al registrar
const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

// Al verificar en login
const validPassword = await bcrypt.compare(password, hashedPassword);
```

**Securidad**: Salt round 10 = ~100ms de procesamiento (equilibrio entre seguridad y velocidad)

---

### 4. **jsonwebtoken** ^9.0.3
**Propósito**: Crear y verificar tokens JWT para autenticación stateless  
**Uso**: Control de acceso basado en tokens  
**Funciones principales**:
- `jwt.sign(payload, secret, options)` - Crear token
- `jwt.verify(token, secret, callback)` - Verificar y decodificar token

**Instalación**: `npm install jsonwebtoken`

**Ejemplo de uso**:
```javascript
// Al login (crear token)
const token = jwt.sign(
  { id: user.id, tipo: user.tipo },
  process.env.JWT_SECRET,
  { expiresIn: '1d' } // Expira en 1 día
);

// En rutas protegidas (verificar token)
jwt.verify(token, JWT_SECRET, (err, decoded) => {
  if (err) return res.status(403).json({error: 'Token inválido'});
  // decoded.id, decoded.tipo disponibles
});
```

**Token Structure**: Header.Payload.Signature

---

### 5. **cors** ^2.8.6
**Propósito**: Habilitar Cross-Origin Resource Sharing  
**Uso**: Permitir que el frontend (diferentes puertos) acceda al API  
**Funciones principales**:
- `cors()` - Middleware que agrega headers CORS

**Instalación**: `npm install cors`

**Configuración en el proyecto**:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 
           'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
```

**¿Por qué?**: Sin CORS, navegador rechaza requests cross-domain

---

### 6. **dotenv** ^17.4.1
**Propósito**: Cargar variables de entorno desde archivo `.env`  
**Uso**: Configuración sensible (credenciales de BD, JWT_SECRET)  
**Funciones principales**:
- `require('dotenv').config()` - Lee `.env` y carga en `process.env`

**Instalación**: `npm install dotenv`

**Archivo .env**:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mi_contraseña
DB_NAME=cafeteria
JWT_SECRET=mi_clave_super_secreta
```

**Acceso en código**:
```javascript
const host = process.env.DB_HOST; // 'localhost'
const secret = process.env.JWT_SECRET;
```

**Seguridad**: `.env` nunca se commitea (está en `.gitignore`)

---

### 7. **socket.io** ^4.8.3
**Propósito**: Comunicación bidireccional en tiempo real (WebSockets)  
**Uso**: Notificaciones en vivo de pedidos actualizados  
**Funciones principales**:
- `new Server(httpServer, options)` - Crear servidor WebSocket
- `io.emit(event, data)` - Emitir evento a todos los clientes
- `io.on(connection, callback)` - Escuchar nuevas conexiones
- `socket.join(room)` - Unirse a una sala de broadcast

**Instalación**: `npm install socket.io`

**Ejemplo en server.js**:
```javascript
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ['http://localhost:3000'], credentials: true }
});

// Cuando se crea pedido
io.emit('nuevo_pedido', { pedido_id: 123 });

// Cuando cambia estado
io.emit('pedido_actualizado', { pedidoId: 123, estado: 'listo' });
```

**Ventaja**: Usuarios ven cambios en tiempo real sin refresh

---

### 8. **http** (Built-in, no instalar)
**Propósito**: Módulo nativo de Node.js para crear servidor HTTP  
**Uso**: Base para Express y Socket.io  
```javascript
const http = require('http');
const server = http.createServer(app); // App de Express
```

---

### 9. **path** (Built-in, no instalar)
**Propósito**: Manejo de rutas de archivos  
**Uso**: Servir archivos estáticos desde carpeta `public/`  
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
```

---

## Scripts NPM

```json
{
  "scripts": {
    "start": "node server.js",    // Modo producción
    "dev": "node server.js"        // Modo desarrollo (igual)
  }
}
```

**Ejecutar**:
```bash
npm start    # Produce
npm run dev  # Desarrollo
```

---

## Árbol de Dependencias Completo

```
cafeteria-backend
├── bcrypt@6.0.0
│   └── async crypto hashing
├── cors@2.8.6
│   └── HTTP cross-origin headers
├── dotenv@17.4.1
│   └── environment variables management
├── express@5.2.1
│   └── web framework
├── jsonwebtoken@9.0.3
│   └── JWT creation & verification
├── mysql2@3.20.0
│   └── MySQL database driver
└── socket.io@4.8.3
    └── real-time bidirectional communication
```

---

## Versiones Utilizadas

| Paquete | Versión | Tipo | Propósito |
|---------|---------|------|----------|
| express | ^5.2.1 | core | Servidor web |
| mysql2 | ^3.20.0 | core | Base de datos |
| cors | ^2.8.6 | core | Cross-origin |
| dotenv | ^17.4.1 | core | Env variables |
| bcrypt | ^6.0.0 | security | Hash passwords |
| jsonwebtoken | ^9.0.3 | security | JWT tokens |
| socket.io | ^4.8.3 | realtime | WebSockets |

---

## Cómo Instalar

### Instalar todas las dependencias
```bash
npm install
```

### Instalar un paquete específico
```bash
npm install bcrypt
```

### Instalar versión específica
```bash
npm install bcrypt@6.0.0
```

### Actualizar dependencias
```bash
npm update
npm outdated  # Ver qué puede actualizarse
```

### Ver dependencias instaladas
```bash
npm list
npm list --depth=0  # Solo nivel top
```

---

## Comandos Útiles

```bash
# Verificar instalación
npm list package-name

# Purgar y reinstalar
npm ci  # Instala versión exacta de package-lock.json

# Limpiar caché
npm cache clean --force
npm cache verify

# Auditar vulnerabilidades
npm audit
npm audit fix
```

---

## Node.js Compatibilidad

- **Versión recomendada**: Node.js 16+
- **Versión mínima**: Node.js 12
- **Verificar**: `node --version`

```bash
# Si necesitas cambiar versión
nvm install 18
nvm use 18
```

---

## Dependencias de Desarrollo (No instaladas, pero podrían ser útiles)

Para futuras mejoras:
- **express-validator** - Validación de datos
- **compression** - Compresión de respuestas
- **helmet** - Headers de seguridad
- **nodemon** - Auto-restart en cambios (dev)
- **jest** - Testing framework
- **dotenv-cli** - CLI para archivos .env

**Instalar**:
```bash
npm install --save-dev nodemon
npm install helmet compression
```

---

Última actualización: 2026 | Versión: 1.0.0
