"""
Conexión con la base de datos SQL mediante SQLAlchemy.
La configuración proviene de variables de entorno (app/config.py).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import DATABASE_URL

# Motor de conexión (pool por defecto)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # Verifica la conexión antes de usarla
    pool_recycle=3600,       # Recicla conexiones cada hora
)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos ORM
Base = declarative_base()


def get_db():
    """Dependencia de FastAPI: entrega una sesión de BD por petición."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()