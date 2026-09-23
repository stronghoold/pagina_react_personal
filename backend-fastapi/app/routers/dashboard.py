"""
Rutas de Dashboards y estadísticas: /api/dashboard
(Requerimientos 10 al 15 del quinto avance)

- GET /api/dashboard/admin      → indicadores consolidados (administrador)
- GET /api/dashboard/empleado   → indicadores del área comercial (empleado)
- GET /api/dashboard/cliente    → resumen del cliente autenticado
- GET /api/dashboard/ventas     → gráficos de ventas con filtros
- GET /api/dashboard/filtros    → listas para los selects de filtrado

Toda la información se calcula desde la base de datos: el Frontend en React
NO tiene datos escritos a mano, únicamente consume estos endpoints.
"""
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    DetalleVenta,
    Factura,
    Pqr,
    Producto,
    Servicio,
    Usuario,
    Venta,
)
from ..security import get_current_user, require_roles

router = APIRouter(prefix='/api/dashboard', tags=['Dashboards'])

ROLES_GESTION = ('administrador', 'empleado')

MESES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]


def _num(valor) -> float:
    return float(valor or 0)


def _consultar_ventas(
    db: Session,
    fecha_inicio: date | None = None,
    fecha_fin: date | None = None,
    producto_id: int | None = None,
    servicio_id: int | None = None,
    estado: str | None = None,
    cliente_id: int | None = None,
):
    """Aplica los filtros de los Dashboards sobre las ventas."""
    consulta = db.query(Venta)

    if fecha_inicio:
        consulta = consulta.filter(Venta.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        consulta = consulta.filter(Venta.fecha <= datetime.combine(fecha_fin, time.max))
    if estado:
        consulta = consulta.filter(Venta.estado == estado)
    if cliente_id:
        consulta = consulta.filter(Venta.cliente_id == cliente_id)
    if producto_id or servicio_id:
        consulta = consulta.join(DetalleVenta, DetalleVenta.venta_id == Venta.id)
        if producto_id:
            consulta = consulta.filter(DetalleVenta.producto_id == producto_id)
        if servicio_id:
            consulta = consulta.filter(DetalleVenta.servicio_id == servicio_id)

    ventas = consulta.order_by(Venta.fecha.asc()).all()
    return list({v.id: v for v in ventas}.values())


def _agrupar(ventas, agrupacion: str, fecha_inicio: date | None, fecha_fin: date | None):
    """Construye las series de los gráficos (día, semana o mes)."""
    etapas: dict[str, float] = {}
    orden: list[str] = []

    def clave(venta):
        f = venta.fecha.date() if hasattr(venta.fecha, 'date') else venta.fecha
        if agrupacion == 'mes':
            return f"{MESES[f.month - 1]} {f.year}"
        if agrupacion == 'semana':
            inicio_semana = f - timedelta(days=f.weekday())
            return f"Sem {inicio_semana.strftime('%d/%m')}"
        return f.strftime('%d/%m')

    for venta in ventas:
        k = clave(venta)
        if k not in etapas:
            etapas[k] = 0.0
            orden.append(k)
        if venta.estado != 'anulada':
            etapas[k] += _num(venta.total)

    # Para el modo día se rellenan los días del rango (así el gráfico no queda con huecos)
    if agrupacion == 'dia' and fecha_inicio and fecha_fin:
        dia = fecha_inicio
        orden = []
        etapas = {}
        while dia <= fecha_fin:
            etiqueta = dia.strftime('%d/%m')
            orden.append(etiqueta)
            etapas[etiqueta] = 0.0
            dia += timedelta(days=1)
        for venta in ventas:
            f = venta.fecha.date() if hasattr(venta.fecha, 'date') else venta.fecha
            etiqueta = f.strftime('%d/%m')
            if venta.estado != 'anulada' and etiqueta in etapas:
                etapas[etiqueta] += _num(venta.total)

    return {
        'etiquetas': orden,
        'valores': [round(etapas[k], 2) for k in orden],
    }


def _productos_mas_vendidos(db: Session, limite: int = 5):
    filas = (
        db.query(
            DetalleVenta.descripcion,
            func.sum(DetalleVenta.cantidad).label('unidades'),
            func.sum(DetalleVenta.subtotal).label('valor'),
        )
        .join(Venta, Venta.id == DetalleVenta.venta_id)
        .filter(Venta.estado != 'anulada')
        .group_by(DetalleVenta.descripcion)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(limite)
        .all()
    )
    return [
        {
            'nombre': fila[0],
            'unidades': int(fila[1] or 0),
            'valor': round(_num(fila[2]), 2),
        }
        for fila in filas
    ]


def _series_comunes(db: Session, desde: date, hasta: date):
    ventas = _consultar_ventas(db, desde, hasta)
    return {
        'ventas_por_dia': _agrupar(ventas, 'dia', desde, hasta),
        'ventas_por_semana': _agrupar(ventas, 'semana', None, None),
        'ventas_por_mes': _agrupar(ventas, 'mes', None, None),
    }


@router.get('/admin')
def dashboard_admin(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Dashboard consolidado del administrador (indicadores + gráficos)."""
    total_usuarios = db.query(func.count(Usuario.id)).scalar() or 0
    usuarios_activos = (
        db.query(func.count(Usuario.id)).filter(Usuario.estado == 'activo').scalar() or 0
    )
    total_productos = db.query(func.count(Producto.id)).scalar() or 0
    productos_stock_bajo = (
        db.query(func.count(Producto.id))
        .filter(Producto.estado == 'activo', Producto.stock <= 5)
        .scalar()
        or 0
    )
    total_servicios = db.query(func.count(Servicio.id)).scalar() or 0

    ventas = db.query(Venta).all()
    ventas_validas = [v for v in ventas if v.estado != 'anulada']
    total_ventas = len(ventas)
    facturacion = round(sum(_num(v.total) for v in ventas_validas), 2)
    impuestos = round(sum(_num(v.impuestos) for v in ventas_validas), 2)

    total_facturas = db.query(func.count(Factura.id)).scalar() or 0

    pqr_total = db.query(func.count(Pqr.id)).scalar() or 0
    pqr_pendientes = (
        db.query(func.count(Pqr.id)).filter(Pqr.estado == 'pendiente').scalar() or 0
    )
    pqr_en_proceso = (
        db.query(func.count(Pqr.id)).filter(Pqr.estado == 'en_proceso').scalar() or 0
    )

    hoy = date.today()
    desde = hoy - timedelta(days=13)

    return {
        'indicadores': {
            'total_usuarios': total_usuarios,
            'usuarios_activos': usuarios_activos,
            'total_productos': total_productos,
            'productos_stock_bajo': productos_stock_bajo,
            'total_servicios': total_servicios,
            'total_ventas': total_ventas,
            'facturacion_total': facturacion,
            'impuestos_total': impuestos,
            'total_facturas': total_facturas,
            'pqr_total': pqr_total,
            'pqr_pendientes': pqr_pendientes,
            'pqr_en_proceso': pqr_en_proceso,
        },
        'graficos': _series_comunes(db, desde, hoy),
        'top_productos': _productos_mas_vendidos(db),
        'por_estado': _por_estado(ventas),
    }


@router.get('/empleado')
def dashboard_empleado(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Dashboard del empleado: información comercial y de PQR."""
    total_productos = db.query(func.count(Producto.id)).scalar() or 0
    productos_stock_bajo = (
        db.query(func.count(Producto.id))
        .filter(Producto.estado == 'activo', Producto.stock <= 5)
        .scalar()
        or 0
    )
    total_servicios = db.query(func.count(Servicio.id)).scalar() or 0

    hoy = date.today()
    ventas_hoy = (
        db.query(Venta)
        .filter(
            Venta.fecha >= datetime.combine(hoy, time.min),
            Venta.fecha <= datetime.combine(hoy, time.max),
            Venta.estado != 'anulada',
        )
        .all()
    )
    ventas = db.query(Venta).all()
    ventas_validas = [v for v in ventas if v.estado != 'anulada']

    pqr_pendientes = (
        db.query(func.count(Pqr.id)).filter(Pqr.estado == 'pendiente').scalar() or 0
    )
    pqr_en_proceso = (
        db.query(func.count(Pqr.id)).filter(Pqr.estado == 'en_proceso').scalar() or 0
    )

    desde = hoy - timedelta(days=13)
    return {
        'indicadores': {
            'total_productos': total_productos,
            'productos_stock_bajo': productos_stock_bajo,
            'total_servicios': total_servicios,
            'ventas_hoy': len(ventas_hoy),
            'facturacion_hoy': round(sum(_num(v.total) for v in ventas_hoy), 2),
            'total_ventas': len(ventas),
            'facturacion_total': round(sum(_num(v.total) for v in ventas_validas), 2),
            'pqr_pendientes': pqr_pendientes,
            'pqr_en_proceso': pqr_en_proceso,
        },
        'graficos': _series_comunes(db, desde, hoy),
        'top_productos': _productos_mas_vendidos(db),
        'por_estado': _por_estado(ventas),
    }


@router.get('/cliente')
def dashboard_cliente(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Dashboard del cliente: sus compras, facturación y PQR."""
    ventas = (
        db.query(Venta)
        .filter(Venta.cliente_id == current_user.id)
        .order_by(Venta.fecha.asc())
        .all()
    )
    validas = [v for v in ventas if v.estado != 'anulada']
    facturas = (
        db.query(Factura).filter(Factura.cliente_id == current_user.id).all()
    )
    pqr = db.query(Pqr).filter(Pqr.usuario_id == current_user.id).all()

    hoy = date.today()
    desde = hoy - timedelta(days=29)
    return {
        'indicadores': {
            'total_compras': len(ventas),
            'total_gastado': round(sum(_num(v.total) for v in validas), 2),
            'total_facturas': len(facturas),
            'facturado': round(sum(_num(f.total) for f in facturas), 2),
            'pqr_total': len(pqr),
            'pqr_pendientes': sum(1 for p in pqr if p.estado in {'pendiente', 'en_proceso'}),
        },
        'graficos': {
            'compras_por_dia': _agrupar(validas, 'dia', desde, hoy),
            'compras_por_mes': _agrupar(validas, 'mes', None, None),
        },
        'ultimas_compras': [
            {
                'id': v.id,
                'numero_venta': v.numero_venta,
                'total': _num(v.total),
                'estado': v.estado,
                'fecha': v.fecha,
            }
            for v in reversed(ventas[-5:])
        ],
    }


@router.get('/ventas')
def dashboard_ventas(
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    producto_id: int | None = Query(default=None),
    servicio_id: int | None = Query(default=None),
    estado: str | None = Query(default=None, pattern='^(pendiente|pagada|anulada)$'),
    cliente_id: int | None = Query(default=None),
    agrupacion: str = Query(default='dia', pattern='^(dia|semana|mes)$'),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Gráficos de ventas filtrables por fecha, producto, servicio, estado y cliente."""
    ventas = _consultar_ventas(
        db, fecha_inicio, fecha_fin, producto_id, servicio_id, estado, cliente_id
    )
    validas = [v for v in ventas if v.estado != 'anulada']
    return {
        'indicadores': {
            'total_ventas': len(ventas),
            'facturacion': round(sum(_num(v.total) for v in validas), 2),
            'ticket_promedio': round(
                (sum(_num(v.total) for v in validas) / len(validas)) if validas else 0, 2
            ),
            'unidades_vendidas': sum(
                d.cantidad for v in validas for d in v.detalles
            ),
        },
        'series': _agrupar(ventas, agrupacion, fecha_inicio, fecha_fin),
        'por_estado': _por_estado(ventas),
        'top_productos': _productos_mas_vendidos(db),
    }


def _por_estado(ventas):
    return [
        {
            'estado': estado,
            'cantidad': sum(1 for v in ventas if v.estado == estado),
        }
        for estado in ('pendiente', 'pagada', 'anulada')
    ]


@router.get('/filtros')
def filtros_dashboard(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Listas necesarias para los filtros de los Dashboards."""
    return {
        'productos': [
            {'id': p.id, 'nombre': p.nombre, 'precio': float(p.precio or 0)}
            for p in db.query(Producto).order_by(Producto.nombre).all()
        ],
        'servicios': [
            {'id': s.id, 'nombre': s.nombre, 'precio': float(s.precio or 0)}
            for s in db.query(Servicio).order_by(Servicio.nombre).all()
        ],
        'clientes': [
            {'id': u.id, 'nombre': f'{u.nombre} {u.apellido}'}
            for u in db.query(Usuario).order_by(Usuario.nombre).all()
        ],
        'estados': ['pendiente', 'pagada', 'anulada'],
    }
