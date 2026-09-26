"""
Rutas de autenticación: /api/auth
- POST /api/auth/login                → verifica credenciales y genera JWT
- GET  /api/auth/me                   → perfil del usuario autenticado (protegido)
- GET  /api/auth/roles                → lista de roles (protegido)
- POST /api/auth/recuperar-password   → envía una contraseña temporal al correo
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Rol, Usuario
from ..schemas import (
    LoginRequest,
    LoginResponse,
    RecuperarPasswordRequest,
    RolOut,
    UsuarioOut,
)
from ..security import (
    create_access_token,
    generar_password_temporal,
    get_current_user,
    hash_password,
    usuario_a_dict,
    verify_password,
)
from ..utils.correo import enviar_password_temporal

router = APIRouter(prefix='/api/auth', tags=['Autenticación'])


@router.post('/login', response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Inicio de sesión: valida correo y contraseña y retorna un JWT."""
    user = db.query(Usuario).filter(Usuario.correo == body.email.lower().strip()).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Correo o contraseña incorrectos.',
        )

    if user.estado != 'activo':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Tu cuenta está desactivada. Contacta al administrador.',
        )

    if not verify_password(body.contrasena, user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Correo o contraseña incorrectos.',
        )

    rol_nombre = user.rol.nombre if user.rol else 'cliente'
    token = create_access_token(
        {'sub': str(user.id), 'correo': user.correo, 'rol': rol_nombre}
    )

    return LoginResponse(
        message='Inicio de sesión exitoso.',
        token=token,
        user={
            'id': user.id,
            'nombre': user.nombre,
            'apellido': user.apellido,
            'correo': user.correo,
            'rol': rol_nombre,
            'rol_id': user.rol_id,
        },
    )


@router.post('/recuperar-password')
def recuperar_password(body: RecuperarPasswordRequest, db: Session = Depends(get_db)):
    """
    Recuperación de contraseña: genera una contraseña temporal, la guarda
    cifrada con bcrypt y la envía al correo registrado del usuario.

    Es imposible enviar la contraseña original: en la base de datos solo se
    almacena su hash (bcrypt), que no se puede revertir. Por eso se emite una
    contraseña temporal nueva.
    """
    correo = body.email.lower().strip()
    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No existe una cuenta registrada con ese correo electrónico.',
        )
    if usuario.estado != 'activo':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Tu cuenta está desactivada. Contacta al administrador.',
        )

    password_temporal = generar_password_temporal()
    usuario.contrasena = hash_password(password_temporal)
    db.commit()

    enviado = enviar_password_temporal(
        {
            'nombre': usuario.nombre,
            'correo': usuario.correo,
        },
        password_temporal,
    )

    return {
        'message': (
            f'Enviamos una contraseña temporal a {usuario.correo}. '
            'Revisa tu bandeja de entrada (y la carpeta de spam).'
            if enviado
            else (
                'Se generó una nueva contraseña, pero el correo no pudo enviarse: '
                'revisa la configuración SMTP del servidor.'
            )
        ),
        'correo_enviado': enviado,
    }


@router.get('/me', response_model=UsuarioOut)
def get_me(current_user: Usuario = Depends(get_current_user)):
    """Perfil del usuario autenticado (requiere token)."""
    return current_user


@router.get('/roles')
def get_roles(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    """Lista de roles del sistema (requiere autenticación)."""
    roles = db.query(Rol).order_by(Rol.id).all()
    return {'roles': [RolOut.model_validate(r).model_dump() for r in roles]}