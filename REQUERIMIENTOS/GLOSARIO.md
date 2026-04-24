#  GLOSARIO TÉCNICO

Referencia rápida de términos técnicos usados en Cafetería U.

---

## A

### API (Application Programming Interface)
Interfaz que permite comunicación entre aplicaciones. En este proyecto:
- **API REST** usa HTTP (GET, POST, PUT, DELETE)
- **WebSocket API** usa conexión bidireccional (tiempo real)
- **Base de datos API** es el driver MySQL

**Ejemplo**: `fetch('/productos')` es una llamada a API

---

### Async/Await
Forma moderna de escribir código asincrónico en JavaScript.
```javascript
async function obtenerProductos() {
  const res = await fetch('/productos');  // Espera respuesta
  const datos = await res.json();         // Espera JSON
  return datos;
}
```

---

## B

### Backend
Código del servidor (lado servidor). En el proyecto:
- `server.js` es el backend
- Node.js + Express.js + MySQL

**Opuesto**: Frontend (código en navegador)

---

### Bcrypt
Librería para hashear contraseñas de forma segura.
- **Hash**: Conversión irreversible (`"hola"` → `"$2b$10$xyz..."`)
- **Compare**: Verifica si contraseña coincide con hash
- **Salt rounds**: 10 (incrementa seguridad)

```javascript
const hash = await bcrypt.hash('password', 10);
const valida = await bcrypt.compare('password', hash);  // true
```

---

### BD / Base de Datos
Almacenamiento de datos estructurado. En el proyecto:
- **Motor**: MySQL
- **Nombre**: `cafeteria`
- **Tablas**: users, productos, pedido, detalle_pedido

---

### Bidireccional
Comunicación en dos direcciones simultáneamente.
- **HTTP**: Cliente → Servidor → Cliente (unidireccional)
- **WebSocket**: Cliente ↔ Servidor (bidireccional instantáneo)

---

## C

### CORS (Cross-Origin Resource Sharing)
Mecanismo que permite requests desde diferentes dominios.

**Sin CORS**: El navegador rechaza request a otro dominio
**Con CORS**: Servidor autoriza acceso desde dominios específicos

En el proyecto:
```javascript
app.use(cors({
  origin: ['http://localhost:3000'],  // Permite solo localhost
  credentials: true
}));
```

---

### Credenciales
Información de acceso (email + contraseña, o token).

**En login**:
1. Usuario escribe credenciales
2. Servidor verifica
3. Si válidas, genera token
4. Cliente almacena token

---

### CRUD
Operaciones básicas en BD:
- **C**reate: INSERT (crear registro)
- **R**ead: SELECT (leer datos)
- **U**pdate: UPDATE (modificar)
- **D**elete: DELETE (eliminar)

**Ejemplo**: Gestionar productos es CRUD completo

---

## D

### Dependencia
Librería externa que usa el proyecto. En `package.json`:
```json
{
  "dependencies": {
    "express": "^5.2.1",
    "mysql2": "^3.20.0"
  }
}
```

Una **dependencia** es un paquete npm que el proyecto necesita.

---

### Dotenv
Librería que carga variables de ambiente desde archivo `.env`.

```javascript
require('dotenv').config();
const host = process.env.DB_HOST;  // "localhost" (desde .env)
```

---

### Driver
Software que permite comunicación entre aplicación y hardware/servicio.

**Ejemplo**: `mysql2` es el driver que conecta Node.js con MySQL

---

## E

### Endpoint
Punto de acceso de la API. URL específica que acepta requests.

**En Cafetería U**:
- `GET /productos` - obtener productos
- `POST /login` - iniciar sesión
- `PUT /pedido/:id` - actualizar pedido

Formato: `[MÉTODO] /ruta`

---

### Entorno
Contexto de ejecución. Valores en `.env`:
- **development**: Desarrollo (logs verbosos)
- **production**: Producción (optimizado)

