# 📋 INFORMACIÓN COMPLETA DEL PROYECTO TECHPC

## 🎯 Descripción del Proyecto
**TechPC** es una aplicación web de tipo ecommerce para una tienda de computadores y tecnología. Permite a los usuarios registrarse, iniciar sesión, navegar por productos y servicios, y realizar compras. Cuenta con paneles diferenciados para administradores, empleados y clientes.

A partir del **quinto avance** la aplicación incorpora gestión comercial completa: registro e historial de ventas, facturación, reportes diarios en PDF y Excel, dashboards con gráficos diferenciados por rol, módulo de PQR (peticiones, quejas y reclamos), chatbot de atención al cliente integrado con Inteligencia Artificial y despliegue en la nube.

---

## 📁 ESTRUCTURA DEL PROYECTO

### Raíz del Proyecto
```
├── backend-fastapi/            # Backend con Python + FastAPI (cuarto y quinto avance)
├── frontend/                   # Frontend con React + Vite + Tailwind CSS
├── docs/                       # Documentación técnica de los avances
│   └── DOCUMENTACION_QUINTO_AVANCE.md
├── .gitignore                  # Archivos ignorados por Git
├── .venv/                      # Entorno virtual Python del backend FastAPI
└── INFORMACION_PROYECTO.md     # Este documento
```

> **Nota:** el backend anterior con Node.js + Express (tercer avance) fue eliminado
del proyecto; la versión vigente y única es `backend-fastapi/`.

---

## 🐍 API (Backend - FastAPI) - CUARTO AVANCE

### Ubicación: `backend-fastapi/`

> **Nota:** En el cuarto avance el backend se reescribió con **Python + FastAPI**.
> La carpeta `backend/` (Node.js + Express) se conserva como referencia del tercer avance.

### Estructura:
```
backend-fastapi/
├── .env                        # Variables de entorno (NO compartir)
├── .env.example                # Plantilla de variables de entorno
├── requirements.txt            # Dependencias de Python
├── database.sql                # Script SQL de la base de datos (incluye permisos)
├── TechPC_FastAPI.postman_collection.json  # Colección Postman FastAPI
├── TechPC_FastAPI.postman_environment.json # Ambiente Postman FastAPI
├── run.py                      # Punto de entrada (uvicorn)
└── app/
    ├── main.py                 # App FastAPI (CORS, routers, docs Swagger)
    ├── config.py               # Variables de entorno
    ├── database.py             # Conexión SQLAlchemy + sesiones
    ├── models.py               # Modelos ORM (SQLAlchemy)
    ├── schemas.py              # Esquemas Pydantic (validaciones)
    ├── security.py             # bcrypt, JWT y dependencias de roles
    └── routers/
        ├── auth.py             # /api/auth (login, me, roles)
        ├── usuarios.py         # /api/usuarios (registro + CRUD)
        ├── productos.py        # /api/productos (CRUD + categorías)
        └── servicios.py        # /api/servicios (CRUD)
```

### Configuración del Servidor:
- **Puerto:** 8000 (configurable en `.env`)
- **CORS:** Habilitado para comunicación Frontend-Backend
- **Documentación automática (Swagger):** http://127.0.0.1:8000/docs

### Endpoints Disponibles (FastAPI):

#### Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/auth/login` | Iniciar sesión (retorna JWT) | No |
| GET | `/api/auth/me` | Obtener perfil del usuario | Sí (JWT) |
| GET | `/api/auth/roles` | Obtener lista de roles | Sí (JWT) |

#### Usuarios (`/api/usuarios`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/usuarios/registro` | Registrar usuario nuevo | No |
| GET | `/api/usuarios` | Listar todos los usuarios | Sí (Admin) |
| GET | `/api/usuarios/{id}` | Consultar usuario por ID | Sí (Admin) |
| PUT | `/api/usuarios/{id}` | Actualizar usuario | Sí (Admin) |
| PATCH | `/api/usuarios/{id}/estado` | Cambiar estado (activo/inactivo) | Sí (Admin) |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario | Sí (Admin) |

