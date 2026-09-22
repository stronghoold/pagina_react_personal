"""
Generación de números consecutivos para ventas y facturas.

Formato:  V-20260921-0001  /  F-20260921-0001
Se calcula el consecutivo del día consultando la base de datos.
"""
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session


def _siguiente_consecutivo(db: Session, modelo, campo: str, prefijo: str) -> str:
    hoy = datetime.now().strftime('%Y%m%d')
    patron = f'{prefijo}-{hoy}-%'
    ultimo = (
        db.query(func.max(getattr(modelo, campo)))
        .filter(getattr(modelo, campo).like(patron))
        .scalar()
    )
    consecutivo = int(ultimo.split('-')[-1]) + 1 if ultimo else 1
    return f'{prefijo}-{hoy}-{consecutivo:04d}'


def generar_numero_venta(db: Session) -> str:
    from ..models import Venta

    return _siguiente_consecutivo(db, Venta, 'numero_venta', 'V')


def generar_numero_factura(db: Session) -> str:
    from ..models import Factura

    return _siguiente_consecutivo(db, Factura, 'numero_factura', 'F')
