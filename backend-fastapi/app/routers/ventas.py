"""
Rutas de ventas: /api/ventas  (Requerimientos 1 al 6 del quinto avance)

- POST   /api/ventas                        → registrar venta (cliente, admin o empleado)
- GET    /api/ventas                        → historial con filtros
- GET    /api/ventas/reporte/diario         → reporte diario en JSON
- GET    /api/ventas/reporte/diario/pdf     → reporte diario en PDF
- GET    /api/ventas/reporte/diario/excel   → reporte diario en Excel
- GET    /api/ventas/{id}                   → consultar una venta
- PATCH  /api/ventas/{id}/estado            → cambiar estado (admin o empleado)
- DELETE /api/ventas/{id}                   → eliminar venta (solo admin)

IMPORTANTE: las rutas /reporte/... se declaran antes de /{venta_id} para que
FastAPI no interprete "reporte" como un identificador numérico.
"""
from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..config import IMPUESTO_PORCENTAJE
from ..database import get_db
from ..models import DetalleVenta, Producto, Servicio, Usuario, Venta
from ..schemas import VentaCreate, VentaEstadoUpdate
from ..security import get_current_user, require_roles
from ..utils.numeracion import generar_numero_venta
from ..utils.reportes import reporte_ventas_excel, reporte_ventas_pdf
from ..utils.serializadores import venta_a_dict

router = APIRouter(prefix='/api/ventas', tags=['Ventas'])

ROLES_GESTION = ('administrador', 'empleado')


def _a_numero(valor) -> float:
    return float(valor or 0)


# ════════════════════════════════════════════
# Registro de ventas
# ════════════════════════════════════════════

