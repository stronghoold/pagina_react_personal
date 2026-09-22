"""
Rutas de servicios: /api/servicios
- GET    /api/servicios          → listar servicios (público)
- GET    /api/servicios/{id}     → consultar servicio (público)
- POST   /api/servicios          → crear servicio (admin o empleado)
- PUT    /api/servicios/{id}     → actualizar servicio (admin o empleado)
- DELETE /api/servicios/{id}     → eliminar servicio (solo admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Servicio, Usuario
from ..schemas import ServicioCreate, ServicioOut, ServicioUpdate
from ..security import require_roles

router = APIRouter(prefix='/api/servicios', tags=['Servicios'])


@router.get('')
def listar_servicios(db: Session = Depends(get_db)):
    """Lista todos los servicios."""
    servicios = db.query(Servicio).order_by(Servicio.fecha_creacion.desc()).all()
    return {
        'services': [ServicioOut.model_validate(s).model_dump() for s in servicios]
    }


@router.get('/{servicio_id}')
def obtener_servicio(servicio_id: int, db: Session = Depends(get_db)):
    """Consulta un servicio por ID."""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if servicio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Servicio no encontrado.',
        )
    return {'service': ServicioOut.model_validate(servicio).model_dump()}


@router.post('', status_code=status.HTTP_201_CREATED)
def crear_servicio(
    body: ServicioCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador', 'empleado')),
):
    """Crea un servicio nuevo (solo administrador o empleado)."""
    servicio = Servicio(
        nombre=body.nombre,
        descripcion=body.descripcion,
        precio=body.precio,
        duracion_estimada=body.duracion_estimada,
        imagen_url=body.imagen_url,
        estado='activo',
    )
    db.add(servicio)
    db.commit()
    db.refresh(servicio)
    return {
        'message': 'Servicio creado exitosamente.',
        'service': {'id': servicio.id, 'nombre': servicio.nombre, 'precio': float(servicio.precio)},
    }


@router.put('/{servicio_id}')
def actualizar_servicio(
    servicio_id: int,
    body: ServicioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador', 'empleado')),
):
    """Actualiza un servicio (solo administrador o empleado)."""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if servicio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Servicio no encontrado.',
        )
    data = body.model_dump(exclude_unset=True, exclude_none=True)
    for campo, valor in data.items():
        setattr(servicio, campo, valor)
    db.commit()
    return {'message': 'Servicio actualizado exitosamente.'}


@router.delete('/{servicio_id}')
def eliminar_servicio(
    servicio_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Elimina un servicio (solo administrador)."""
    servicio = db.query(Servicio).filter(Servicio.id == servicio_id).first()
    if servicio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Servicio no encontrado.',
        )
    db.delete(servicio)
    db.commit()
    return {'message': 'Servicio eliminado exitosamente.'}