#### Productos (`/api/productos`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/productos` | Listar productos | No |
| GET | `/api/productos/{id}` | Obtener producto por ID | No |
| GET | `/api/productos/categorias` | Listar categorías | No |
| POST | `/api/productos` | Crear nuevo producto | Sí (Admin/Empleado) |
| PUT | `/api/productos/{id}` | Actualizar producto | Sí (Admin/Empleado) |
| DELETE | `/api/productos/{id}` | Eliminar producto | Sí (Admin) |

#### Servicios (`/api/servicios`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/servicios` | Listar servicios | No |
| GET | `/api/servicios/{id}` | Obtener servicio por ID | No |
| POST | `/api/servicios` | Crear nuevo servicio | Sí (Admin/Empleado) |
| PUT | `/api/servicios/{id}` | Actualizar servicio | Sí (Admin/Empleado) |
| DELETE | `/api/servicios/{id}` | Eliminar servicio | Sí (Admin) |

---

## 🛒 API DEL QUINTO AVANCE (Ventas, Facturación, PQR y Chatbot)

### Nuevos archivos del backend FastAPI
```
backend-fastapi/app/
├── routers/
│   ├── ventas.py       # /api/ventas (registro, historial y reportes)
│   ├── facturas.py     # /api/facturas (generación, consulta y PDF)
│   ├── pqr.py          # /api/pqr (peticiones, quejas y reclamos)
│   ├── chat.py         # /api/chat (chatbot de atención)
│   └── dashboard.py    # /api/dashboard (indicadores y estadísticas)
└── utils/
    ├── numeracion.py     # Consecutivos V-AAAAMMDD-0001 / F-AAAAMMDD-0001
    ├── serializadores.py # Conversión de modelos ORM a JSON
    ├── reportes.py       # Reporte diario PDF/Excel y factura en PDF
    └── ia.py             # Chatbot con IA + motor local de respaldo
```

### Endpoints nuevos:

#### Ventas (`/api/ventas`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/ventas` | Registrar venta con su detalle | Sí (JWT) |
| GET | `/api/ventas` | Historial con filtros | Sí (JWT) |
| GET | `/api/ventas/{id}` | Consultar una venta | Sí (JWT) |
| PATCH | `/api/ventas/{id}/estado` | Cambiar estado | Sí (Admin/Empleado) |
| DELETE | `/api/ventas/{id}` | Eliminar venta | Sí (Admin) |
| GET | `/api/ventas/reporte/diario` | Reporte diario (JSON) | Sí (Admin/Empleado) |
| GET | `/api/ventas/reporte/diario/pdf` | Reporte diario en PDF | Sí (Admin/Empleado) |
| GET | `/api/ventas/reporte/diario/excel` | Reporte diario en Excel | Sí (Admin/Empleado) |

#### Facturas (`/api/facturas`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/facturas` | Generar factura desde una venta | Sí (Admin/Empleado) |
| GET | `/api/facturas` | Consultar facturas con filtros | Sí (JWT) |
| GET | `/api/facturas/{id}` | Consultar una factura | Sí (JWT) |
| GET | `/api/facturas/{id}/pdf` | Descargar la factura en PDF | Sí (JWT) |
| PATCH | `/api/facturas/{id}/estado` | Cambiar estado | Sí (Admin/Empleado) |

#### Dashboards (`/api/dashboard`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/dashboard/admin` | Indicadores consolidados | Sí (Admin) |
| GET | `/api/dashboard/empleado` | Indicadores comerciales | Sí (Admin/Empleado) |
| GET | `/api/dashboard/cliente` | Resumen del cliente | Sí (JWT) |
| GET | `/api/dashboard/ventas` | Series para los gráficos | Sí (Admin/Empleado) |
| GET | `/api/dashboard/filtros` | Listas para los filtros | Sí (Admin/Empleado) |

#### PQR (`/api/pqr`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/pqr` | Registrar una solicitud | Sí (JWT) |
| GET | `/api/pqr` | Listar solicitudes | Sí (JWT) |
| GET | `/api/pqr/{id}` | Consultar el estado | Sí (JWT) |
| PATCH | `/api/pqr/{id}` | Gestionar (estado y respuesta) | Sí (Admin/Empleado) |
| DELETE | `/api/pqr/{id}` | Eliminar solicitud | Sí (Admin) |

