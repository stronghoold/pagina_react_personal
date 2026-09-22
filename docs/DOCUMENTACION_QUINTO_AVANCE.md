# 📘 Documentación Técnica — Quinto Avance

**Proyecto:** TechPC — Tienda de Tecnología
**Ficha:** 3406204 · **Trimestre:** 03 · **Competencia:** React · **Instructor:** Jhan Hader Muñoz
**Arquitectura:** `React + Vite → FastAPI → Base de Datos SQL (MySQL)` + Chatbot con IA

Este documento describe las funcionalidades incorporadas en el quinto avance sobre
el proyecto desarrollado en los avances anteriores.

---

## 1. Resumen de lo implementado

| # | Requerimiento | Dónde está implementado | Endpoint / componente |
|---|---------------|-------------------------|------------------------|
| 1 | Módulo de ventas | `app/routers/ventas.py` | `POST /api/ventas` · `VentasModal.jsx` |
| 2 | Registro de productos y servicios vendidos | tabla `detalle_ventas` | detalle incluido en `POST /api/ventas` |
| 3 | Historial de ventas con filtros | `app/routers/ventas.py` | `GET /api/ventas` · `VentasPanel.jsx` |
| 4 | Reporte diario de ventas | `app/routers/ventas.py` | `GET /api/ventas/reporte/diario` · `ReportsPanel.jsx` |
| 5 | Exportación del reporte en PDF | `app/utils/reportes.py` | `GET /api/ventas/reporte/diario/pdf` |
| 6 | Exportación del reporte en Excel | `app/utils/reportes.py` | `GET /api/ventas/reporte/diario/excel` |
| 7 | Generación de facturas | `app/routers/facturas.py` | `POST /api/facturas` |
| 8 | Consulta de facturas | `app/routers/facturas.py` | `GET /api/facturas` · `FacturasPanel.jsx` |
| 9 | Descarga de facturas en PDF | `app/utils/reportes.py` | `GET /api/facturas/{id}/pdf` |
| 10 | Dashboard administrativo (Cards) | `app/routers/dashboard.py` | `GET /api/dashboard/admin` · `DashboardPanel.jsx` |
| 11 | Dashboard de ventas (barras y lineal) | `app/routers/dashboard.py` | `GET /api/dashboard/ventas` · `BarChart.jsx` · `LineChart.jsx` |
| 12 | Dashboards por rol | `AdminPanel` · `EmployeePanel` · `ClientPanel` | `GET /api/dashboard/{admin,empleado,cliente}` |
| 13 | Filtros de los Dashboards | `app/routers/dashboard.py` | parámetros `fecha_inicio`, `fecha_fin`, `producto_id`, etc. |
| 14 | Nuevos endpoints en FastAPI | `app/routers/*` | 28 endpoints nuevos (ver §4) |
| 15 | Dashboard integrado con FastAPI | Paneles de React | sin datos escritos a mano: todo viene de la API |
| 16 | Módulo de PQR | `app/routers/pqr.py` | `/api/pqr` · `PqrPanel.jsx` |
| 17 | Chatbot de atención al cliente | `app/routers/chat.py` | `POST /api/chat` · `Chatbot.jsx` |
| 18 | Chatbot con Inteligencia Artificial | `app/utils/ia.py` | API compatible con OpenAI desde FastAPI |
| 19 | Gestión segura de la API Key | `app/config.py` + `.env` | `IA_API_KEY` leída del entorno |
| 20 | Integración completa y despliegue | `Procfile`, `vercel.json`, `_redirects` | ver §7 |

---

## 2. Base de datos

Se agregaron **7 tablas** al script `backend-fastapi/database.sql`:

| Tabla | Propósito | Relaciones |
|-------|-----------|------------|
| `ventas` | Venta registrada desde el sitio web | `cliente_id → usuarios`, `usuario_id → usuarios` |
| `detalle_ventas` | Productos y servicios de cada venta | `venta_id → ventas`, `producto_id`, `servicio_id` |
| `facturas` | Factura de venta generada | `venta_id → ventas` (1:1), `cliente_id → usuarios` |
| `detalle_facturas` | Líneas congeladas de la factura | `factura_id → facturas` |
| `pqr` | Peticiones, quejas y reclamos | `usuario_id → usuarios` |
| `conversaciones` | Conversaciones del chatbot | `usuario_id → usuarios` (opcional) |
| `mensajes` | Mensajes de cada conversación | `conversacion_id → conversaciones` |

**Estados soportados**

- `ventas.estado`: `pendiente`, `pagada`, `anulada`
- `facturas.estado`: `emitida`, `pagada`, `anulada`
- `pqr.estado`: `pendiente`, `en_proceso`, `respondida`, `cerrada`

**Datos de ejemplo incluidos:** cliente de prueba, 3 ventas con su detalle, 2 facturas
con su detalle y 2 PQR, para que los Dashboards y reportes muestren información real.

**Aplicar el script actualizado:**

```bash
mysql -u root -p < backend-fastapi/database.sql
```

---

## 3. Reglas de cálculo de una venta

1. Cada ítem es `producto` o `servicio`; se valida que exista y esté **activo**.
2. Para productos se valida el **stock** y se descuenta automáticamente.
3. El precio unitario se toma del catálogo (o el enviado si es menor/negociado).
4. `subtotal = Σ (cantidad × precio_unitario)`
5. `descuento = Σ descuentos por ítem + descuento general` (nunca supera el subtotal)
6. `impuestos = (subtotal − descuento) × 19 %` (`IMPUESTO_PORCENTAJE` en `.env`)
7. `total = (subtotal − descuento) + impuestos`
8. El número consecutivo se genera como `V-AAAAMMDD-0001` / `F-AAAAMMDD-0001`.

Al generar la factura, la venta pasa a `pagada` si estaba `pendiente`.

---

## 4. Nuevos endpoints de FastAPI

### Ventas — `/api/ventas`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/ventas` | Autenticado | Registra la venta con su detalle |
| GET | `/api/ventas` | Autenticado | Historial con filtros (el cliente solo ve las suyas) |
| GET | `/api/ventas/{id}` | Autenticado | Consulta una venta |
| PATCH | `/api/ventas/{id}/estado` | Admin/Empleado | Cambia el estado |
| DELETE | `/api/ventas/{id}` | Admin | Elimina la venta |
| GET | `/api/ventas/reporte/diario` | Admin/Empleado | Reporte diario en JSON |
| GET | `/api/ventas/reporte/diario/pdf` | Admin/Empleado | Reporte diario en PDF |
| GET | `/api/ventas/reporte/diario/excel` | Admin/Empleado | Reporte diario en Excel |

Filtros del historial: `fecha_inicio`, `fecha_fin`, `cliente_id`, `producto_id`,
`servicio_id`, `estado`, `total_min`, `total_max`, `numero`.

### Facturas — `/api/facturas`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/facturas` | Admin/Empleado | Genera la factura desde una venta |
| GET | `/api/facturas` | Autenticado | Consulta con filtros `numero_factura`, `cliente_id`, fechas, `estado` |
| GET | `/api/facturas/{id}` | Autenticado | Consulta una factura |
| GET | `/api/facturas/{id}/pdf` | Autenticado | Descarga la factura en PDF |
| PATCH | `/api/facturas/{id}/estado` | Admin/Empleado | Cambia el estado |

### Dashboards — `/api/dashboard`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/dashboard/admin` | Admin | Indicadores consolidados + gráficos + top productos |
| GET | `/api/dashboard/empleado` | Admin/Empleado | Indicadores comerciales + PQR |
| GET | `/api/dashboard/cliente` | Autenticado | Resumen del cliente autenticado |
| GET | `/api/dashboard/ventas` | Admin/Empleado | Series filtrables (`agrupacion=dia\|semana\|mes`) |
| GET | `/api/dashboard/filtros` | Admin/Empleado | Listas para los selects de filtrado |

