"""
Rutas de usuarios: /api/usuarios
- POST   /api/usuarios/registro     → registro de clientes (público)
- GET    /api/usuarios              → listar usuarios (admin)
- GET    /api/usuarios/{id}         → consultar usuario (admin)
- PUT    /api/usuarios/{id}         → actualizar usuario (admin)
- PATCH  /api/usuarios/{id}/estado  → cambiar estado activo/inactivo (admin)
- DELETE /api/usuarios/{id}         → eliminar usuario (admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Usuario
from ..schemas import EstadoUpdate, UsuarioRegistro, UsuarioUpdate
from ..security import (
    get_current_user,
    hash_password,
    require_roles,
    usuario_a_dict,
    verify_password,
)

router = APIRouter(prefix='/api/usuarios', tags=['Usuarios'])


@router.post('/registro', status_code=status.HTTP_201_CREATED)
def registrar_usuario(body: UsuarioRegistro, db: Session = Depends(get_db)):
    """Registro de un cliente nuevo: valida datos, verifica duplicados
    y almacena la contraseña con hashing seguro (bcrypt)."""
    correo = body.correo.lower().strip()

    existe_correo = db.query(Usuario).filter(Usuario.correo == correo).first()
    if existe_correo:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='El correo ya está registrado.',
        )

    existe_documento = (
        db.query(Usuario)
        .filter(Usuario.numero_documento == body.numero_documento)
        .first()
    )
    if existe_documento:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='El número de documento ya está registrado.',
        )

    nuevo = Usuario(
        nombre=body.nombre,
        apellido=body.apellido,
        tipo_documento=body.tipo_documento,
        numero_documento=body.numero_documento,
        direccion=body.direccion,
        telefono=body.telefono,
        correo=correo,
        contrasena=hash_password(body.contrasena),  # Nunca se guarda en texto plano
        rol_id=3,  # Por defecto: cliente
        estado='activo',
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {
        'message': 'Usuario registrado exitosamente.',
        'user': {
            'id': nuevo.id,
            'nombre': nuevo.nombre,
            'apellido': nuevo.apellido,
            'correo': nuevo.correo,
            'rol': 'cliente',
        },
    }


@router.get('', response_model=dict)
def listar_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Lista todos los usuarios (solo administrador)."""
    usuarios = db.query(Usuario).order_by(Usuario.fecha_registro.desc()).all()
    return {'users': [usuario_a_dict(u) for u in usuarios]}


@router.get('/{usuario_id}', response_model=dict)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Consulta un usuario por ID (solo administrador)."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado.',
        )
    return {'user': usuario_a_dict(usuario)}


@router.put('/{usuario_id}')
def actualizar_usuario(
    usuario_id: int,
    body: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Actualiza los datos de un usuario (solo administrador)."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado.',
        )

    data = body.model_dump(exclude_unset=True, exclude_none=True)

    # Si llega nueva contraseña, se vuelve a hashear
    if 'contrasena' in data:
        if not verify_password(data['contrasena'], usuario.contrasena):
            data['contrasena'] = hash_password(data['contrasena'])
        else:
            del data['contrasena']

    if 'correo' in data:
        correo = data['correo'].lower().strip()
        duplicado = (
            db.query(Usuario)
            .filter(Usuario.correo == correo, Usuario.id != usuario_id)
            .first()
        )
        if duplicado:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail='El correo ya está registrado.',
            )
        data['correo'] = correo

    if 'numero_documento' in data:
        duplicado = (
            db.query(Usuario)
            .filter(
                Usuario.numero_documento == data['numero_documento'],
                Usuario.id != usuario_id,
            )
            .first()
        )
        if duplicado:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail='El número de documento ya está registrado.',
            )

    for campo, valor in data.items():
        setattr(usuario, campo, valor)

    db.commit()
    return {'message': 'Usuario actualizado exitosamente.'}


@router.patch('/{usuario_id}/estado')
def cambiar_estado_usuario(
    usuario_id: int,
    body: EstadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Cambia el estado de un usuario a activo/inactivo (solo administrador)."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado.',
        )
    usuario.estado = body.estado
    db.commit()
    return {'message': 'Estado del usuario actualizado.', 'estado': usuario.estado}


@router.delete('/{usuario_id}')
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Elimina un usuario (solo administrador)."""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Usuario no encontrado.',
        )
    db.delete(usuario)
    db.commit()
    return {'message': 'Usuario eliminado exitosamente.'}