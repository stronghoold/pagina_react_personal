# 🐍 Backend TechPC - FastAPI (Quinto Avance)

Backend de la aplicación TechPC desarrollado con **Python + FastAPI**, conectado
a la base de datos relacional **MySQL** mediante **SQLAlchemy**.

Arquitectura: `React + Vite → FastAPI → Base de Datos SQL` + Chatbot con IA

## Estructura

```
backend-fastapi/
├── .env.example          # Plantilla de variables de entorno
├── requirements.txt      # Dependencias de Python
├── database.sql          # Script de creación de la base de datos (instalación limpia)
├── migracion_quinto_avance.sql # Migración idempotente sobre una BD existente
├── Procfile              # Comando de arranque para el despliegue
├── run.py                # Punto de entrada (uvicorn)
└── app/
    ├── main.py           # App FastAPI (CORS, routers, docs)
    ├── config.py         # Variables de entorno (BD, JWT, CORS e IA)
    ├── database.py       # Conexión SQLAlchemy + sesiones
    ├── models.py         # Modelos ORM (tablas)
    ├── schemas.py        # Esquemas Pydantic (validaciones)
    ├── security.py       # bcrypt, JWT y dependencias de roles
    ├── routers/
    │   ├── auth.py       # /api/auth (login, me, roles)
    │   ├── usuarios.py   # /api/usuarios (registro + CRUD)
    │   ├── productos.py  # /api/productos (CRUD + categorías)
    │   ├── servicios.py  # /api/servicios (CRUD)
    │   ├── ventas.py     # /api/ventas (registro, historial y reportes)
    │   ├── facturas.py   # /api/facturas (generación, consulta y PDF)
    │   ├── pqr.py        # /api/pqr (peticiones, quejas y reclamos)
    │   ├── chat.py       # /api/chat (chatbot con IA)
    │   └── dashboard.py  # /api/dashboard (indicadores y estadísticas)
    └── utils/
        ├── numeracion.py     # Consecutivos de ventas y facturas
        ├── serializadores.py # Conversión de modelos a JSON
        ├── reportes.py       # Reportes PDF/Excel y factura en PDF
        └── ia.py             # Chatbot con IA + motor local de respaldo
```

## Cómo ejecutar

```bash
# 1. Crear la base de datos (incluye las tablas del quinto avance)
mysql -u root -p < database.sql

# Si YA tienes la base de datos del cuarto avance, usa la migración:
#   mysql -u root -p techpc_db < migracion_quinto_avance.sql
# (solo agrega las tablas y los datos del quinto avance, no borra nada)

# 2. Crear entorno virtual e instalar dependencias
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# 3. Configurar variables de entorno (.env)
# Copiar .env.example a .env y ajustar credenciales
# IA_API_KEY se deja vacía si aún no hay proveedor de IA configurado

# 4. Iniciar el servidor
python run.py
```

- **API:** http://127.0.0.1:8000
- **Documentación Swagger:** http://127.0.0.1:8000/docs

## Endpoints principales

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | /api/usuarios/registro | Público |
| POST | /api/auth/login | Público |
| GET | /api/usuarios | Admin |
| PUT | /api/usuarios/{id} | Admin |
| PATCH | /api/usuarios/{id}/estado | Admin |
| DELETE | /api/usuarios/{id} | Admin |
| GET | /api/productos | Público |
| POST | /api/productos | Admin/Empleado |
| PUT | /api/productos/{id} | Admin/Empleado |
| DELETE | /api/productos/{id} | Admin |
| GET | /api/servicios | Público |
| POST | /api/servicios | Admin/Empleado |
| DELETE | /api/servicios/{id} | Admin |
| POST | /api/ventas | Autenticado |
| GET | /api/ventas | Autenticado |
| GET | /api/ventas/reporte/diario | Admin/Empleado |
| GET | /api/ventas/reporte/diario/pdf | Admin/Empleado |
| GET | /api/ventas/reporte/diario/excel | Admin/Empleado |
| POST | /api/facturas | Admin/Empleado |
| GET | /api/facturas | Autenticado |
| GET | /api/facturas/{id}/pdf | Autenticado |
| GET | /api/dashboard/admin | Admin |
| GET | /api/dashboard/empleado | Admin/Empleado |
| GET | /api/dashboard/cliente | Autenticado |
| GET | /api/dashboard/ventas | Admin/Empleado |
| POST | /api/pqr | Autenticado |
| GET | /api/pqr | Autenticado |
| PATCH | /api/pqr/{id} | Admin/Empleado |
| GET | /api/chat/info | Público |
| POST | /api/chat | Público |

Documentación detallada: `../docs/DOCUMENTACION_QUINTO_AVANCE.md`

## Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@techpc.com` | `Admin123*` |
| Cliente | `cliente@techpc.com` | `Admin123*` |