Se configura: `NODE_ENV=development`

---

### Error Handling
Manejo de errores en código.

```javascript
try {
  const datos = await fetch('/datos');
} catch (error) {
  console.error('Error:', error);
  // Mostrar mensaje usuario
}
```

---

## F

### Frontend
Código del navegador (lado cliente). En el proyecto:
- Carpeta `public/` completa
- HTML, CSS, Vanilla JavaScript
- Interactúa con usuario

**Opuesto**: Backend (servidor)

---

### Framework
Estructura base para desarrollar. En el proyecto:
- **Express.js**: Framework para Node.js
- No UI framework (no React, Vue, Angular)

---

## G

### GET (HTTP Method)
Obtener datos. No modifica.

```
GET /productos         → Obtener lista productos
GET /pedido/:id        → Ver detalle pedido
GET /admin/reportes    → Ver reportes admin
```

---

### Hash
Conversión de texto a cadena fija imposible de revertir.

**Ejemplo**:
```
Entrada: "miContraseña"
Hash: "$2b$10$Bx1w5WMDTx8Vz9KaL2I.Se.QLfVqbLlVqO8D9yF5G6H7I8J9K0L1m"
Entrada: "otrosloEntra"
Hash: "$2b$10$DifferentHashCompletamente..."
```
Cada vez diferente, nunca reversible.

---

## I

### Índice (Index)
En BD, acelera búsquedas. Sin índice, busca cada registro. Con índice, acceso rápido.

```sql
CREATE INDEX idx_email ON usuarios(email);
-- Búsqueda rápida por email
```

---

### Inserción (INSERT)
Agregar registro nuevo a BD.

```sql
INSERT INTO usuarios (nombre, email) 
VALUES ('Juan', 'juan@test.com');
```

---

## J

### JSON (JavaScript Object Notation)
Formato de datos legible por humanos y máquinas.

```json
{
  "id": 1,
  "nombre": "Café",
  "precio": 1.50,
  "disponible": true
}
```

---

### JWT (JSON Web Token)
Token para autenticación sin guardar sesión en servidor.

**Estructura**: `Header.Payload.Signature`

**Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI...`

**Uso**:
1. Usuario login → servidor genera JWT
2. Cliente guarda en localStorage
3. Siguientes requests, envía JWT en header
4. Servidor verifica y autoriza

---

## L

### Localhost
Dirección para acceder servidor local.

- **localhost** o **127.0.0.1**: Tu máquina
- **puerto 3000**: El puerto donde corre el servidor

**URL**: `http://localhost:3000`

---

### localStorage
Almacenamiento en navegador (no servidor).

```javascript
// Guardar
localStorage.setItem('mi_carrito', JSON.stringify(cart));

// Obtener
const cart = JSON.parse(localStorage.getItem('mi_carrito'));

// Eliminar
localStorage.removeItem('mi_carrito');
```

**Ventaja**: Persiste entre refreshes pagina
**Desventaja**: Solo texto, no seguro para contraseñas

---

## M

### Middleware
Función que procesa requests antes de llegar a ruta.

```javascript
app.use(cors());                      // Middleware CORS
app.use(express.json());              // Middleware JSON parser
app.post('/protected', authenticate, handler);  // Middleware custom
```

---

### Método HTTP
Tipo de operación sobre recurso:
- **GET**: Obtener
- **POST**: Crear
- **PUT**: Actualizar
- **DELETE**: Eliminar

---

### MySQL
Base de datos relacional (requiere MySQL instalado).

**Tipos de datos**:
- INT: números completos
- VARCHAR: texto variable
- DECIMAL: números con decimales
- TIMESTAMP: fecha y hora
- ENUM: opciones limitadas

---

## N

### Node.js
Entorno JavaScript que corre en servidor (no navegador).

**Permite**: Usar JavaScript en backend

**Instalación**: `npm install` (Node Package Manager)

---

### npm (Node Package Manager)
Gestor de dependencias de Node.js.