### PQR — `/api/pqr`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/pqr` | Autenticado | Registra una solicitud (queda `pendiente`) |
| GET | `/api/pqr` | Autenticado | Lista filtrada por `estado` y `tipo` |
| GET | `/api/pqr/{id}` | Autenticado | Consulta el estado de una solicitud |
| PATCH | `/api/pqr/{id}` | Admin/Empleado | Cambia estado y registra la respuesta |
| DELETE | `/api/pqr/{id}` | Admin | Elimina la solicitud |

### Chatbot — `/api/chat`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/chat/info` | Público | Bienvenida, sugerencias y estado de la IA |
| POST | `/api/chat` | Público | Envía un mensaje y recibe la respuesta |
| GET | `/api/chat/conversaciones` | Autenticado | Historial de conversaciones |
| GET | `/api/chat/conversaciones/{id}` | Autenticado | Mensajes de una conversación |

**Total: 48 operaciones en Swagger** (`http://127.0.0.1:8000/docs`).

---

## 5. Chatbot con Inteligencia Artificial

Flujo de la información:

```
Usuario (Chatbot.jsx)
   → POST /api/chat
      → app/routers/chat.py  (guarda mensaje en conversaciones/mensajes)
         → app/utils/ia.py
            → ¿existe IA_API_KEY?
               SÍ → POST {IA_BASE_URL}/chat/completions con el catálogo real
                     (productos y servicios consultados en MySQL)
               NO → motor local de reglas con la misma información de la BD
```

- `fuente = "ia"` cuando respondió el proveedor de IA; `"local"` cuando usó las reglas.
- El contexto que recibe la IA incluye el catálogo activo y el porcentaje de impuestos.
- Temas cubiertos por el motor local: bienvenida, productos y precios, servicios,
  proceso de compra, facturas, garantías, envíos, contacto, horarios y **PQR**.
- Si el proveedor falla (timeout, error HTTP, cuota), se responde con el motor local:
  la atención nunca se interrumpe.

### Configuración segura de la clave (requerimiento 19)

```env
IA_API_KEY=tu_clave_privada
IA_BASE_URL=https://api.openai.com/v1
IA_MODEL=gpt-4o-mini
```

- La clave se lee con `python-dotenv` desde `.env` (ignorado por Git).
- **Nunca** se escribe en el código, ni se envía al navegador, ni se registra en logs.
- `.env.example` va vacío y es el único archivo de entorno que se sube al repositorio.

---

## 6. Frontend (React + Vite)

### Componentes nuevos reutilizables

| Archivo | Función |
|---------|---------|
| `components/charts/BarChart.jsx` | Gráfico de barras en SVG (sin dependencias externas) |
| `components/charts/LineChart.jsx` | Gráfico lineal en SVG con área degradada |
| `components/dashboard/StatCard.jsx` | Tarjeta de indicador (Card) |
| `components/Chatbot.jsx` | Widget flotante del chatbot |
| `components/CheckoutModal.jsx` | Registra la venta desde el carrito de compras |
| `components/comercial/DashboardPanel.jsx` | Dashboard de admin/empleado con filtros |
| `components/comercial/DashboardCliente.jsx` | Dashboard del cliente |
| `components/comercial/VentasPanel.jsx` | Historial de ventas con filtros |
| `components/comercial/VentasModal.jsx` | Registrar venta con detalle |
| `components/comercial/FacturasPanel.jsx` | Consulta y descarga de facturas |
| `components/comercial/ReportsPanel.jsx` | Reporte diario + exportación |
| `components/comercial/PqrPanel.jsx` | Registro, consulta y gestión de PQR |

### Pestañas por rol

- **Administrador:** Dashboard · Ventas · Facturas · Reportes · PQR · Usuarios · Productos · Servicios
- **Empleado:** Dashboard · Ventas · Facturas · Reportes · PQR · Productos · Servicios
- **Cliente:** Mi resumen · Productos · Servicios · Mis compras · Mis facturas · PQR · Mi Perfil · Cambiar cuenta

