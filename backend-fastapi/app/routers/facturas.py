"""
Rutas de facturas: /api/facturas  (Requerimientos 7, 8 y 9 del quinto avance)

- POST  /api/facturas                → generar factura desde una venta
- GET   /api/facturas                → consultar facturas con filtros
- GET   /api/facturas/{id}           → consultar una factura
- GET   /api/facturas/{id}/pdf       → descargar la factura en PDF
- PATCH /api/facturas/{id}/estado    → cambiar estado de la factura
"""
import logging
from datetime import date, datetime, time

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..config import EMAIL_ENABLED
from ..database import get_db
from ..models import Factura, Usuario, Venta
from ..schemas import FacturaCreate, FacturaEstadoUpdate
from ..security import get_current_user, require_roles
from ..utils.correo import enviar_factura
from ..utils.facturacion import crear_factura_desde_venta
from ..utils.reportes import factura_pdf
from ..utils.serializadores import factura_a_dict

router = APIRouter(prefix='/api/facturas', tags=['Facturas'])

logger = logging.getLogger('techpc.facturas')

ROLES_GESTION = ('administrador', 'empleado')


@router.post('', status_code=status.HTTP_201_CREATED)
def generar_factura(
    body: FacturaCreate,
    background_tasks: BackgroundTasks,
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

    factura = crear_factura_desde_venta(db, venta, body.metodo_pago)
    db.commit()
    db.refresh(factura)

    # Se envía la factura al correo del cliente con el PDF adjunto
    # (en segundo plano, sin bloquear la respuesta).
    datos = factura_a_dict(factura)
    correo_enviado = False
    try:
        background_tasks.add_task(enviar_factura, datos, factura_pdf(datos).getvalue())
        correo_enviado = EMAIL_ENABLED
    except Exception:  # noqa: BLE001 - el correo es opcional
        logger.exception(
            'No se pudo preparar el correo de la factura %s.', datos['numero_factura']
        )

    return {
        'message': 'Factura generada exitosamente.',
        'invoice': datos,
        'correo_enviado': correo_enviado,
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