#### Chatbot (`/api/chat`)
| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/chat/info` | Bienvenida y estado de la IA | No |
| POST | `/api/chat` | Enviar mensaje y recibir respuesta | No |
| GET | `/api/chat/conversaciones` | Historial de conversaciones | Sí (JWT) |
| GET | `/api/chat/conversaciones/{id}` | Mensajes de una conversación | Sí (JWT) |

**Total: 48 operaciones documentadas en Swagger** (`http://127.0.0.1:8000/docs`).

---

## 🗄️ BASE DE DATOS

### Configuración:
- **Motor:** MySQL
- **Nombre:** `techpc_db`
- **Archivo de creación:** `backend/database.sql`

### Tablas Principales:

#### permisos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(50) | Nombre del permiso (único) |
| descripcion | VARCHAR(150) | Descripción |

#### rol_permisos (relación N:M)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| rol_id | INT (FK) | Referencia a roles |
| permiso_id | INT (FK) | Referencia a permisos |

**Permisos por defecto:** gestion_usuarios, gestion_productos, gestion_servicios, ver_panel_admin, ver_panel_empleado, ver_panel_cliente

#### roles
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(30) | Nombre del rol |
| descripcion | VARCHAR(100) | Descripción del rol |

**Roles por defecto:** administrador, empleado, cliente

#### usuarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(50) | Nombre del usuario |
| apellido | VARCHAR(50) | Apellido del usuario |
| tipo_documento | VARCHAR(5) | CC, TI, CE, PP |
| numero_documento | VARCHAR(12) | Número de documento (único) |
| direccion | VARCHAR(80) | Dirección |
| telefono | VARCHAR(16) | Teléfono |
| correo | VARCHAR(80) | Correo electrónico (único) |
| contrasena | VARCHAR(255) | Contraseña hasheada (bcrypt) |
| rol_id | INT (FK) | Referencia a tabla roles |
| estado | ENUM | 'activo' o 'inactivo' |
| fecha_registro | TIMESTAMP | Fecha de creación |

#### categorias_productos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(50) | Nombre de la categoría |
| descripcion | VARCHAR(150) | Descripción |

**Categorías por defecto:** Procesadores, Tarjetas Gráficas, Memoria RAM, Almacenamiento, Motherboards, Fuentes de Poder, Gabinetes, Monitores, Periféricos

#### productos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre del producto |
| descripcion | TEXT | Descripción detallada |
| precio | DECIMAL(12,2) | Precio |
| stock | INT | Cantidad disponible |
| imagen_url | VARCHAR(255) | URL de imagen |
| categoria_id | INT (FK) | Referencia a categorias_productos |
| estado | ENUM | 'activo' o 'inactivo' |
| fecha_creacion | TIMESTAMP | Fecha de creación |

#### servicios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| nombre | VARCHAR(100) | Nombre del servicio |
| descripcion | TEXT | Descripción detallada |
| precio | DECIMAL(12,2) | Precio |
| duracion_estimada | VARCHAR(50) | Duración estimada |
| imagen_url | VARCHAR(255) | URL de imagen |
| estado | ENUM | 'activo' o 'inactivo' |
| fecha_creacion | TIMESTAMP | Fecha de creación |

**Servicios por defecto:** Ensamblaje de PC, Instalación de Software, Mantenimiento Preventivo, Diagnóstico Técnico, Actualización de Componentes

### Tablas incorporadas en el quinto avance:

#### ventas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| numero_venta | VARCHAR(20) | Consecutivo V-AAAAMMDD-0001 (único) |
| cliente_id | INT (FK) | Cliente de la venta |
| usuario_id | INT (FK) | Usuario que registró la operación |
| subtotal | DECIMAL(12,2) | Suma de los ítems sin impuestos |
| descuento | DECIMAL(12,2) | Descuentos aplicados |
| impuestos | DECIMAL(12,2) | IVA calculado |
| total | DECIMAL(12,2) | Total de la venta |
| metodo_pago | VARCHAR(30) | efectivo, tarjeta, transferencia |
| estado | ENUM | pendiente, pagada, anulada |
| fecha | DATETIME | Fecha y hora de la venta |

#### detalle_ventas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| venta_id | INT (FK) | Venta a la que pertenece |
| tipo | ENUM | producto o servicio |
| producto_id / servicio_id | INT (FK) | Ítem comercializado |
| descripcion | VARCHAR(150) | Nombre del ítem |
| cantidad | INT | Cantidad vendida |
| precio_unitario | DECIMAL(12,2) | Precio al momento de la venta |
| descuento | DECIMAL(12,2) | Descuento del ítem |
| subtotal | DECIMAL(12,2) | cantidad × precio − descuento |

