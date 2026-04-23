#  RESUMEN EJECUTIVO DEL PROYECTO

##  **Cafetería U** - Sistema de Pedidos Universitarios

---

##  ¿Qué Hace Este Proyecto?

Sistema completo de pedidos en línea para la cafetería universitaria PGC (Sede Concepción, Universidad de Concepción).

**Problema que resuelve**: Evitar que estudiantes hagan filas largas esperando su comida. Pueden pedir con anticipación y retirar cuando esté listo.

---

##  Dos Tipos de Usuarios

### 1. **Cliente (Estudiante)**
- Crear cuenta y iniciar sesión
- Ver menú diario de productos
- Buscar/filtrar productos
- Agregar al carrito
- Confirmar pedido
- Seguimiento en tiempo real del estado (pendiente → preparando → listo → entregado)
- Recibir actualizaciones automáticas

### 2. **Administrador (Staff de Cafetería)**
- Acceso exclusivo a panel administrativo
- Ver todos los pedidos activos
- Cambiar estado de pedidos (pendiente → preparando → listo)
- Gestionar catálogo: agregar/editar/eliminar productos
- Ver gráficos de ventas
- KPIs del día (total de pedidos, ingresos, producto más popular)
- Historial de pedidos

---

##  Arquitectura Técnica

```
FRONTEND (Cliente)
├─ Navegador Web
├─ HTML5 + CSS3 + Vanilla JavaScript
├─ Almacenamiento: localStorage (carrito)
└─ WebSockets para actualizaciones en vivo

        ↕ HTTP + WebSocket

BACKEND (Server)
├─ Node.js + Express.js
├─ Puerto: 3000
├─ Autenticación: JWT + Bcrypt
├─ WebSockets: Socket.io (eventos en tiempo real)
└─ Validación: Email, stock, transacciones

        ↕ SQL Queries

BASE DE DATOS (MySQL)
├─ usuarios (información de usuarios)
├─ productos (menú)
├─ pedido (órdenes principales)
└─ detalle_pedido (items en cada orden)
```

---

##  Carpetas Principales

| Carpeta | Contenido | Propósito |
|---------|-----------|-----------|
| `/public/` | HTML, CSS, JS | Frontend (interfaz usuario) |
| `/public/js/` | `app.js`, `auth.js`, `menu.js`, etc. | Lógica JavaScript |
| `/public/css/` | `styles.css` | Diseño responsivo |
| `/REQUERIMIENTOS/` | Documentación | Esta carpeta (guías + setup) |
| `server.js` | Código del servidor | API REST + WebSockets |
| `.env` | Configuración | Credenciales sensibles |

---

##  Cómo Ejecutar (3 Pasos Básicos)

### **Paso 1: Preparar MySQL**
```bash
mysql -u root -p
# Dentro de MySQL:
CREATE DATABASE cafeteria;
USE cafeteria;
# Ejecutar script SQL (ver COMO_EJECUTAR.md)
```

### **Paso 2: Configurar .env**
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cafeteria
JWT_SECRET=cambiar_esto_en_produccion
```

### **Paso 3: Ejecutar Servidor**
```bash
npm install       # Primera vez
npm start         # Inicia servidor
# Abre: http://localhost:3000
```

---

##  Endpoints Principales

### **Autenticación**
| Método | Ruta | Parámetros | Descripción |
|--------|------|-----------|------------|
| POST | `/register` | nombre, email, password | Crear cuenta |
| POST | `/login` | email, password | Obtener token JWT |

### **Productos**
| Método | Ruta | Descripción |
|--------|------|------------|
| GET | `/productos` | Listar menú disponible |

### **Pedidos (Usuario)**
| Método | Ruta | Descripción |
|--------|------|------------|
| POST | `/pedido-completo` | Crear nuevo pedido |
| GET | `/pedido-usuario/:id` | Ver mis pedidos |
| GET | `/pedido/:id` | Ver detalle pedido |

### **Administración**
| Método | Ruta | Descripción |
|--------|------|------------|
| GET | `/admin/productos` | Listar todos productos |
| POST | `/admin/productos` | Crear producto |
| PUT | `/admin/productos/:id` | Editar producto |
| DELETE | `/admin/productos/:id` | Eliminar producto |
| PUT | `/pedido/:id` | Cambiar estado pedido |
| GET | `/admin/reportes/ventas-diarias` | Gráfico ventas |
| GET | `/admin/reportes/kpis` | Métricas del día |

---

##  Seguridad

 Contraseñas hasheadas con bcrypt (salt 10)  
 Tokens JWT con expiración de 1 día  
 Validación de email  
 Prevención de XSS (escapado de caracteres)  
 Prepared statements (prevenir SQL injection)  
 Roles de usuario (cliente/cafeteria)  

---

##  Flujo Principal

```
1. USUARIO SE REGISTRA
   ↓
2. INICIA SESIÓN → Recibe JWT token
   ↓
3. VE MENÚ DE PRODUCTOS
   ↓