### Configuración de la URL del backend

`frontend/src/utils/api.js` lee `VITE_API_URL`. En desarrollo usa
`http://localhost:8000/api` por defecto y en producción se cambia con el `.env`.

---

## 7. Despliegue en la nube (requerimiento 20)

La aplicación está preparada para desplegarse en **Railway** (recomendado por la
guía) o en cualquier plataforma equivalente.

### 7.1 Base de datos MySQL

1. Crear el servicio MySQL en Railway (o el proveedor elegido).
2. Ejecutar `database.sql` contra esa base de datos.
3. Anotar host, puerto, usuario, contraseña y nombre de la base.

### 7.2 Backend FastAPI

Archivo `backend-fastapi/Procfile`:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Variables de entorno a configurar en la plataforma (nunca en el código):

```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET, CORS_ORIGINS, IA_API_KEY, IA_BASE_URL, IA_MODEL
```

> En producción `CORS_ORIGINS` debe contener la URL pública del frontend,
> por ejemplo `https://techpc.up.railway.app`, para dejar de usar el comodín `*`.

### 7.3 Frontend React + Vite

- **Vercel:** `frontend/vercel.json` ya define el build y el rewrite del SPA.
- **Netlify:** `frontend/public/_redirects` ya redirige todas las rutas a `index.html`.

Variable de entorno en la plataforma:

```
VITE_API_URL=https://<url-publica-del-backend>/api
```

### 7.4 Evidencias del despliegue

- URL pública del frontend funcionando.
- URL pública de Swagger (`/docs`) del backend.
- Capturas del registro de una venta, reporte PDF/Excel y dashboard usando la
  aplicación desplegada.

---

## 8. Seguridad

- **JWT** con expiración de 24 horas (`python-jose`).
- **Control de roles** con la dependencia `require_roles`, aplicado en cada endpoint.
- **Protección de endpoints** con `get_current_user` y `get_optional_user`.
- **Hashing de contraseñas** con bcrypt (nunca texto plano).
- **Variables de entorno** para credenciales de BD, secreto JWT y clave de IA.
- El cliente solo puede consultar **sus propias** ventas, facturas, PQR y conversaciones.

---

## 9. Pruebas y evidencias

1. Importar `backend-fastapi/TechPC_FastAPI.postman_collection.json` y
   `TechPC_FastAPI.postman_environment.json`.
2. Ejecutar **Login** (las variables `token` y `userId` se guardan solas).
3. Ejecutar **Registrar venta** → se guarda `ventaId`.
4. Ejecutar **Generar factura** → se guarda `facturaId`.
5. Probar el **Chatbot** y revisar en la respuesta si la fuente es `ia` o `local`.

### Lista de chequeo de evidencias

- [ ] Registro de una venta
- [ ] Consulta del historial de ventas
- [ ] Generación del reporte diario
- [ ] Exportación a PDF
- [ ] Exportación a Excel
- [ ] Generación de una factura
- [ ] Consulta y descarga de una factura
- [ ] Dashboard administrativo
- [ ] Dashboard de empleado / cliente
- [ ] Gráfico de barras y gráfico lineal
- [ ] Cards de indicadores
- [ ] Registro de una PQR
- [ ] Gestión de una PQR
- [ ] Funcionamiento del Chatbot
- [ ] Conversación con el chatbot mediante IA
- [ ] Configuración de variables de entorno (sin exponer claves)
- [ ] Pruebas de los nuevos endpoints en Postman
- [ ] Aplicación desplegada y URL pública

---

## 10. Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@techpc.com` | `Admin123*` |
| Cliente | `cliente@techpc.com` | `Admin123*` |

> ⚠️ No exponer contraseñas, tokens ni claves de IA en capturas, repositorios o
> documentos públicos.