#### facturas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| numero_factura | VARCHAR(20) | Consecutivo F-AAAAMMDD-0001 (único) |
| venta_id | INT (FK) | Venta facturada (relación 1:1) |
| cliente_id | INT (FK) | Cliente facturado |
| subtotal, descuento, impuestos, total | DECIMAL(12,2) | Valores de la factura |
| metodo_pago | VARCHAR(30) | Forma de pago |
| estado | ENUM | emitida, pagada, anulada |
| fecha | DATETIME | Fecha de emisión |

#### detalle_facturas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| factura_id | INT (FK) | Factura a la que pertenece |
| descripcion | VARCHAR(150) | Descripción del ítem |
| cantidad | INT | Cantidad |
| precio_unitario | DECIMAL(12,2) | Precio congelado |
| descuento | DECIMAL(12,2) | Descuento aplicado |
| subtotal | DECIMAL(12,2) | Subtotal de la línea |

#### pqr
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| usuario_id | INT (FK) | Cliente que registra la solicitud |
| tipo | ENUM | peticion, queja, reclamo |
| asunto | VARCHAR(120) | Título de la solicitud |
| descripcion | TEXT | Detalle de la solicitud |
| estado | ENUM | pendiente, en_proceso, respondida, cerrada |
| respuesta | TEXT | Respuesta del equipo |
| fecha_creacion / fecha_actualizacion | TIMESTAMP | Trazabilidad |

#### conversaciones y mensajes
| Tabla | Campo | Tipo | Descripción |
|-------|-------|------|-------------|
| conversaciones | id | INT (PK) | Identificador de la conversación |
| conversaciones | usuario_id | INT (FK) | Usuario (opcional, permite visitantes) |
| conversaciones | titulo | VARCHAR(120) | Título tomado del primer mensaje |
| mensajes | conversacion_id | INT (FK) | Conversación a la que pertenece |
| mensajes | rol | ENUM | usuario o asistente |
| mensajes | contenido | TEXT | Texto del mensaje |

---

## 🔐 SEGURIDAD

### JWT (JSON Web Tokens):
- Los tokens se generan al iniciar sesión
- Duración: 24 horas
- Se almacenan en localStorage del navegador
- Se envían en header `Authorization: Bearer <token>`

### Hashing de Contraseñas:
- Se utiliza **bcryptjs** para hashear contraseñas
- Las contraseñas NUNCA se almacenan en texto plano
- Salt rounds: 10

### Middlewares de Seguridad:
- **authMiddleware:** Verifica que el token JWT sea válido
- **authorize(...roles):** Controla acceso por roles

### Roles de Usuario:
1. **Administrador** (rol_id: 1)
   - Gestión total del sistema
   - CRUD de usuarios, productos y servicios
   - Acceso a todas las funcionalidades

2. **Empleado** (rol_id: 2)
   - Gestión parcial del sistema
   - CRUD de productos y servicios
   - Sin gestión de usuarios

3. **Cliente** (rol_id: 3)
   - Acceso a funcionalidades de cliente
   - Visualización de productos y servicios
   - Gestión de perfil propio

### Usuario Admin por Defecto:
- **Correo:** admin@techpc.com
- **Contraseña:** Admin123*

---

## ⚛️ FRONTEND (React + Vite + Tailwind CSS)

### Ubicación: `frontend/`