```bash
npm install package-name      # Instalar
npm install                   # Instalar todas (package.json)
npm update                    # Actualizar
npm list                      # Ver instaladas
```

---

## O

### Objeto
Estructura de datos con propiedades.

```javascript
const usuario = {
  id: 1,
  nombre: "Juan",
  email: "juan@test.com",
  tipo: "cliente"
};

console.log(usuario.nombre);  // "Juan"
```

---

## P

### Package.json
Archivo de configuración del proyecto Node.js.

Contiene:
```json
{
  "name": "cafeteria-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { ... },
  "dependencies": { ... }
}
```

---

### Pool
Conjunto de conexiones a BD reutilizables.

**Sin pool**: Cada request crea conexión (lento)
**Con pool**: 10 conexiones compartidas (rápido)

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost'
});
```

---

### POST (HTTP Method)
Enviar/crear datos.

```
POST /register           → Crear cuenta
POST /pedido-completo    → Crear pedido
POST /admin/productos    → Crear producto
```

---

### Prepared Statement
Query SQL parametrizado (previene SQL injection).

```javascript
//  Inseguro:
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

//  Seguro:
const [rows] = await pool.query(
  'SELECT * FROM usuarios WHERE email = ?',
  [email]
);
// El ? es el parámetro, email es valor seguro
```

---

### Promesa (Promise)
Objeto que representa resultado futuro (eventual).

```javascript
new Promise((resolve, reject) => {
  setTimeout(() => resolve('listo'), 1000);
})
.then(result => console.log(result))
.catch(error => console.error(error));
```

---

### PUT (HTTP Method)
Actualizar datos existentes.

```
PUT /pedido/:id          → Cambiar estado pedido
PUT /admin/productos/:id → Editar producto
```

---

## R

### Ruta (Route)
Punto de acceso del API. Define `[MÉTODO] /camino`.

```javascript
app.get('/productos', (req, res) => {
  // Manejador de ruta
});
```

---

### REST (Representational State Transfer)
Arquitectura de API estándar.

**Principios**:
- URL = recurso (`/productos`, `/pedidos`)
- Método = operación (GET, POST, PUT, DELETE)
- Stateless = sin sesión servidor

---

## S

### Salt
Valor aleatorio agregado antes de hashear (bcrypt).

```
Contraseña: "password123"
Salt: algo_aleatorio
↓
Hash: bcrypt.hash(password, salt)

Resultado: imposible predecir o revertir
```

---

### Servidor (Server)
Programa que responde requests. En el proyecto:
- `server.js` inicia servidor Express.js
- Escucha puerto 3000
- Procesa requests HTTP y WebSocket

---

### Socket.io
Librería para WebSockets (conexión bidireccional tiempo real).

```javascript
const io = require('socket.io')(server);

// Servidor emite a clientes
io.emit('nuevo_pedido', { pedido_id: 123 });

// Cliente escucha
socket.on('nuevo_pedido', (data) => {
  console.log('Nuevo pedido:', data);
});
```

---

### SQL (Structured Query Language)
Lenguaje para queries a BD.

```sql
SELECT * FROM productos WHERE disponible = 1;
INSERT INTO usuarios (nombre, email) VALUES ('Juan', 'juan@test.com');
UPDATE productos SET stock = stock - 1 WHERE id = 5;
DELETE FROM productos WHERE id = 10;
```

---

### SQL Injection
Ataque inyectando código SQL malicioso.

```javascript
//  Vulnerable:
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
// Si email = "' OR '1'='1" → retorna todos usuarios

//  Protegido:
const [rows] = await pool.query(
  'SELECT * FROM usuarios WHERE email = ?',
  [email]
);
// Prepared statement previene inyección
```

---

## T

### Token
Cadena que identifica al usuario (JWT).

**Formato**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0...`

**Almacenaje**: localStorage
**Envío**: Header `Authorization: Bearer <token>`
**Expiración**: 1 día

