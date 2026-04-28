# 📊 DIAGRAMAS UML - SISTEMA CAFETERÍA

Documento con todos los diagramas UML del proyecto. Puedes exportarlos como imágenes usando:
- [Mermaid Live](https://mermaid.live)
- VS Code + Extensión "Markdown Preview Mermaid Support"
- GitHub (visualiza automáticamente)

---

## 1️⃣ DIAGRAMA DE CASOS DE USO

```mermaid
graph TB
    U["USUARIO"]
    A["ADMINISTRADOR"]
    
    subgraph Autenticación["Autenticación"]
        UC1["Registrarse"]
        UC2["Iniciar Sesión"]
    end
    
    subgraph Compra["Gestión de Compras"]
        UC3["Ver Menú"]
        UC4["Buscar Productos"]
        UC5["Agregar al Carrito"]
        UC6["Ver Carrito"]
        UC7["Modificar Cantidad"]
        UC8["Hacer Pedido"]
    end
    
    subgraph Seguimiento["Seguimiento de Pedidos"]
        UC9["Ver Estado Pedido"]
        UC10["Ver Historial Pedidos"]
    end
    
    subgraph Admin["Administración"]
        UC11["Gestionar Productos"]
        UC12["Ver Pedidos Activos"]
        UC13["Actualizar Estado Pedido"]
        UC14["Generar Reportes"]
        UC15["Consultar KPIs"]
    end
    
    U -->|realiza| UC1
    U -->|realiza| UC2
    U -->|realiza| UC3
    U -->|realiza| UC4
    U -->|realiza| UC5
    U -->|realiza| UC6
    U -->|realiza| UC7
    U -->|realiza| UC8
    U -->|realiza| UC9
    U -->|realiza| UC10
    
    A -->|realiza| UC2
    A -->|realiza| UC11
    A -->|realiza| UC12
    A -->|realiza| UC13
    A -->|realiza| UC14
    A -->|realiza| UC15
    
    UC3 -->|incluye| UC4
    UC5 -->|incluye| UC6
    UC8 -->|incluye| UC6
    UC14 -->|extiende| UC12
    UC15 -->|extiende| UC12
    
    style U fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style A fill:#e3f2fd,stroke:#1565c0,stroke-width:3px
    style Autenticación fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Compra fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Seguimiento fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Admin fill:#e0f2f1,stroke:#00695c,stroke-width:2px
```

---

## 2️⃣ DIAGRAMA DE CLASES UML

```mermaid
classDiagram
    class Usuario {
        -int id
        -string nombre
        -string email
        -string password_hash
        -enum tipo
        -datetime fecha_registro
        +login()*
        +register()*
        +logout()*
        +getPedidos() list
    }
    
    class Pedido {
        -int id
        -int usuario_id
        -datetime fecha
        -enum estado
        -decimal total
        +crearPedido()* Pedido
        +actualizarEstado(estado)* void
        +obtenerDetalles() DetallePedido[]
        +calcularTotal() decimal
    }
    
    class DetallePedido {
        -int id
        -int pedido_id
        -int producto_id
        -int cantidad
        -decimal precio_unitario
        +guardarDetalle()* void
        +calcularSubtotal() decimal
    }
    
    class Producto {
        -int id
        -string nombre
        -decimal precio
        -int stock
        -boolean disponible
        -datetime fecha_creacion
        +crearProducto()* Producto
        +actualizarProducto(datos)* void
        +eliminarProducto()* void
        +verificarStock(cantidad) boolean
    }
    
    class Carrito {
        -int usuario_id
        -CartItem[] items
        -decimal total
        +agregarProducto(p)* void
        +removerProducto(id)* void
        +incrementarCantidad(id)* void
        +decrementarCantidad(id)* void
        +limpiar()* void
        +calcularTotal() decimal
    }
    
    class CartItem {
        -int id
        -int producto_id
        -int cantidad
        -decimal precio
        +calcularSubtotal() decimal
    }
    
    class Reporte {
        -int id
        -enum tipo
        -date fecha_inicio
        -date fecha_fin
        -json datos
        +generarVentasDiarias()* Reporte
        +generarProductosPopulares()* Reporte
        +generarKPIs()* Reporte
        +exportar() PDF
    }
    
    class Autenticacion {
        -string token
        -datetime expiracion
        +generarToken(user)* string
        +verificarToken(token)* boolean
        +refrescarToken()* string
    }
    
    Usuario "1" --> "*" Pedido : realiza
    Pedido "1" --> "*" DetallePedido : contiene
    DetallePedido "*" --> "1" Producto : incluye
    Usuario "1" --> "1" Carrito : tiene
    Carrito "1" --> "*" CartItem : contiene
    CartItem "*" --> "1" Producto : referencia
    Usuario "1" --> "*" Reporte : genera
    Usuario "1" --> "1" Autenticacion : usa
```

---

## 3️⃣ DIAGRAMA DE FLUJO - HACER PEDIDO

```mermaid
flowchart TD
    A["Usuario Autenticado?"] --> B{¿Autenticado?}
    B -->|No| C["Redirigir a Login"]
    B -->|Sí| D["Ver Menú de Productos"]
    
    C --> Z["Fin"]
    
    D --> E["Agregar Productos al Carrito"]
    E --> F{¿Carrito Vacío?}
    
    F -->|Sí| G["Mostrar Error"]
    G --> Z
    
    F -->|No| H["Proceder a Checkout"]
    H --> I["Enviar Datos del Pedido"]
    I --> J["Crear Registro en BD"]
    J --> K{¿Pedido Creado?}
    
    K -->|No| L["Mostrar Error"]
    L --> Z
    
    K -->|Sí| M["Guardar Detalles de Items"]
    M --> N{¿Todos Items<br/>Guardados?}
    
    N -->|No| O["Advertencia"]
    O --> P["Limpiar Carrito"]
    
    N -->|Sí| P
    P --> Q["Redirigir a Estado Pedido"]
    Q --> Z
    
    style A fill:#e1f5ff
    style D fill:#c8e6c9
    style H fill:#c8e6c9
    style P fill:#c8e6c9
    style Q fill:#c8e6c9
    style C fill:#ffcdd2
    style G fill:#ffcdd2
    style L fill:#ffcdd2
    style O fill:#fff9c4
```

---

## 4️⃣ DIAGRAMA DE FLUJO - ADMIN: ACTUALIZAR ESTADO PEDIDO

```mermaid
flowchart TD
    A["Admin Autenticado?"] --> B{¿Es Admin?}
    B -->|No| C["Acceso Denegado"]
    B -->|Sí| D["Cargar Lista Pedidos"]
    
    C --> Z["Fin"]
    
    D --> E["Seleccionar Pedido"]
    E --> F["Abrir Detalles"]
    F --> G["Seleccionar Nuevo Estado"]
    G --> H["<b>Estados Disponibles</b><br/>pendiente → preparando → listo → entregado"]
    H --> I{¿Estado Válido?}
    
    I -->|No| J["Error: Estado Inválido"]
    J --> Z
    
    I -->|Sí| K["Actualizar en BD"]
    K --> L{¿Cambio Exitoso?}
    
    L -->|No| M["Mostrar Error"]
    M --> Z
    
    L -->|Sí| N["Refrescar Lista"]
    N --> O["Emitir WebSocket"]
    O --> P["Notificar Cliente"]
    P --> Q["Estado Actualizado"]
    Q --> Z
    
    style A fill:#e3f2fd
    style D fill:#c8e6c9
    style K fill:#c8e6c9
    style N fill:#c8e6c9
    style O fill:#b3e5fc
    style P fill:#b3e5fc
    style Q fill:#c8e6c9
    style C fill:#ffcdd2
    style J fill:#ffcdd2
    style M fill:#ffcdd2
```

---

## 5️⃣ DIAGRAMA DE SECUENCIA - HACER PEDIDO

```mermaid
sequenceDiagram
    actor Usuario
    participant Cliente as Cliente JS
    participant Servidor as Servidor Express
    participant BD as MySQL DB
    participant WebSocket as WebSocket/Admin
    
    Usuario->>Cliente: Click "Hacer Pedido"
    activate Cliente
    
    Cliente->>Servidor: POST /pedido-completo
    activate Servidor
    
    Servidor->>BD: BEGIN TRANSACTION
    activate BD
    
    Servidor->>BD: INSERT INTO pedidos
    BD-->>Servidor: pedido_id = 42
    
    loop Para cada item del carrito
        Servidor->>BD: INSERT INTO detalles_pedido
        BD-->>Servidor: ✓ Guardado
    end
    
    Servidor->>BD: COMMIT
    BD-->>Servidor: ✓ Confirmado
    deactivate BD
    
    Servidor-->>Cliente: {pedido_id: 42, estado: 'pendiente'}
    deactivate Servidor
    
    Cliente->>Cliente: Limpiar Carrito (localStorage)
    Cliente->>Usuario: Mostrar confirmación
    
    Note over WebSocket: Si hay admins conectados
    Servidor->>WebSocket: emit('nuevo_pedido', datos)
    WebSocket->>WebSocket: Notificar Admins en tiempo real
    
    deactivate Cliente
    Cliente->>Usuario: Redirigir a estado.html
```

---

## 6️⃣ DIAGRAMA DE ARQUITECTURA - SISTEMA COMPLETO

```mermaid
graph TB
    subgraph Cliente["CLIENTE - Frontend"]
        HTML["HTML Pages<br/>index.html | menu.html<br/>carrito.html | estado.html<br/>admin.html | register.html"]
        CSS["Styles.css<br/>Diseño Moderno<br/>CSS Grid & Flexbox"]
        JS["JavaScript<br/>app.js | auth.js | menu.js<br/>carrito.js | estado.js | admin.js"]
        Storage["LocalStorage<br/>Usuario | Carrito<br/>Token | Preferencias"]
    end
    
    subgraph Servidor["SERVIDOR - Backend"]
        Express["Express.js<br/>Node.js Runtime"]
        Routes["Rutas API<br/>/auth | /productos<br/>/pedidos | /admin<br/>/reportes"]
        Auth["Middleware JWT<br/>Autenticación<br/>Autorización Admin"]
        Logic["Lógica Negocio<br/>Pedidos | Productos<br/>Reportes | Validaciones"]
    end
    
    subgraph BD["BASE DE DATOS"]
        MySQL["MySQL 8.0<br/>usuarios | productos<br/>pedidos | detalles_pedido"]
    end
    
    subgraph Tiempo["TIEMPO REAL"]
        Socket["Socket.IO<br/>WebSocket Connection"]
        Events["Eventos<br/>nuevo_pedido<br/>estado_actualizado"]
    end
    
    Cliente -->|HTTPS/REST| Servidor
    Servidor -->|Query/Update| BD
    Servidor <-->|WebSocket| Socket
    Socket -->|Emit| Events
    Events -->|Notify| Cliente
    JS <-->|Read/Write| Storage
    Express -->|Usa| Auth
    Auth -->|Protege| Routes
    Routes -->|Ejecuta| Logic
    Logic -->|Accede| MySQL
    
    style Cliente fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Servidor fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style BD fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Tiempo fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

---

## 7️⃣ DIAGRAMA DE ESTADOS - CICLO DE VIDA DEL PEDIDO

```mermaid
stateDiagram-v2
    [*] --> Pendiente
    
    Pendiente: Pendiente\n(Pedido recibido)
    Pendiente --> Preparando: Admin inicia\npreparación
    
    Preparando: Preparando\n(En cocina)
    Preparando --> Listo: Pedido listo
    
    Listo: Listo\n(Listo para recoger)
    Listo --> Entregado: Cliente recoge
    
    Entregado: Entregado\n(Completado)
    Entregado --> [*]
    
    Preparando --> Cancelado: Admin cancela
    Pendiente --> Cancelado: Usuario cancela
    
    Cancelado: Cancelado\n(No procesado)
    Cancelado --> [*]
    
    note right of Pendiente
        Estado inicial del pedido
        Usuario ya pagó
    end note
    
    note right of Preparando
        El admin/cocina
        está procesando
    end note
    
    note right of Listo
        Disponible para
        que cliente recoja
    end note
    
    note right of Entregado
        Ciclo de vida
        completado exitosamente
    end note
    
    note right of Cancelado
        Pedido rechazado
        o revocado
    end note
```

---

## 8️⃣ DIAGRAMA ENTIDAD-RELACIÓN (ER) - BASE DE DATOS

```mermaid
erDiagram
    USUARIOS ||--o{ PEDIDOS : "realiza"
    USUARIOS ||--o{ REPORTES : "genera"
    PEDIDOS ||--|{ DETALLES_PEDIDO : "contiene"
    PRODUCTOS ||--o{ DETALLES_PEDIDO : "incluido_en"
    
    USUARIOS {
        int id PK
        string nombre
        string email UK
        string password_hash
        enum tipo
        datetime fecha_registro
    }
    
    PRODUCTOS {
        int id PK
        string nombre
        decimal precio
        int stock
        boolean disponible
        datetime fecha_creacion
    }
    
    PEDIDOS {
        int id PK
        int usuario_id FK
        datetime fecha
        enum estado
        decimal total
    }
    
    DETALLES_PEDIDO {
        int id PK
        int pedido_id FK
        int producto_id FK
        int cantidad
        decimal precio_unitario
    }
    
    REPORTES {
        int id PK
        int usuario_id FK
        enum tipo
        date fecha_inicio
        date fecha_fin
        json datos
        datetime fecha_generacion
    }
```

---

## 9️⃣ DIAGRAMA DE AUTENTICACIÓN Y AUTORIZACIÓN JWT

```mermaid
flowchart LR
    A["Cliente<br/>Frontend"] -->|1. Credenciales| B["Endpoint<br/>/login"]
    B -->|2. Validar| C["Buscar en BD<br/>usuarios"]
    C -->|3. Comparar<br/>bcrypt| D{¿Contraseña<br/>Válida?}
    
    D -->|No| E["Error<br/>401 Unauthorized"]
    E -->|Rechazar| A
    
    D -->|Sí| F["Generar JWT<br/>with payload"]
    F -->|include: id,tipo| G["Token JWT<br/>firmado"]
    G -->|4. Enviar token| H["LocalStorage<br/>cliente"]
    
    H -->|5. En cada request| I["Authorization:<br/>Bearer TOKEN"]
    I -->|6. Middleware| J["Verificar JWT<br/>authenticateToken"]
    J -->|7. Validar firma| K{¿Token<br/>Válido?}
    
    K -->|No/Expirado| L["403 Forbidden"]
    L -->|Rechazar| A
    
    K -->|Sí| M["Extraer payload<br/>req.user = decoded"]
    M -->|8. Verificar rol| N{¿Es Admin?}
    N -->|No| O["403<br/>No tiene permisos"]
    O -->|Rechazar| A
    
    N -->|Sí| P["Acceso a rutas<br/>protegidas"]
    P -->|9. Ejecutar| Q["Lógica del Negocio"]
    Q -->|10. Respuesta| R["200 OK<br/>+ Datos"]
    R -->|Éxito| A
    
    style A fill:#e8f5e9
    style B fill:#fff3e0
    style J fill:#fff3e0
    style F fill:#c8e6c9
    style H fill:#b3e5fc
    style P fill:#c8e6c9
    style E fill:#ffcdd2
    style L fill:#ffcdd2
    style O fill:#ffcdd2
```

---

## 📋 TABLA RESUMEN

| # | Diagrama | Tipo | Uso |
|---|----------|------|-----|
| 1 | Casos de Uso | UML Use Case | Funcionalidades y actores |
| 2 | Clases | UML Class | Estructura OOP |
| 3 | Flujo Pedido | Flowchart | Proceso de compra |
| 4 | Flujo Admin | Flowchart | Gestión de pedidos |
| 5 | Secuencia | UML Sequence | Interacción paso a paso |
| 6 | Arquitectura | Graph | Componentes del sistema |
| 7 | Estados Pedido | State Machine | Ciclo de vida |
| 8 | Base de Datos | ER Diagram | Relaciones BD |
| 9 | Autenticación | Flowchart | Seguridad JWT |

---

## 🚀 CÓMO EXPORTAR

### **Opción A: Desde GitHub**
- Sube este archivo a tu repositorio
- Los diagramas se renderizan automáticamente en README

### **Opción B: Desde Mermaid Live**
1. Copia un diagrama (bloque ` ```mermaid ` `)
2. Pega en https://mermaid.live
3. Click botón descargar → PNG/SVG

### **Opción C: Desde VS Code**
1. Instala extensión: "Markdown Preview Mermaid Support"
2. Abre este archivo
3. Ctrl+Shift+V para Preview
4. Click derecho → Save as PNG

### **Opción D: CLI (Mermaid CLI)**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i DIAGRAMAS_UML.md -o diagramas_exportados/
```

---

**Última actualización**: 28 de Abril de 2026