### Estructura del Frontend:
```
frontend/
├── index.html                  # Archivo HTML principal
├── package.json                # Dependencias del frontend
├── vite.config.js              # Configuración de Vite
├── .oxlintrc.json              # Configuración linting
├── README.md                   # Documentación del frontend
├── public/                     # Archivos estáticos
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/
└── src/
    ├── App.jsx                 # Componente principal con rutas
    ├── main.jsx                # Punto de entrada
    ├── index.css               # Estilos globales
    ├── assets/
    │   └── images/             # Imágenes del proyecto
    ├── components/
    │   ├── Button.jsx          # Botón reutilizable
    │   ├── Carousel.jsx        # Carrusel de 10 imágenes
    │   ├── CartSidebar.jsx     # Sidebar del carrito
    │   ├── CheckoutModal.jsx   # Registrar la venta desde el carrito
    │   ├── Chatbot.jsx         # Chatbot flotante de atención con IA
    │   ├── DarkModeToggle.jsx  # Toggle modo oscuro
    │   ├── Footer.jsx          # Pie de página
    │   ├── Header.jsx          # Cabecera/Navbar
    │   ├── Input.jsx           # Input reutilizable
    │   ├── PasswordStrength.jsx # Indicador de fortaleza
    │   ├── ProductDetail.jsx   # Detalle de producto
    │   ├── RecoverPassword.jsx # Recuperar contraseña
    │   ├── RegisterModal.jsx   # Modal de registro
    │   ├── Select.jsx          # Select reutilizable
    │   ├── SwitchAccountModal.jsx # Cambiar cuenta
    │   ├── WhatsAppButton.jsx  # Botón flotante WhatsApp
    │   ├── charts/
    │   │   ├── BarChart.jsx    # Gráfico de barras (SVG)
    │   │   └── LineChart.jsx   # Gráfico lineal (SVG)
    │   ├── dashboard/
    │   │   └── StatCard.jsx    # Tarjeta de indicador (Card)
    │   ├── comercial/
    │   │   ├── DashboardPanel.jsx   # Dashboard de admin y empleado
    │   │   ├── DashboardCliente.jsx # Dashboard del cliente
    │   │   ├── VentasPanel.jsx      # Historial de ventas con filtros
    │   │   ├── VentasModal.jsx      # Registrar venta con detalle
    │   │   ├── FacturasPanel.jsx    # Consulta y descarga de facturas
    │   │   ├── ReportsPanel.jsx     # Reporte diario PDF/Excel
    │   │   └── PqrPanel.jsx         # Módulo de PQR
    │   └── layout/
    │       ├── DesktopNav.jsx  # Navegación escritorio
    │       ├── Logo.jsx        # Logo de la empresa
    │       ├── MobileNav.jsx   # Navegación móvil
    │       └── ProfileMenu.jsx # Menú de perfil
    ├── context/
    │   ├── AuthContext.jsx     # Context de autenticación
    │   ├── CartContext.jsx     # Context del carrito
    │   └── CartDrawerContext.jsx # Context del drawer
    ├── data/
    │   ├── carouselData.js     # Datos del carrusel (10 imágenes)
    │   └── productsData.js     # Datos de productos
    ├── hooks/
    │   └── useDarkMode.js      # Hook modo oscuro
    ├── pages/
    │   ├── Index.jsx           # Página principal
    │   ├── QuienesSomos.jsx    # Página ¿Quiénes Somos?
    │   ├── Contacto.jsx        # Página de contacto
    │   ├── Login.jsx           # Página de inicio de sesión
    │   ├── RecoverPasswordPage.jsx # Página recuperar contraseña
    │   ├── PCBuilder.jsx       # Constructor de PC
    │   ├── admin/
    │   │   ├── AdminPanel.jsx  # Panel administrador
    │   │   ├── UsersTab.jsx    # Gestión de usuarios
    │   │   ├── ProductsTab.jsx # Gestión de productos
    │   │   └── ServicesTab.jsx # Gestión de servicios
    │   ├── employee/
    │   │   └── EmployeePanel.jsx # Panel empleado
    │   └── client/
    │       ├── ClientPanel.jsx # Panel cliente
    │       ├── ProductsClientTab.jsx # Productos cliente
    │       ├── ProfileTab.jsx  # Perfil cliente
    │       ├── ServicesClientTab.jsx # Servicios cliente
    │       └── SwitchAccountTab.jsx # Cambiar cuenta
    └── utils/
        ├── api.js              # URL base API y helpers
        ├── format.js           # Funciones de formato
        └── validations.js      # Validaciones de formularios
```

### Rutas del Frontend:
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Index | Página principal |
| `/quienes-somos` | QuienesSomos | Página ¿Quiénes Somos? |
| `/contacto` | Contacto | Página de contacto |
| `/armar-pc` | PCBuilder | Constructor de PC |
| `/login` | Login | Inicio de sesión |
| `/recuperar-password` | RecoverPasswordPage | Recuperar contraseña |
| `/admin` | AdminPanel | Panel administrador |
| `/empleado` | EmployeePanel | Panel empleado |
| `/cliente` | ClientPanel | Panel cliente |