---

### Transacción
Grupo de operaciones BD que se completan juntas o nada.

```javascript
await connection.beginTransaction();
try {
  await query1();
  await query2();
  await connection.commit();  // ✓ Ambas se ejecutan
} catch (error) {
  await connection.rollback(); // ✗ Ninguna se ejecuta
}
```

---

### Tunnel / Portforward
Conectar servidor remoto como si fuera local.

**Uso**: Conectar BD MySQL remota
```bash
ssh -L 3306:servidor-remoto.com:3306 usuario@servidor-remoto.com
```

---

## U

### URL (Uniform Resource Locator)
Dirección web completa.

**Estructura**:
```
http://localhost:3000/productos?search=cafe
│      │         │    │            │             │
│      │         │    └─ ruta      │             │
│      │         └────────────────────────────────── puerto
│      └── protocolo
└─ http (o https en producción)
```

---

### UUID (Unique Universal Identifier)
Identificador único universal de 128 bits.

**No usado en proyecto** (usamos Auto-increment de MySQL)

---

## V

### Validación
Verificar que datos sean correctos antes de procesarlos.

```javascript
// Validar email
if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Email inválido' });
}

// Validar cantidad > 0
if (cantidad <= 0) {
  throw new Error('Cantidad inválida');
}
```

---

### Variable de Entorno
Configuración cargada desde sistema/archivo `.env`.

```javascript
const port = process.env.PORT || 3000;
const secret = process.env.JWT_SECRET;
```

**Archivo**: `.env` (no commitear)

---

## W

### WebSocket
Protocolo para conexión bidireccional persistente.

**HTTP**: Cliente → Servidor → Cliente (cada request-response)
**WebSocket**: Cliente ↔ Servidor (conexión abierta, datos fluyen)

**Uso en proyecto**: Socket.io para actualizaciones tiempo real

---

## X

### XSS (Cross-Site Scripting)
Vulnerabilidad donde atacante inyecta JavaScript malicioso.

```javascript
//  Vulnerable:
element.innerHTML = userData;  // Si userData = "<script>alert('hacked')</script>"

//  Seguro:
element.textContent = userData;  // O usar esc() function
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
```

---

## Z

### Zen (Filosofía)
"Simpler is better" - código limpio y comprensible.

En el proyecto:
- Vanilla JS sobre frameworks complejos
- Código bien comentado
- Estructura clara de carpetas

---

## Abreviaturas Comunes

| Abreviatura | Significa |
|-------------|-----------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DB | Database |
| JWT | JSON Web Token |
| SQL | Structured Query Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HTTP Secure (con SSL/TLS) |
| CORS | Cross-Origin Resource Sharing |
| XSS | Cross-Site Scripting |
| CSV | Comma-Separated Values |
| JSON | JavaScript Object Notation |
| XML | eXtensible Markup Language |
| URL | Uniform Resource Locator |
| URI | Uniform Resource Identifier |

---

## Símbolos Técnicos

| Símbolo | Significado | Ejemplo |
|---------|-------------|---------|
| `=>` | Arrow function | `() => { }` |
| `...` | Spread operator | `{...objeto}` |
| `?` | Parámetro SQL | `WHERE id = ?` |
| `@` | En SQL | `@variable = value` |
| `$` | Variable en template | `` `Hola ${nombre}` `` |
| `$2b$` | Algoritmo bcrypt | Hash bcrypt |

---

## Prefijos HTTP Status

| Código | Significado | Ejemplos |
|--------|-------------|----------|
| 2xx | Éxito | 200 OK, 201 Created |
| 3xx | Redirección | 301 Moved, 304 Not Modified |
| 4xx | Error cliente | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| 5xx | Error servidor | 500 Internal Server Error |

---

**Última actualización**: 2026  
**Versión**: 1.0  
**Términos**: 100+

¿No encuentras un término? Ctrl+F para buscar 
