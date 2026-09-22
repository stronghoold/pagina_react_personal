"""
Aplicación principal de la API TechPC construida con FastAPI.

Arquitectura:  React + Vite  →  FastAPI  →  Base de Datos SQL (MySQL)

Quinto avance: gestión comercial (ventas y facturación), reportes PDF/Excel,
dashboards por rol, módulo PQR y chatbot con Inteligencia Artificial.

La documentación automática (Swagger UI) queda disponible en:
    http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ALLOW_ALL, CORS_ORIGINS, IA_ENABLED
from .routers import (
    auth,
    chat,
    dashboard,
    facturas,
    pqr,
    productos,
    servicios,
    usuarios,
    ventas,
)

app = FastAPI(
    title='TechPC API - FastAPI',
    description=(
        'API REST del proyecto TechPC (quinto avance). '
        'Autenticación JWT, control de roles, CRUD, ventas, facturación, '
        'reportes PDF/Excel, dashboards, módulo PQR y chatbot con IA.'
    ),
    version='2.0.0',
)

# CORS: permite la comunicación del Frontend (React + Vite) con la API.
# En producción los orígenes se restringen con la variable CORS_ORIGINS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=not CORS_ALLOW_ALL,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/', tags=['Health Check'])
def root():
    """Verifica que la API esté activa."""
    return {
        'message': 'API TechPC (FastAPI) funcionando correctamente 🚀',
        'version': '2.0.0 (quinto avance)',
        'ia_activa': IA_ENABLED,
        'docs': '/docs',
    }


# ─── Routers ───
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(productos.router)
app.include_router(servicios.router)
app.include_router(ventas.router)
app.include_router(facturas.router)
app.include_router(pqr.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
