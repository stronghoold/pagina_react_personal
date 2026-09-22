"""
Rutas del Chatbot: /api/chat  (Requerimientos 17 y 18 del quinto avance)

- GET  /api/chat/info                 → estado del chatbot (IA activa o local)
- POST /api/chat                      → enviar un mensaje y recibir la respuesta
- GET  /api/chat/conversaciones       → historial de conversaciones
- GET  /api/chat/conversaciones/{id}  → mensajes de una conversación

El chatbot funciona para visitantes anónimos y para usuarios autenticados
(el contexto del usuario se usa para personalizar la atención).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..config import IA_ENABLED, IA_MODEL
from ..database import get_db
from ..models import Conversacion, Mensaje, Usuario
from ..schemas import ChatRequest, ChatResponse
from ..security import get_current_user, get_optional_user
from ..utils.ia import MENSAJE_BIENVENIDA, SUGERENCIAS, responder

router = APIRouter(prefix='/api/chat', tags=['Chatbot'])


def _conversacion_a_dict(conversacion: Conversacion) -> dict:
    return {
        'id': conversacion.id,
        'usuario_id': conversacion.usuario_id,
        'titulo': conversacion.titulo,
        'fecha_creacion': conversacion.fecha_creacion,
        'mensajes': [
            {
                'id': m.id,
                'rol': m.rol,
                'contenido': m.contenido,
                'fecha_creacion': m.fecha_creacion,
            }
            for m in conversacion.mensajes
        ],
    }


@router.get('/info')
def info_chatbot():
    """Información de bienvenida del chatbot y estado de la integración con IA."""
    return {
        'bot': 'TechBot',
        'mensaje': MENSAJE_BIENVENIDA,
        'sugerencias': SUGERENCIAS,
        'ia_activa': IA_ENABLED,
        'modelo': IA_MODEL if IA_ENABLED else 'motor local de reglas',
    }


@router.post('', response_model=ChatResponse)
def enviar_mensaje(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Usuario | None = Depends(get_optional_user),
):
    """
    Procesa el mensaje del usuario, lo guarda en la conversación y devuelve la
    respuesta generada por la IA (o por el motor local si no hay API Key).
    """
    conversacion = None
    if body.conversacion_id:
        conversacion = (
            db.query(Conversacion)
            .filter(Conversacion.id == body.conversacion_id)
            .first()
        )
        if conversacion is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Conversación no encontrada.',
            )
        if (
            current_user is not None
            and conversacion.usuario_id is not None
            and conversacion.usuario_id != current_user.id
            and (current_user.rol is None or current_user.rol.nombre == 'cliente')
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='No tienes permiso para continuar esta conversación.',
            )

    if conversacion is None:
        conversacion = Conversacion(
            usuario_id=current_user.id if current_user else None,
            titulo=body.mensaje[:60],
        )
        db.add(conversacion)
        db.flush()

    historial = [
        {
            'role': 'assistant' if m.rol == 'asistente' else 'user',
            'content': m.contenido,
        }
        for m in conversacion.mensajes[-8:]
    ]

    respuesta, fuente = responder(body.mensaje, historial, db)

    db.add(Mensaje(conversacion_id=conversacion.id, rol='usuario', contenido=body.mensaje))
    db.add(Mensaje(conversacion_id=conversacion.id, rol='asistente', contenido=respuesta))
    db.commit()

    return ChatResponse(
        conversacion_id=conversacion.id,
        respuesta=respuesta,
        fuente=fuente,
        sugerencias=SUGERENCIAS,
    )


@router.get('/conversaciones')
def listar_conversaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Historial de conversaciones del chatbot (el cliente ve las propias)."""
    consulta = db.query(Conversacion)
    if current_user.rol and current_user.rol.nombre == 'cliente':
        consulta = consulta.filter(Conversacion.usuario_id == current_user.id)

    conversaciones = consulta.order_by(Conversacion.fecha_creacion.desc()).all()
    return {
        'conversations': [
            {
                'id': c.id,
                'titulo': c.titulo,
                'fecha_creacion': c.fecha_creacion,
                'mensajes': len(c.mensajes),
            }
            for c in conversaciones
        ]
    }


@router.get('/conversaciones/{conversacion_id}')
def obtener_conversacion(
    conversacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Mensajes de una conversación del chatbot."""
    conversacion = (
        db.query(Conversacion).filter(Conversacion.id == conversacion_id).first()
    )
    if conversacion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Conversación no encontrada.',
        )
    if (
        current_user.rol
        and current_user.rol.nombre == 'cliente'
        and conversacion.usuario_id not in {None, current_user.id}
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='No tienes permiso para consultar esta conversación.',
        )
    return {'conversation': _conversacion_a_dict(conversacion)}
