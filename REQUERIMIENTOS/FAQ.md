#  Preguntas Frecuentes (FAQ)

## General

### ¿Para qué sirve Cafetería U?
Sistema que permite a estudiantes hacer pedidos de comida sin esperar en fila. Piden con anticipación, y cuando está listo, lo retiran.

### ¿Quién hizo esto?
Proyecto académico de la Facultad de Ingeniería, Universidad de Cundinamarca (PGC).
-Kevin Andres Rojas Ticora

### ¿Es código de producción?
Sí, es completamente funcional. Sin embargo, en producción real necesitaría:
- HTTPS en lugar de HTTP
- Rate limiting y validaciones adicionales
- Backups de BD automáticos
- Monitoreo y logs centralizados

### ¿Puedo usar este código en mi cafetería?
Sí, el código está en MIT/ISC. Puedes adaptarlo libremente.

---

## Instalación

### ¿Qué necesito para ejecutar?
1. Node.js v16+
2. MySQL v5.7+
3. ~500MB de disco (con node_modules)
4. ~128MB RAM mínimo

### ¿Cuánto tiempo toma instalar?
- Primero: 30-45 minutos (leer docs + instalar)
- Siguientes: 5 minutos (npm install + npm start)

### ¿Necesito internet para que funcione?
No, es completamente local. Pero:
- Las fuentes (Google Fonts) necesitan internet
- En producción remote sí necesita conexión

### ¿Puedo instalar en Windows/Mac/Linux?
Sí, completamente compatible con los tres.

### ¿Cómo instalo en Windows?
```
1. Descarga Node.js desde nodejs.org
2. Descarga MySQL desde dev.mysql.com
3. Copia COMO_EJECUTAR.md y sigue pasos
4. En PowerShell: npm start
```

### ¿Cómo instalo en Mac?
```
1. brew install node
2. brew install mysql
3. Sigue COMO_EJECUTAR.md
4. En Terminal: npm start
```

### ¿Cómo instalo en Linux?
```
1. sudo apt-get install nodejs
2. sudo apt-get install mysql-server
3. Sigue COMO_EJECUTAR.md
4. En Terminal: npm start
```

---

## Base de Datos

### ¿Necesito crear la BD manualmente?
Sí, las tablas no se crean automáticamente. Ver COMO_EJECUTAR.md paso 1.

### ¿Dónde anotó los datos de conexión?
En archivo `.env` - cambiar valores según tu MySQL.

### ¿Qué pasa si pierdo los datos de BD?
Se pierden todos los usuarios y pedidos. Por eso hacer backups regularmente:
```sql
mysqldump -u root -p cafeteria > backup.sql
mysql -u root -p cafeteria < backup.sql
```

### ¿Puedo usar BD remota en lugar de local?
Sí, en `.env` cambiar `DB_HOST=dominio.com` en lugar de `localhost`.

### ¿Cuál es la contraseña por defecto de MySQL?
`root` no tiene contraseña en instalación local. En producción, configurarla en `.env`.

---

## Autenticación & Seguridad

### ¿Cómo funcionan las contraseñas?
```
Usuario escribe: "hola123"
↓
Aplicación con bcrypt.hash() → "$2b$10$xyz123..."
↓
Se guarda en BD ese hash
↓
Siguiente login, bcrypt.compare() verifica si coincide
```
La contraseña NUNCA se guarda en texto plano.

### ¿Qué es JWT?
Token que identifica al usuario sin guardar sesión en servidor.
```
Login: servidor genera token "eyJhbGc..."
↓
Cliente guarda en localStorage
↓
Siguiente request, envía en header
↓
Servidor verifica y autoriza
```

### ¿Los tokens caducan?
Sí, después de 1 día (configurable en `server.js`).

### ¿Es seguro localStorage?
Para desarrollo sí. En producción real, usar httpOnly cookies.

### ¿Cómo creo un usuario administrador?
```bash
mysql -u root -p cafeteria
INSERT INTO usuarios (nombre, email, password_hash, tipo)
VALUES ('Admin', 'admin@test.com', '$2b$10/..hash..', 'cafeteria');
```

### ¿Qué pasa si alguien roba el JWT?
Pueden usarlo como ese usuario por 1 día. Solución:
- Usar HTTPS (encriptación de tráfico)
- Reducir expiración (30 min en lugar de 1 día)
- Implementar refresh tokens

---

## Desarrollo & Código