---

## 🚀 CÓMO EJECUTAR EL PROYECTO

### Prerrequisitos:
- Node.js (v18 o superior)
- MySQL Server
- npm o yarn

### 1. Configurar Base de Datos:
```bash
# Instalación limpia (crea techpc_db con todas las tablas del quinto avance)
mysql -u root -p < backend-fastapi/database.sql

# Si ya tienes la base de datos del cuarto avance, aplica la migración
# (solo agrega tablas y datos del quinto avance, es idempotente)
mysql -u root -p techpc_db < backend-fastapi/migracion_quinto_avance.sql
```

### 2. Configurar Backend (FastAPI):
```bash
cd backend-fastapi

# Crear entorno virtual (si no existe)
python -m venv venv
venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno: copiar .env.example a .env y ajustar
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=techpc_db
# JWT_SECRET=tu_secreto_super_seguro
# PORT=8000

# Iniciar servidor (FastAPI + Uvicorn)
python run.py
```

### 3. Configurar Frontend:
```bash
# Ir a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Acceder a la Aplicación:
- **Frontend:** http://localhost:5173
- **API (FastAPI):** http://localhost:8000/api
- **Documentación Swagger:** http://127.0.0.1:8000/docs

---

## 🧪 PRUEBAS CON POSTMAN

### Archivos Postman:
- `backend/TechPC.postman_collection.json` - Colección de endpoints
- `backend/TechPC.postman_environment.json` - Variables de entorno

### Flujo de Prueba:
1. Registrar usuario nuevo (`POST /api/auth/register`)
2. Iniciar sesión (`POST /api/auth/login`)
3. Copiar token de respuesta
4. Usar token en headers para endpoints protegidos
5. Probar CRUD de usuarios, productos y servicios

### Headers para endpoints protegidos:
```
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

---

## 📱 FUNCIONALIDADES IMPLEMENTADAS

### Primer Avance (React + Vite):
✅ Proyecto React con Vite
✅ React Router DOM
✅ Componentes: Header, Footer, Carousel (10 imágenes)
✅ Páginas: Index, Quiénes Somos, Contacto

### Segundo Avance (Tailwind CSS + Formularios):
✅ Integración de Tailwind CSS
✅ Módulo de inicio de sesión
✅ Modal de registro de clientes
✅ Componente recuperar contraseña
✅ Validaciones en tiempo real
✅ Componentes reutilizables (Input, Select, Button, etc.)
✅ Uso de React Hooks (useState, useEffect)

### Tercer Avance (Full Stack):
✅ Backend con Node.js + Express (API)
✅ Base de datos SQL relacional
✅ Autenticación JWT
✅ Hashing de contraseñas (bcryptjs)
✅ Panel de administrador
✅ Panel de empleado
✅ Panel de cliente
✅ Operaciones CRUD completas
✅ Componente WhatsApp flotante
✅ Conexión Frontend-API-BD
✅ Control de roles y permisos
✅ Usuario autenticado visible en Navbar

### Cuarto Avance (FastAPI):
✅ Backend reescrito con Python + FastAPI
✅ Entorno virtual Python configurado (.venv)
✅ Archivo requirements.txt con dependencias registradas
✅ Base de datos SQL completada (tablas permisos y rol_permisos)
✅ Modelos ORM (SQLAlchemy) diferenciados de los esquemas Pydantic
✅ Esquemas con validación de tipos, longitudes, formatos, correos y contraseñas
✅ Conexión a la BD mediante variables de entorno (.env)
✅ Registro de clientes conectado con la base de datos (hash bcrypt)
✅ Inicio de sesión conectado con FastAPI (JWT)
✅ Autenticación JWT (python-jose) con expiración de 24 horas
✅ Protección de endpoints mediante dependencias
✅ Control de roles en el Backend (administrador, empleado, cliente)
✅ Endpoints CRUD de usuarios, productos y servicios en español
✅ Frontend actualizado para consumir la API FastAPI (puerto 8000)
✅ Validaciones en Frontend y Backend
✅ Documentación automática Swagger en http://127.0.0.1:8000/docs
✅ Colección Postman para el backend FastAPI

