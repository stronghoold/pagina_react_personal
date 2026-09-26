"""
Seguridad: hashing de contraseñas (bcrypt), generación/verificación de JWT
y dependencias de FastAPI para proteger endpoints y controlar roles.
"""
import secrets
import string
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import JWT_ALGORITHM, JWT_EXPIRATION_MINUTES, JWT_SECRET
from .database import get_db
from .models import Usuario

# Esquema Bearer para leer el header Authorization: Bearer <token>
security_scheme = HTTPBearer(auto_error=False)


# ─── Hashing de contraseñas ───
def hash_password(contrasena: str) -> str:
    """Genera un hash seguro con bcrypt (nunca se guarda la contraseña en texto plano)."""
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(contrasena.encode('utf-8'), salt).decode('utf-8')


def verify_password(contrasena: str, hashed: str) -> bool:
    """Verifica una contraseña contra su hash almacenado."""
    try:
        return bcrypt.checkpw(contrasena.encode('utf-8'), hashed.encode('utf-8'))
    except (ValueError, TypeError):
        return False


def generar_password_temporal(longitud: int = 12) -> str:
    """
    Genera una contraseña temporal segura para la recuperación de acceso.

    Cumple las reglas de la aplicación: mínimo 8 caracteres, con mayúscula,
    minúscula, número y carácter especial (sin espacios). Las contraseñas se
    almacenan con bcrypt, por eso no se puede recuperar la original: se emite
    una nueva que el usuario puede cambiar después.
    """
    obligatorios = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice('!@#$%&*?'),
    ]
    alfabeto = string.ascii_letters + string.digits
    relleno = [
        secrets.choice(alfabeto) for _ in range(max(longitud - len(obligatorios), 0))
    ]
    caracteres = obligatorios + relleno
    # Mezcla aleatoria (Fisher-Yates) para que los caracteres obligatorios no
    # queden siempre al inicio.
    for i in range(len(caracteres) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        caracteres[i], caracteres[j] = caracteres[j], caracteres[i]
    return ''.join(caracteres)


# ─── JWT ───
def create_access_token(data: dict, expires_minutes: int | None = None) -> str:
    """Crea un token JWT con la información del usuario."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or JWT_EXPIRATION_MINUTES
    )
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decodifica y valida un token JWT (firma y expiración)."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token inválido o expirado.',
        ) from exc


# ─── Dependencia: usuario autenticado ───
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """
    Verifica que la petición incluya un token válido y devuelve el usuario
    asociado. Protege los endpoints que requieren autenticación.
    """
    if credentials is None or credentials.credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token no proporcionado.',
        )

    payload = decode_access_token(credentials.credentials)

    user_id = payload.get('sub')
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Token inválido o expirado.',
        )

    user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Usuario no encontrado.',
        )
    if user.estado != 'activo':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Tu cuenta está desactivada. Contacta al administrador.',
        )
    return user


# ─── Dependencia: usuario opcional (para el chatbot público) ───
def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Usuario | None:
    """
    Igual que get_current_user, pero NO exige token: devuelve None cuando la
    petición es anónima. Se usa en el Chatbot, que está disponible para los
    visitantes del sitio antes de iniciar sesión.
    """
    if credentials is None or not credentials.credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
    except HTTPException:
        return None

    user_id = payload.get('sub')
    if user_id is None:
        return None
    return db.query(Usuario).filter(Usuario.id == int(user_id)).first()


# ─── Dependencia: control de roles ───
def require_roles(*roles: str):
    """
    Devuelve una dependencia que solo permite el acceso a usuarios cuyo rol
    esté entre los indicados. La autorización definitiva es del Backend.
    """
    def checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol is None or current_user.rol.nombre not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para realizar esta acción.',
            )
        return current_user
    return checker


def usuario_a_dict(usuario: Usuario) -> dict:
    """Convierte un usuario ORM a diccionario seguro (sin contraseña)."""
    return {
        'id': usuario.id,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'tipo_documento': usuario.tipo_documento,
        'numero_documento': usuario.numero_documento,
        'direccion': usuario.direccion,
        'telefono': usuario.telefono,
        'correo': usuario.correo,
        'estado': usuario.estado,
        'rol_id': usuario.rol_id,
        'rol_nombre': usuario.rol.nombre if usuario.rol else None,
        'fecha_registro': usuario.fecha_registro,
    }