### ¿Debo usar nodemon para desarrollo?
No es obligatorio, pero ayuda:
```bash
npm install -g nodemon
nodemon server.js  # Auto-restart al cambiar archivos
```

### ¿Dónde agrego nuevas rutas?
En `server.js`, antes de línea final `server.listen()`:
```javascript
app.post('/nueva-ruta', (req, res) => {
  res.json({ mensaje: 'funciona' });
});
```

### ¿Cómo agrego validación de email?
Ya existe función `isValidEmail()` en server.js.

### ¿Puedo usar TypeScript?
Sí, pero requiere `tsc` compilador. No incluido en proyecto.

### ¿Cómo pruebo la API?
Con Postman, Insomnia o curl (ver COMO_EJECUTAR.md TestingSection).

---

## Frontend

### ¿Por qué vanilla JavaScript y no React?
Proyecto educativo. Vanilla JS enseña fundamentos.
Migración a React necesitaría refactorizar todo.

### ¿Cómo agrego un nuevo botón?
En HTML agregas `<button>`.
En JS agregas listener:
```javascript
document.querySelector('button').addEventListener('click', () => {
  console.log('clickeado');
});
```

### ¿Cómo cambio los colores?
En `public/css/styles.css`, buscar variables CSS:
```css
:root {
  --primary: #7C5CFC;  /* color principal */
  --accent: #00D9FF;   /* color accent */
  ...
}
```

### ¿Cómo agrego un nuevo producto desde código?
```javascript
fetch('/admin/productos', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    nombre: 'Nuevo',
    precio: 5.00,
    stock: 10,
    disponible: 1
  })
});
```

### ¿Por qué algunos datos se guardan en localStorage?
Carrito: necesita persistir entre páginas
Usuario: necesita recordar sesión

---

## Funcionalidad

### ¿Cómo agrego categorías de productos?
BD actualmente no las tiene. Opciones:
1. Agregar columna `categoria` a tabla `productos`
2. Crear tabla nueva `categorias` y referenciar
3. Filtrar con búsqueda (ya implementado)

### ¿Cómo activo promociones/descuentos?
No está implementado. Sería:
1. Agregar tabla `promociones`
2. Modificar cálculo de total en `/pedido-completo`
3. UI para seleccionar cupón

### ¿Cómo envío notificaciones?
No está implementado. Opciones:
- Email: Usar nodemailer
- SMS: Usar Twilio
- Push: Usar service workers

### ¿Cómo agrego horarios de apertura?
Ejemplo:
```javascript
const ahora = new Date().getHours();
if (ahora < 10 || ahora > 18) {
  return res.json({ error: 'Cafetería cerrada' });
}
```

### ¿Qué pasa si un producto se agota?
`stock` llega a 0, y validación impide pedir más.

---

## WebSockets & Tiempo Real

### ¿Realmente funciona en tiempo real?
Sí, Socket.io establece conexión bidireccional. Cuando admin cambia estado, cliente ve instantáneamente.

### ¿Qué pasa si se corta conexión?
Socket.io intenta reconectar automáticamente.

### ¿Funciona en móvil?
Sí, Socket.io es compatible con navegadores móviles.

### ¿Puedo usar otro servicio de WebSockets?
Sí, como Firebase Realtime Database. Requeriría refactorizar `socket.io`.

---

## Performance

### ¿Es rápido?
Para 100-1000 usuarios concurrentes, sí. Para 10,000+ necesitaría:
- Caché (Redis)
- Load balancing
- BD replicada
- Cloud hosting

### ¿Cómo optimizo consultas largas?
Agregar índices en BD:
```sql
ALTER TABLE productos ADD INDEX(disponible);
ALTER TABLE pedido ADD INDEX(usuario_id);
```

### ¿Puedo usar compresión?
Sí, instalar `compression`:
```bash
npm install compression
```

---

## Errores Comunes

### Error: "connect ECONNREFUSED"
MySQL no está corriendo.
```bash
# Windows:
net start MySQL80

# Mac:
brew services start mysql
```

### Error: "Port 3000 already in use"
Otro programa usa puerto 3000.
- Cambiar puerto en .env: `PORT=3001`
- O matar proceso: `lsof -ti:3000 | xargs kill -9`

### Error: "Cannot find module 'express'"
Dependencias no instaladas.
```bash
npm install
```

### Error: "Unexpected token } in JSON"
JSON malformado en request. Verificar sintaxis en body.

