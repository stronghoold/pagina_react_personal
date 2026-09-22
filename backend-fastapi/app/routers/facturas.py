"""
Rutas de facturas: /api/facturas  (Requerimientos 7, 8 y 9 del quinto avance)

- POST  /api/facturas                → generar factura desde una venta
- GET   /api/facturas                → consultar facturas con filtros
- GET   /api/facturas/{id}           → consultar una factura
- GET   /api/facturas/{id}/pdf       → descargar la factura en PDF
- PATCH /api/facturas/{id}/estado    → cambiar estado de la factura
"""
from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import DetalleFactura, Factura, Usuario, Venta
from ..schemas import FacturaCreate, FacturaEstadoUpdate
from ..security import get_current_user, require_roles
from ..utils.numeracion import generar_numero_factura
from ..utils.reportes import factura_pdf
from ..utils.serializadores import factura_a_dict

router = APIRouter(prefix='/api/facturas', tags=['Facturas'])

ROLES_GESTION = ('administrador', 'empleado')


@router.post('', status_code=status.HTTP_201_CREATED)
def generar_factura(
    body: FacturaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Genera la factura de venta a partir de una operación comercial registrada."""
    venta = db.query(Venta).filter(Venta.id == body.venta_id).first()
    if venta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='La venta indicada no existe.',
        )
    if venta.factura is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'La venta ya tiene la factura {venta.factura.numero_factura} generada.',
        )
    if venta.estado == 'anulada':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No se puede facturar una venta anulada.',
        )
    if not venta.detalles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='La venta no tiene productos ni servicios registrados.',
        )

    factura = Factura(
        numero_factura=generar_numero_factura(db),
        venta_id=venta.id,
        cliente_id=venta.cliente_id,
        subtotal=venta.subtotal,
        descuento=venta.descuento,
        impuestos=venta.impuestos,
        total=venta.total,
        metodo_pago=body.metodo_pago or venta.metodo_pago,
        estado='emitida' if venta.estado != 'pagada' else 'pagada',
    )
    # La factura congela el detalle con los precios del momento de la venta.
    factura.detalles = [
        DetalleFactura(
            descripcion=d.descripcion,
            cantidad=d.cantidad,
            precio_unitario=d.precio_unitario,
            descuento=d.descuento,
            subtotal=d.subtotal,
        )
        for d in venta.detalles
    ]

    db.add(factura)
    if venta.estado == 'pendiente':
        venta.estado = 'pagada'
    db.commit()
    db.refresh(factura)

    return {
        'message': 'Factura generada exitosamente.',
        'invoice': factura_a_dict(factura),
    }


@router.get('')
def listar_facturas(
    numero_factura: str | None = Query(default=None, max_length=20),
    cliente_id: int | None = Query(default=None),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    estado: str | None = Query(default=None, pattern='^(emitida|pagada|anulada)$'),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta las facturas generadas aplicando filtros de búsqueda."""
    consulta = db.query(Factura)

    if current_user.rol and current_user.rol.nombre == 'cliente':
        consulta = consulta.filter(Factura.cliente_id == current_user.id)
    elif cliente_id:
        consulta = consulta.filter(Factura.cliente_id == cliente_id)

    if numero_factura:
        consulta = consulta.filter(Factura.numero_factura.like(f'%{numero_factura}%'))
    if fecha_inicio:
        consulta = consulta.filter(Factura.fecha >= datetime.combine(fecha_inicio, time.min))
    if fecha_fin:
        consulta = consulta.filter(Factura.fecha <= datetime.combine(fecha_fin, time.max))
    if estado:
        consulta = consulta.filter(Factura.estado == estado)

    facturas = consulta.order_by(Factura.fecha.desc(), Factura.id.desc()).all()
    return {
        'invoices': [factura_a_dict(f) for f in facturas],
        'total': len(facturas),
        'facturado': round(sum(float(f.total or 0) for f in facturas), 2),
    }


@router.get('/{factura_id}')
def obtener_factura(
    factura_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta una factura por su identificador."""
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if factura is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Factura no encontrada.',
        )
    if current_user.rol and current_user.rol.nombre == 'cliente':
        if factura.cliente_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para consultar esta factura.',
            )
    return {'invoice': factura_a_dict(factura)}


@router.get('/{factura_id}/pdf')
def descargar_factura_pdf(
    factura_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Genera y descarga la factura en formato PDF."""
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if factura is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Factura no encontrada.',
        )
    if current_user.rol and current_user.rol.nombre == 'cliente':
        if factura.cliente_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para descargar esta factura.',
            )

    buffer = factura_pdf(factura_a_dict(factura))
    nombre = f'factura_{factura.numero_factura}.pdf'
    return StreamingResponse(
        buffer,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="{nombre}"'},
    )


@router.patch('/{factura_id}/estado')
def cambiar_estado_factura(
    factura_id: int,
    body: FacturaEstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Cambia el estado de una factura (emitida, pagada o anulada)."""
    factura = db.query(Factura).filter(Factura.id == factura_id).first()
    if factura is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Factura no encontrada.',
        )
    factura.estado = body.estado
    db.commit()
    return {'message': 'Estado de la factura actualizado.', 'estado': factura.estado}
