"""
Rutas de PQR — Peticiones, Quejas y Reclamos: /api/pqr
(Requerimiento 16 del quinto avance)

- POST   /api/pqr             → el cliente registra una PQR
- GET    /api/pqr             → listar PQR (el cliente solo ve las suyas)
- GET    /api/pqr/{id}        → consultar una PQR y su estado
- PATCH  /api/pqr/{id}        → gestionar (estado, respuesta) — admin o empleado
- DELETE /api/pqr/{id}        → eliminar una PQR (solo admin)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Pqr, Usuario
from ..schemas import PqrCreate, PqrUpdate
from ..security import get_current_user, require_roles
from ..utils.serializadores import pqr_a_dict

router = APIRouter(prefix='/api/pqr', tags=['PQR'])

ROLES_GESTION = ('administrador', 'empleado')


def _es_cliente(usuario: Usuario) -> bool:
    return usuario.rol is not None and usuario.rol.nombre == 'cliente'


@router.post('', status_code=status.HTTP_201_CREATED)
def registrar_pqr(
    body: PqrCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Registra una petición, queja o reclamo asociada al usuario autenticado."""
    pqr = Pqr(
        usuario_id=current_user.id,
        tipo=body.tipo,
        asunto=body.asunto,
        descripcion=body.descripcion,
        estado='pendiente',
    )
    db.add(pqr)
    db.commit()
    db.refresh(pqr)
    return {
        'message': 'Solicitud registrada exitosamente. Queda en estado pendiente.',
        'pqr': pqr_a_dict(pqr),
    }


@router.get('')
def listar_pqr(
    estado: str | None = Query(default=None, pattern='^(pendiente|en_proceso|respondida|cerrada)$'),
    tipo: str | None = Query(default=None, pattern='^(peticion|queja|reclamo)$'),
    usuario_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista las PQR. El cliente únicamente consulta las propias."""
    consulta = db.query(Pqr)

    if _es_cliente(current_user):
        consulta = consulta.filter(Pqr.usuario_id == current_user.id)
    elif usuario_id:
        consulta = consulta.filter(Pqr.usuario_id == usuario_id)

    if estado:
        consulta = consulta.filter(Pqr.estado == estado)
    if tipo:
        consulta = consulta.filter(Pqr.tipo == tipo)

    solicitudes = consulta.order_by(Pqr.fecha_creacion.desc(), Pqr.id.desc()).all()
    return {
        'pqr': [pqr_a_dict(p) for p in solicitudes],
        'total': len(solicitudes),
        'pendientes': sum(1 for p in solicitudes if p.estado == 'pendiente'),
        'en_proceso': sum(1 for p in solicitudes if p.estado == 'en_proceso'),
    }


@router.get('/{pqr_id}')
def obtener_pqr(
    pqr_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Consulta el estado de una PQR."""
    pqr = db.query(Pqr).filter(Pqr.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Solicitud PQR no encontrada.',
        )
    if _es_cliente(current_user) and pqr.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tienes permiso para consultar esta solicitud.',
        )
    return {'pqr': pqr_a_dict(pqr)}


@router.patch('/{pqr_id}')
def gestionar_pqr(
    pqr_id: int,
    body: PqrUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(*ROLES_GESTION)),
):
    """Gestiona una PQR: cambia el estado y registra la respuesta del equipo."""
    pqr = db.query(Pqr).filter(Pqr.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Solicitud PQR no encontrada.',
        )

    datos = body.model_dump(exclude_unset=True, exclude_none=True)
    for campo, valor in datos.items():
        setattr(pqr, campo, valor)

    if body.estado in {'respondida', 'cerrada'} and not pqr.respuesta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Debes registrar una respuesta antes de marcar la PQR como respondida o cerrada.',
        )

    db.commit()
    db.refresh(pqr)
    return {
        'message': 'Solicitud PQR actualizada exitosamente.',
        'pqr': pqr_a_dict(pqr),
    }


@router.delete('/{pqr_id}')
def eliminar_pqr(
    pqr_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Elimina una solicitud PQR (solo administrador)."""
    pqr = db.query(Pqr).filter(Pqr.id == pqr_id).first()
    if pqr is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Solicitud PQR no encontrada.',
        )
    db.delete(pqr)
    db.commit()
    return {'message': 'Solicitud PQR eliminada exitosamente.'}