### Token expira constantemente
Cambiar expiración en server.js:
```javascript
{ expiresIn: '7d' }  // 7 días en lugar de 1 día
```

### Carrito se borra al refrescar
localStorage es por dominio. Si cambias URL, se borra.

---

## Despliegue

### ¿Cómo despliego a producción?
1. Cambiar NODE_ENV=production en .env
2. Usar servicio cloud (Heroku, AWS, DigitalOcean)
3. Instalar certificado HTTPS
4. Configurar dominio

### ¿Cuánto cuesta hostear?
- DigitalOcean: $5-20/mes
- AWS: Free tier o $10+/mes
- Heroku: Gratuito (lento) o $7+/mes

### ¿Qué incluye el hosting?
Servidor, BD, certificado HTTPS (algunos).

### ¿Cómo actualizo código en producción?
```bash
git pull
npm install  # si hay nuevas dependencias
npm start
```

---

## Mantenimiento

### ¿Qué necesito monitorear?
- CPU y memoria del servidor
- Espacio de disco
- Logs de errores
- Conexiones a BD
- Uptime

### ¿Cuándo actualizar dependencias?
Cada 3-6 meses, pero con cuidado:
```bash
npm outdated
npm update
npm audit fix
```

### ¿Cómo manejo backups?
```bash
# Backup:
mysqldump -u root -p cafeteria > backup_$(date +%Y%m%d).sql

# Restore:
mysql -u root -p cafeteria < backup_20240101.sql
```

### ¿Debo hacer testing?
Sí, especialmente antes de actualizaciones:
- Testing manual en navegador
- Testing con herramientas (Jest, Mocha)
- Testing de BD

---

## Support & Contacto

### ¿Dónde reporto bugs?
GitHub issues del repositorio (si lo subes a GitHub).

### ¿Hay documentación API?
Ver [ESTRUCTURA.md](ESTRUCTURA.md) - sección "API REST".

### ¿Para qué es la carpeta REQUERIMIENTOS?
Para toda la documentación que acabas de leer. Empieza con [INDICE.md](INDICE.md).

### ¿Hay ejemplos de uso?
Sí, en [COMO_EJECUTAR.md](COMO_EJECUTAR.md) - sección "Testing de rutas".

---

## Términos Técnicos Explicados

| Término | Significa |
|---------|-----------|
| **JWT** | Token de autenticación sin servidor |
| **Hash** | Conversión irreversible (bcrypt) |
| **API** | Interfaz para comunicarse servidor-cliente |
| **CORS** | Permite requests de otros dominios |
| **WebSocket** | Conexión bidireccional instantánea |
| **SQL Injection** | Ataque inyectando código SQL |
| **XSS** | Ataque inyectando JavaScript |
| **Pool** | Conjunto de conexiones reutilizables |
| **Prepared Statement** | Query parametrizada (segura) |
| **Middleware** | Función que procesa requests |

---

## Recursos Útiles

### Documentación
- Node.js: https://nodejs.org/docs/
- Express: https://expressjs.com/
- MySQL: https://dev.mysql.com/doc/
- Socket.io: https://socket.io/docs/

### Herramientas
- Postman: https://www.postman.com/ (testing API)
- MySQL Workbench: https://www.mysql.com/products/workbench/
- VS Code: https://code.visualstudio.com/

### Tutoriales
- Node.js: freeCodeCamp en YouTube
- Express: Traversy Media
- MySQL: LinkedIn Learning

---

## Métrica Rápida

Pregunta más frecuente: "¿Cómo instalo?"  
Respuesta: [COMO_EJECUTAR.md](COMO_EJECUTAR.md) pasos 1-5 (15 min)

Segunda más frecuente: "¿Qué librerías necesito?"  
Respuesta: `npm install` automático (5 min)

Tercera: "¿Es seguro?"  
Respuesta: Sí, con JWT + bcrypt + validaciones. Ver [ESTRUCTURA.md](ESTRUCTURA.md)

---

## ¿No encontraste tu pregunta?

1. Revisa [INDICE.md](INDICE.md) - tabla de búsqueda
2. Lee el documento más relevante (ej: código → código en ESTRUCTURA.md)
3. Busca con Ctrl+F la palabra clave
4. Consulta documentación oficial (links arriba)

---

**Última actualización**: 2026  
**Versión**: 1.0  
**Estado**:  Todas las preguntas comunes respondidas


