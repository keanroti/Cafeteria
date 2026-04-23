#  Guía Rápida: Cómo Ejecutar el Proyecto

## 1️ Prerequisitos (Versión Rápida)

### Instalar Node.js
- Descargar desde: https://nodejs.org/ (LTS recomendado)
- Verificar: `node --version` (debe ser v16+)

### Instalar MySQL
- Windows: https://dev.mysql.com/downloads/mysql/
- Mac: `brew install mysql`
- Linux: `sudo apt-get install mysql-server`
- Verificar: `mysql --version`

---

##  Configurar Base de Datos (Primero)

### Conectar a MySQL
```bash
# Abrir terminal y conectar a MySQL
mysql -u root -p

# Dejar en blanco si no tiene contraseña (desarrollo local)
# O escribe la contraseña y presiona Enter
```

### Crear Base de Datos y Tablas
```sql
-- Crear la base de datos
CREATE DATABASE cafeteria;
USE cafeteria;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tipo ENUM('cliente', 'cafeteria') DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  disponible TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  estado ENUM('pendiente', 'preparando', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
  total DECIMAL(10, 2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de detalle de pedidos
CREATE TABLE detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Crear usuario admin
INSERT INTO usuarios (nombre, email, password_hash, tipo) 
VALUES ('Admin Cafetería', 'admin@admin.com', '$2b$10$Bx1w5WMDTx8Vz9KaL2I.Se.QLfVqbLlVqO8D9yF5G6H7I8J9K0L1m', 'cafeteria');
```

**Nota**: El hash anterior es para password: `admin123`

### Salir de MySQL
```sql
EXIT;
```

---

##  Configurar Variables de Entorno

### Crear archivo .env
```bash
# En la raíz del proyecto (misma carpeta que server.js)
# Windows: Crear archivo .env
# Mac/Linux: 
touch .env
```

### Contenido del archivo .env
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cafeteria
JWT_SECRET=mi_clave_secreta_de_desarrollo
NODE_ENV=development
PORT=3000
```

---

##  Instalar Dependencias

```bash
# En la terminal, ir a la carpeta del proyecto
cd cafeteria-backend2

# Instalar todos los paquetes npm
npm install
```

**Esperar a que termine** (puede tardar unos minutos)

Verifica que se creó carpeta `node_modules/`

---

##  Ejecutar el Servidor

```bash
# Opción 1: Modo desarrollo (recomendado)
npm run dev

# Opción 2: Modo producción
npm start
```

###  Si todo está bien, debrías ver:
```
 Conectado a MySQL
Servidor escuchando en puerto 3000
```

---

## 6️⃣ Acceder a la Aplicación

Abre en tu navegador:

- **Página de inicio**: http://localhost:3000
- **Registrarse**: Botón en página de inicio
- **Iniciar sesión**: Usa las credenciales creadas
- **Panel Admin**: http://localhost:3000/admin.html (con usuario admin)

---

##  Datos de Prueba

### Usuario Cliente (para probar como estudiante)
- **Email**: cliente@test.com
- **Contraseña**: cliente123
- Crear mediante botón "Registrarse" en index.html

### Usuario Admin (para probar panel administrativo)
- **Email**: admin@admin.com
- **Contraseña**: admin123
- Accederá automáticamente a admin.html

### Productos de Prueba
Agregar manualmente desde panel admin:
- Café Espresso - $1.50
- Sandwich - $3.00
- Sándwich de Jamón - $2.50
- Pastel de Chocolate - $2.00

---

##  Troubleshooting Rápido

###  "Error: connect ECONNREFUSED"
**Problema**: MySQL no está corriendo
**Solución**:
```bash
# Windows: Iniciar servicio MySQL
net start MySQL80

# Mac:
brew services start mysql

# Linux:
sudo service mysql start
```

###  "Port 3000 already in use"
**Problema**: Ya hay algo usando el puerto 3000
**Solución**:
```bash
# Windows: Cambiar puerto en .env
PORT=3001

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
npm start
```

###  "Cannot find module 'express'"
**Problema**: Dependencias no instaladas
**Solución**:
```bash
npm install
```

###  "Error de autenticación en MySQL"
**Problema**: Credenciales incorrectas en .env
**Solución**:
1. Verificar usuario/password en MySQL
2. Actualizar .env con valores correctos
3. Reiniciar servidor: Ctrl+C y npm start

---

##  Testing de Rutas (con Postman/Insomnia)

### 1. Registrar
```
POST http://localhost:3000/register
Headers: Content-Type: application/json
Body:
{
  "nombre": "Juan",
  "email": "juan@test.com",
  "password": "pass123"
}
```

### 2. Login
```
POST http://localhost:3000/login
Headers: Content-Type: application/json
Body:
{
  "email": "juan@test.com",
  "password": "pass123"
}

Respuesta: { "id": 1, "token": "eyJhbGc..." }
```

### 3. Obtener Productos
```
GET http://localhost:3000/productos
```

### 4. Crear Pedido (requiere token)
```
POST http://localhost:3000/pedido-completo
Headers: 
  Content-Type: application/json
  Authorization: Bearer <token_del_login>
Body:
{
  "usuario_id": 1,
  "total": 10.50,
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 1.50
    }
  ]
}
```

---

##  Flujo Completo de Prueba

1. Abre http://localhost:3000
2. Click en "Crear una cuenta"
3. Completa formulario y registra
4. Inicia sesión
5. Verás el menú de productos
6. Agrega 2-3 productos al carrito
7. Ve al carrito y confirma pedido
8. Verás el estado del pedido
9. Si eres admin, accede a http://localhost:3000/admin.html
10. Cambio estado del pedido a "listo"
11. Cliente verá el cambio en tiempo real

---

##  Checklist de Configuración

- [ ] Node.js instalado (v16+)
- [ ] MySQL instalado y corriendo
- [ ] Base de datos creada (cafeteria)
- [ ] Archivo .env creado con variables
- [ ] `npm install` ejecutado
- [ ] `npm start` o `npm run dev` funciona
- [ ] Página http://localhost:3000 abre
- [ ] Puedes registrarte y iniciar sesión
- [ ] Puedes agregar productos al carrito

---

##  Comandos Útiles

```bash
# Detener servidor
Ctrl + C

# Ver logs en tiempo real (con watch)
npm install -g nodemon
nodemon server.js

# Listar puertos en uso
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Conectar a MySQL en terminal
mysql -u root -p cafeteria
```

---