@router.post('', status_code=status.HTTP_201_CREATED)
def registrar_venta(
    body: VentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Registra una venta con su detalle (productos y/o servicios).

    - El cliente siempre registra la venta a su propio nombre.
    - El administrador y el empleado pueden registrar la venta a nombre de
      cualquier cliente enviando cliente_id.
    """
    es_cliente = current_user.rol.nombre == 'cliente' if current_user.rol else True
    cliente_id = current_user.id if es_cliente else (body.cliente_id or current_user.id)

    cliente = db.query(Usuario).filter(Usuario.id == cliente_id).first()
    if cliente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='El cliente indicado no existe.',
        )
    if cliente.estado != 'activo':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='El cliente está inactivo y no puede registrar ventas.',
        )

    subtotal_bruto = 0.0
    descuentos_items = 0.0
    detalles = []

    for item in body.items:
        if item.tipo == 'producto':
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if producto is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f'El producto {item.producto_id} no existe.',
                )
            if producto.estado != 'activo':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'El producto "{producto.nombre}" no está disponible.',
                )
            if producto.stock < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f'Stock insuficiente para "{producto.nombre}". '
                        f'Disponible: {producto.stock}.'
                    ),
                )
            producto.stock -= item.cantidad
            descripcion = producto.nombre
            precio = item.precio_unitario or _a_numero(producto.precio)
            detalles.append(DetalleVenta(
                tipo='producto',
                producto_id=producto.id,
                descripcion=descripcion,
                cantidad=item.cantidad,
                precio_unitario=precio,
                descuento=item.descuento,
                subtotal=0,
            ))
        else:
            servicio = db.query(Servicio).filter(Servicio.id == item.servicio_id).first()
            if servicio is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f'El servicio {item.servicio_id} no existe.',
                )
            if servicio.estado != 'activo':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'El servicio "{servicio.nombre}" no está disponible.',
                )
            descripcion = servicio.nombre
            precio = item.precio_unitario or _a_numero(servicio.precio)
            detalles.append(DetalleVenta(
                tipo='servicio',
                servicio_id=servicio.id,
                descripcion=descripcion,
                cantidad=item.cantidad,
                precio_unitario=precio,
                descuento=item.descuento,
                subtotal=0,
            ))

        valor_bruto = precio * item.cantidad
        descuento_item = min(item.descuento, valor_bruto)
        detalles[-1].descuento = descuento_item
        detalles[-1].subtotal = valor_bruto - descuento_item
        subtotal_bruto += valor_bruto
        descuentos_items += descuento_item

    descuento_total = min(descuentos_items + body.descuento, subtotal_bruto)
    base_gravable = subtotal_bruto - descuento_total
    impuestos = round(base_gravable * IMPUESTO_PORCENTAJE / 100, 2)
    total = round(base_gravable + impuestos, 2)

    venta = Venta(
        numero_venta=generar_numero_venta(db),
        cliente_id=cliente.id,
        usuario_id=current_user.id,
        subtotal=round(subtotal_bruto, 2),
        descuento=round(descuento_total, 2),
        impuestos=impuestos,
        total=total,
        metodo_pago=body.metodo_pago,
        estado=body.estado,
    )
    venta.detalles = detalles

    db.add(venta)
    db.commit()
    db.refresh(venta)

    return {
        'message': 'Venta registrada exitosamente.',
        'sale': venta_a_dict(venta),
    }


# ════════════════════════════════════════════
# Historial de ventas (con filtros)
# ════════════════════════════════════════════

@router.get('')
def historial_ventas(
    fecha_inicio: date | None = Query(default=None, description='Fecha inicial (YYYY-MM-DD)'),
    fecha_fin: date | None = Query(default=None, description='Fecha final (YYYY-MM-DD)'),
    cliente_id: int | None = Query(default=None),
    producto_id: int | None = Query(default=None),
    servicio_id: int | None = Query(default=None),
    estado: str | None = Query(default=None, pattern='^(pendiente|pagada|anulada)$'),
    total_min: float | None = Query(default=None, ge=0),
    total_max: float | None = Query(default=None, ge=0),
    numero: str | None = Query(default=None, max_length=20),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta el historial de ventas aplicando filtros de búsqueda."""
    consulta = db.query(Venta)

    # El cliente solo puede ver sus propias ventas.
    if current_user.rol and current_user.rol.nombre == 'cliente':
        consulta = consulta.filter(Venta.cliente_id == current_user.id)
    elif cliente_id:
        consulta = consulta.filter(Venta.cliente_id == cliente_id)

    if fecha_inicio:
        consulta = consulta.filter(Venta.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        consulta = consulta.filter(Venta.fecha <= datetime.combine(fecha_fin, time.max))
    if estado:
        consulta = consulta.filter(Venta.estado == estado)
    if total_min is not None:
        consulta = consulta.filter(Venta.total >= total_min)
    if total_max is not None:
        consulta = consulta.filter(Venta.total <= total_max)
    if numero:
        consulta = consulta.filter(Venta.numero_venta.like(f'%{numero}%'))
    if producto_id or servicio_id:
        consulta = consulta.join(DetalleVenta, DetalleVenta.venta_id == Venta.id)
        if producto_id:
            consulta = consulta.filter(DetalleVenta.producto_id == producto_id)
        if servicio_id:
            consulta = consulta.filter(DetalleVenta.servicio_id == servicio_id)

    ventas = consulta.order_by(Venta.fecha.desc(), Venta.id.desc()).all()
    ventas = list({v.id: v for v in ventas}.values())  # Evita duplicados por el JOIN

    return {
        'sales': [venta_a_dict(v) for v in ventas],
        'total': len(ventas),
        'facturacion': sum(_a_numero(v.total) for v in ventas if v.estado != 'anulada'),
    }


# ════════════════════════════════════════════
# Reporte diario de ventas
# ════════════════════════════════════════════

def _construir_reporte(db: Session, dia: date) -> dict:
    """Arma la estructura del reporte diario (usada por JSON, PDF y Excel)."""
    inicio = datetime.combine(dia, time.min)
    fin = datetime.combine(dia, time.max)

    ventas = (
        db.query(Venta)
        .filter(Venta.fecha >= inicio, Venta.fecha <= fin, Venta.estado != 'anulada')
        .order_by(Venta.fecha.asc())
        .all()
    )
    datos = [venta_a_dict(v) for v in ventas]

    resumen = {
        'total_ventas': len(datos),
        'facturacion': round(sum(v['total'] for v in datos), 2),
        'impuestos': round(sum(v['impuestos'] for v in datos), 2),
        'descuentos': round(sum(v['descuento'] for v in datos), 2),
        'unidades': sum(item['cantidad'] for v in datos for item in v['items']),
    }

    return {
        'fecha': dia.isoformat(),
        'generado_en': datetime.now().isoformat(timespec='seconds'),
        'resumen': resumen,
        'ventas': datos,
    }


@router.get('/reporte/diario')
def reporte_diario(
    fecha: date | None = Query(default=None, description='Fecha del reporte (por defecto hoy)'),
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Reporte diario de ventas en formato JSON (consume el Dashboard)."""
    dia = fecha or date.today()
    return _construir_reporte(db, dia)


@router.get('/reporte/diario/pdf')
def reporte_diario_pdf(
    fecha: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Exporta el reporte diario de ventas en PDF."""
    dia = fecha or date.today()
    reporte = _construir_reporte(db, dia)
    buffer = reporte_ventas_pdf(
        reporte, f'{current_user.nombre} {current_user.apellido}'
    )
    nombre = f'reporte_ventas_{dia.isoformat()}.pdf'
    return StreamingResponse(
        buffer,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="{nombre}"'},
    )


@router.get('/reporte/diario/excel')
def reporte_diario_excel(
    fecha: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Exporta el reporte diario de ventas en Excel (.xlsx)."""
    dia = fecha or date.today()
    reporte = _construir_reporte(db, dia)
    buffer = reporte_ventas_excel(
        reporte, f'{current_user.nombre} {current_user.apellido}'
    )
    nombre = f'reporte_ventas_{dia.isoformat()}.xlsx'
    return StreamingResponse(
        buffer,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': f'attachment; filename="{nombre}"'},
    )


# ════════════════════════════════════════════
# Consulta y gestión de una venta
# ════════════════════════════════════════════

@router.get('/{venta_id}')
def obtener_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta una venta por su identificador."""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if venta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Venta no encontrada.',
        )
    if current_user.rol and current_user.rol.nombre == 'cliente':
        if venta.cliente_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para consultar esta venta.',
            )
    return {'sale': venta_a_dict(venta)}


@router.patch('/{venta_id}/estado')
def cambiar_estado_venta(
    venta_id: int,
    body: VentaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Cambia el estado de una venta (pendiente, pagada o anulada)."""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if venta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Venta no encontrada.',
        )
    venta.estado = body.estado
    db.commit()
    return {'message': 'Estado de la venta actualizado.', 'estado': venta.estado}


@router.delete('/{venta_id}')
def eliminar_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Elimina una venta y su detalle (solo administrador)."""
    venta = db.query(Venta).filter(Venta.id == venta_id).first()
    if venta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Venta no encontrada.',
        )
    db.delete(venta)
    db.commit()
    return {'message': 'Venta eliminada exitosamente.'}
