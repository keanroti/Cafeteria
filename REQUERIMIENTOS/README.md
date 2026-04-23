#  Cafetería U - Sistema de Pedidos Universitario

## Descripción General
Sistema de pedidos anticipados para la cafetería de la Universidad de Concepción (PGC Facultad de Ingeniería). 
Permite a estudiantes hacer pedidos sin esperar en fila, con seguimiento en tiempo real y menú actualizable.

---

##  Requerimientos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

1. **Node.js** (v16 o superior)
   - Descarga desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **MySQL** (v5.7 o superior)
   - Windows: https://dev.mysql.com/downloads/mysql/
   - macOS: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server`
   - Verificar instalación: `mysql --version`

3. **Git** (opcional, para clonar repositorio)
   - Descarga desde: https://git-scm.com/

---

##  Pasos de Instalación

### 1. Preparar la Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar en MySQL CLI:
CREATE DATABASE cafeteria;
USE cafeteria;

# Crear tablas
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tipo ENUM('cliente', 'cafeteria') DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  disponible TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  estado ENUM('pendiente', 'preparando', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
  total DECIMAL(10, 2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);
```

### 2. Configurar Variables de Entorno

```bash
# En la raíz del proyecto, copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=cafeteria
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura
NODE_ENV=development
PORT=3000
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar el Servidor

```bash
# Modo desarrollo
npm run dev

# O modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

##  URLs de Acceso

Una vez el servidor está corriendo:

- **Inicio/Login**: http://localhost:3000/
- **Menú**: http://localhost:3000/menu.html (requiere login)
- **Registro**: En la página de inicio (botón "Crear cuenta")
- **Panel Admin**: http://localhost:3000/admin.html (solo para cuentas tipo "cafeteria")
- **Estado de Pedidos**: http://localhost:3000/estado.html (requiere login)
- **Carrito**: http://localhost:3000/carrito.html (requiere login)

### Crear un Usuario Admin (para acceder a panel administrativo)

```bash
# Conectar a MySQL
mysql -u root -p cafeteria

# Insertar usuario admin (cambiar contraseña):
# Primero instalar bcrypt localmente y crear el hash:
# En Node.js: require('bcrypt').hashSync('password', 10)

INSERT INTO usuarios (nombre, email, password_hash, tipo) 
VALUES ('Admin Cafetería', 'admin@cafeteria.com', '$2b$10/...hash_aqui...', 'cafeteria');
```

---

##  Estructura del Proyecto

```
cafeteria-backend2/
├── server.js              # Servidor principal Node.js/Express
├── package.json           # Dependencias y scripts
├── package-lock.json      # Lock file de dependencias
├── .env                   # Variables de entorno (NO COMPROMETER)
├── REQUERIMIENTOS/        # Esta carpeta con documentación
│   ├── README.md          # Este archivo
│   ├── ESTRUCTURA.md      # Detalle de arquitectura
│   ├── DEPENDENCIAS.md    # Lista de paquetes npm
│   └── .env.example       # Ejemplo de configuración
└── public/                # Archivos estáticos del frontend
    ├── index.html         # Página de login
    ├── menu.html          # Página del menú
    ├── carrito.html       # Página del carrito
    ├── estado.html        # Página de estado de pedidos
    ├── admin.html         # Panel administrativo
    ├── register.html      # Página de registro
    ├── css/
    │   └── styles.css     # Estilos globales
    └── js/
        ├── app.js         # Funciones comunes (carrito, auth)
        ├── auth.js        # Lógica de autenticación
        ├── menu.js        # Lógica de carga de productos
        ├── carrito.js     # Lógica del carrito de compras
        ├── estado.js      # Seguimiento de pedidos
        └── admin.js       # Funciones del panel admin
```

---

##  Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Base de Datos**: MySQL
- **Autenticación**: JWT + Bcrypt
- **WebSockets**: Socket.io (actualizaciones en tiempo real)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Validación**: Email, contraseñas, datos de entrada

---

##  Notas Importantes

1. **Variables de Entorno**: Nunca comprometas tu archivo `.env`. Está incluido en `.gitignore`.
2. **JWT_SECRET**: Usa una clave larga y aleatoria en producción.
3. **Base de Datos**: Asegúrate de que MySQL esté corriendo antes de iniciar la aplicación.
4. **Puerto**: Si ya usas puerto 3000, cambia `PORT` en el `.env`.
5. **CORS**: Actualmente configurado para localhost. Cambiar en `server.js` para producción.

---

##  Características de Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración de 1 día
- Validación de email
- Protección contra XSS en frontend
- Autenticación en todas las rutas sensibles
- Roles de usuario (cliente/cafeteria)

---

##  Troubleshooting

### Error: "Connection refused" (MySQL)
- Verificar que MySQL está corriendo
- Revisar credenciales en `.env`

### Error: "Port 3000 already in use"
- Cambiar `PORT` en `.env`
- O matar el proceso: `lsof -ti:3000 | xargs kill -9`

### Error: "Cannot find module"
- Correr `npm install` nuevamente

### WebSockets no funcionan
- Verificar que Socket.io está instalado: `npm list socket.io`
- Revisar CORS en `server.js`

---

##  Variables de Entorno Disponibles

```
DB_HOST          # Host de MySQL (default: localhost)
DB_USER          # Usuario de MySQL (default: root)
DB_PASSWORD      # Contraseña de MySQL (default: vacío)
DB_NAME          # Nombre base de datos (default: cafeteria)
JWT_SECRET       # Clave secreta para tokens JWT
NODE_ENV         # Entorno (development/production)
PORT             # Puerto del servidor (default: 3000)
```

---

## 🎯 Flujo de Uso

1. **Usuario se registra** en `index.html`
2. **Inicia sesión** con email y contraseña
3. **Ve el menú** de productos disponibles
4. **Agrega productos al carrito** (se guarda en localStorage)
5. **Realiza el pedido** desde la página del carrito
6. **Sigue estado del pedido** en la página de pedidos
7. **Admin gestiona pedidos** desde panel administrativo

---

Versión del proyecto: 1.0.0 | PGC UdeC Facultad de Ingeniería