4. AGREGA AL CARRITO (localStorage)
   ↓
5. CONFIRMA PEDIDO
   ↓
6. RECIBE ID PEDIDO
   ↓
7. VE ESTADO EN TIEMPO REAL
   ↓
8. ADMIN ACTUALIZA ESTADO
   ↓
9. USUARIO VE CAMBIO AUTOMÁTICO (WebSocket)
```

---

##  Dependencias NPM Instaladas

```
express@5.2.1          → Servidor web
mysql2@3.20.0          → Base de datos
cors@2.8.6             → Cross-origin
dotenv@17.4.1          → Variables de entorno
bcrypt@6.0.0           → Hash de contraseñas
jsonwebtoken@9.0.3     → Autenticación JWT
socket.io@4.8.3        → WebSockets en tiempo real
```

---

##  Requisitos del Sistema

| Requisito | Versión | Estado |
|-----------|---------|--------|
| Node.js | 16+ | ✅ Requerido |
| MySQL | 5.7+ | ✅ Requerido |
| Git | Cualquiera | ⚠️ Opcional |

---

##  Documentación en la Carpeta REQUERIMIENTOS

| Archivo | Contenido |
|---------|----------|
| **README.md** | Guía completa de instalación y ejecución |
| **ESTRUCTURA.md** | Desglose técnico de toda la arquitectura |
| **DEPENDENCIAS.md** | Detalle de cada librería NPM |
| **COMO_EJECUTAR.md** | Paso a paso rápido para empezar |
| **.env.example** | Plantilla de configuración |

---

##  Interfaz de Usuario

### **Página de Login/Registro** (index.html)
- Formulario limpio y moderno
- Validación en tiempo real
- Opción registerse o iniciar sesión
- Visual animado con gradientes

### **Menú de Productos** (menu.html)
- Grid responsive de productos
- Búsqueda por nombre
- Carrito flotante con badge
- Agregar productos con 1 click
- Información de stock

### **Carrito** (carrito.html)
- Listar items seleccionados
- Aumentar/disminuir cantidad
- Eliminar items
- Total automático
- Botón confirmar pedido

### **Estado de Pedidos** (estado.html)
- Listar todos tus pedidos
- Ver estado actual (con colores)
- Detalles expandibles
- Actualización automática cada 5s
- Hora y fecha del pedido

### **Panel Admin** (admin.html)
- Tabs: Pedidos | Historial | Productos | Gráficos
- Grid de pedidos con colores por estado
- Cambiar estado con dropdown
- CRUD de productos (agregar/editar/eliminar)
- Gráficos de ventas (últimos 7 días)
- KPIs: Pedidos hoy, ingresos, producto top

---

##  Características Destacadas

 **Tiempo Real**: WebSockets para actualizaciones sin refrescar  
 **Seguro**: Autenticación JWT + bcrypt + validaciones  
 **Responsive**: Funciona en móvil, tablet y desktop  
 **Rápido**: Carga de productos optimizada  
 **Analytics**: Reportes y gráficos en admin  
 **Intuitive**: Interfaz clara y fácil de usar  

---

##  Solución de Problemas Comunes

| Problema | Solución |
|----------|----------|
| MySQL no conecta | Iniciar servicio MySQL |
| Puerto 3000 en uso | Cambiar a 3001 en .env |
| Dependencias faltantes | Correr `npm install` |
| Token expirado | Volver a iniciar sesión |
| Carrito vacío al cambiar página | Datos en localStorage |

---

##  Futuras Mejoras

- [ ] Forma de pago online (Stripe/PayPal)
- [ ] Notificaciones por email/SMS
- [ ] Historial de compras
- [ ] Código QR para retiro
- [ ] Integración con punto de venta
- [ ] App móvil nativa
- [ ] Rating/reseñas de productos
- [ ] Ofertas/descuentos
- [ ] Integración calendario (pedir para mañana)

---

##  Soporte y Contacto

Para dudas sobre:
- **Instalación**: Ver `COMO_EJECUTAR.md`
- **API**: Ver `ESTRUCTURA.md`
- **Dependencias**: Ver `DEPENDENCIAS.md`
- **Setup completo**: Ver `README.md`

---

##  Métricas del Proyecto

- **Líneas de código**: ~2,500
- **Archivos frontend**: 6 HTML + 6 JS + 1 CSS
- **Endpoints API**: 20+
- **Tablas BD**: 4
- **Dependencias**: 7
- **Tiempo implementación**: Proyecto educativo completo

---

##  Licencia

ISC - Proyecto académico para PGC UdeC

---

##  Checklist Antes de Usar

- [ ] MySQL instalado y corriendo
- [ ] Node.js v16+ instalado
- [ ] Archivo .env creado y configurado
- [ ] Base de datos cafeteria creada
- [ ] `npm install` ejecutado
- [ ] `npm start` sin errores
- [ ] Página index.html abre en navegador
- [ ] Puedes registrarte y loguear
- [ ] Productos cargan correctamente

---