### Quinto Avance (Gestión comercial, analítica, despliegue e IA):
✅ Base de datos ampliada con ventas, detalle de ventas, facturas, detalle de facturas, PQR, conversaciones y mensajes
✅ Módulo de ventas con registro de productos y servicios vendidos (cantidades, precios, descuentos, subtotal, impuestos, total, fecha, estado)
✅ Descuento automático de stock y cálculo del IVA (19 %) en el backend
✅ Historial de ventas con filtros por fecha, cliente, producto, servicio, estado, número y rango de valor
✅ Reporte diario de ventas en JSON
✅ Exportación del reporte diario a PDF (ReportLab)
✅ Exportación del reporte diario a Excel .xlsx (openpyxl)
✅ Módulo de facturación: generación de facturas a partir de una venta con detalle congelado
✅ Consulta de facturas por número, cliente, fecha y estado
✅ Descarga de facturas en PDF
✅ Dashboard administrativo con tarjetas de indicadores (usuarios, productos, servicios, ventas, facturación y PQR)
✅ Dashboard de ventas con gráfico de barras y gráfico lineal
✅ Dashboards diferenciados por rol (administrador, empleado y cliente)
✅ Filtros para los dashboards (fecha inicial, fecha final, producto, servicio, estado y cliente)
✅ 28 nuevos endpoints en FastAPI documentados en Swagger
✅ Los dashboards consumen la API: no hay datos escritos a mano en React
✅ Módulo de PQR con estados pendiente, en proceso, respondida y cerrada
✅ Chatbot «TechBot» integrado al sitio web con widget flotante
✅ Integración del chatbot con IA mediante API compatible con OpenAI, configurada desde FastAPI
✅ Motor local de reglas como respaldo cuando no hay clave de IA o el servicio falla
✅ Gestión segura de la API Key mediante variables de entorno (.env)
✅ Configuración de CORS por variable de entorno para el despliegue
✅ Archivos de despliegue: Procfile (FastAPI), vercel.json y _redirects (React + Vite)
✅ Documentación técnica del quinto avance en docs/DOCUMENTACION_QUINTO_AVANCE.md
✅ Colección Postman actualizada con ventas, facturas, dashboards, PQR y chatbot

---

## 📂 UBICACIÓN DE ARCHIVOS IMPORTANTES

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| **API** | | |
| Configuración Express | `backend/api/app.js` | Middlewares y rutas |
| Servidor | `backend/api/server.js` | Inicio del servidor |
| Config BD | `backend/api/config/db.js` | Conexión MySQL |
| Controlador Auth | `backend/api/controllers/auth.controller.js` | Lógica de autenticación |
| Controlador Productos | `backend/api/controllers/producto.controller.js` | Lógica de productos |
| Controlador Servicios | `backend/api/controllers/servicio.controller.js` | Lógica de servicios |
| Modelo Usuario | `backend/api/models/usuario.model.js` | Consultas de usuarios |
| Modelo Producto | `backend/api/models/producto.model.js` | Consultas de productos |
| Modelo Servicio | `backend/api/models/servicio.model.js` | Consultas de servicios |
| Rutas Auth | `backend/api/routes/auth.routes.js` | Endpoints de autenticación |
| Rutas Productos | `backend/api/routes/producto.routes.js` | Endpoints de productos |
| Rutas Servicios | `backend/api/routes/servicio.routes.js` | Endpoints de servicios |
| Script SQL | `backend/database.sql` | Creación de BD y tablas |
| Variables de entorno | `backend/.env` | Configuración del servidor |
| **Frontend** | | |
| App Principal | `frontend/src/App.jsx` | Componente raíz React |
| Context Auth | `frontend/src/context/AuthContext.jsx` | Estado de autenticación |
| API URL | `frontend/src/utils/api.js` | URL base del backend (http://localhost:8000/api) |
| **Backend FastAPI** | | |
| App Principal | `backend-fastapi/app/main.py` | App FastAPI con CORS y routers |
| Modelos ORM | `backend-fastapi/app/models.py` | Tablas con SQLAlchemy |
| Esquemas | `backend-fastapi/app/schemas.py` | Validaciones Pydantic |
| Seguridad | `backend-fastapi/app/security.py` | bcrypt, JWT y roles |
| Rutas Auth | `backend-fastapi/app/routers/auth.py` | Login, perfil y roles |
| Rutas Usuarios | `backend-fastapi/app/routers/usuarios.py` | Registro y CRUD de usuarios |
| Rutas Productos | `backend-fastapi/app/routers/productos.py` | CRUD de productos |
| Rutas Servicios | `backend-fastapi/app/routers/servicios.py` | CRUD de servicios |
| Script SQL | `backend-fastapi/database.sql` | Creación de BD y tablas (incluye permisos) |
| Variables de entorno | `backend-fastapi/.env` | Configuración del servidor |
| Validaciones | `frontend/src/utils/validations.js` | Validaciones de formularios |
| Datos Carrusel | `frontend/src/data/carouselData.js` | Imágenes del carrusel |
| Datos Productos | `frontend/src/data/productsData.js` | Productos de ejemplo |
| **Quinto avance** | | |
| Router Ventas | `backend-fastapi/app/routers/ventas.py` | Registro, historial y reportes de ventas |
| Router Facturas | `backend-fastapi/app/routers/facturas.py` | Generación, consulta y PDF de facturas |
| Router PQR | `backend-fastapi/app/routers/pqr.py` | Peticiones, quejas y reclamos |
| Router Chatbot | `backend-fastapi/app/routers/chat.py` | Atención al cliente con IA |
| Router Dashboard | `backend-fastapi/app/routers/dashboard.py` | Indicadores y estadísticas |
| Reportes PDF/Excel | `backend-fastapi/app/utils/reportes.py` | Documentos del reporte y las facturas |
| Motor del chatbot | `backend-fastapi/app/utils/ia.py` | Integración con IA y respaldo local |
| Migración SQL | `backend-fastapi/migracion_quinto_avance.sql` | Actualizar una BD existente |
| Gráficos | `frontend/src/components/charts/` | Barras y lineal en SVG |
| Chatbot (frontend) | `frontend/src/components/Chatbot.jsx` | Widget flotante de atención |
| Checkout | `frontend/src/components/CheckoutModal.jsx` | Registrar la venta desde el carrito |
| Paneles comerciales | `frontend/src/components/comercial/` | Dashboards, ventas, facturas y PQR |
| Documentación | `docs/DOCUMENTACION_QUINTO_AVANCE.md` | Documentación técnica del avance |

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

### Frontend:
- React 19
- Vite 8
- React Router DOM 7
- Tailwind CSS 4

### Backend (API) - Cuarto Avance (FastAPI):
- Python 3
- FastAPI (framework REST)
- Uvicorn (servidor ASGI)
- SQLAlchemy (ORM)
- Pydantic (esquemas y validaciones)
- PyMySQL (driver MySQL)
- bcrypt (hashing de contraseñas)
- python-jose (JWT)
- python-dotenv (variables de entorno)
- email-validator (validación de correos)
- **ReportLab** (generación de reportes y facturas en PDF)
- **openpyxl** (generación del reporte en Excel .xlsx)
- **httpx** (cliente HTTP para la integración del chatbot con la API de IA)

### Base de Datos:
- MySQL

---

## 📝 NOTAS IMPORTANTES

1. **Variables de entorno:** Nunca subir el archivo `.env` a repositorios públicos
2. **Contraseñas:** Siempre usar hashing (bcryptjs) - NUNCA texto plano
3. **JWT:** Configurar un secreto fuerte en producción
4. **CORS:** Configurar orígenes permitidos en producción
5. **Backup:** Realizar respaldos periódicos de la base de datos
6. **API:** El backend es la API, se ejecuta con `python run.py` en `backend-fastapi/`
7. **IA:** La clave `IA_API_KEY` se configura solo en el `.env`; si queda vacía el chatbot usa el motor local de reglas
8. **Despliegue:** configurar `CORS_ORIGINS` con la URL pública del frontend y `VITE_API_URL` con la del backend

---

## 👥 EQUIPO DE DESARROLLO

- **Proyecto:** TechPC - Tienda de Tecnología
- **Ficha:** 3406204
- **Trimestre:** 03
- **Competencia:** React
- **Instructor:** Jhan Hader Muñoz

---

*Documento generado automáticamente para el proyecto TechPC*
*Fecha: Septiembre 2026*
