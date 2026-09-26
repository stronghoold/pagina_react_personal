"""
Envío de correos del proyecto TechPC.

Todas las notificaciones salen por SMTP (por ejemplo Gmail con una contraseña
de aplicación) configurado en el archivo .env:

- Confirmación de compra con la factura en PDF adjunta
- Recuperación de contraseña (clave temporal)

Las credenciales viven únicamente en el entorno: este módulo nunca las recibe
como parámetros ni las escribe en el código. Si no hay credenciales, los
correos NO se envían y el proyecto sigue funcionando con normalidad: el envío
se registra en el log del servidor para poder revisarlo.
"""
from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from ..config import (
    EMAIL_COPIA_VENTAS,
    EMAIL_ENABLED,
    FRONTEND_URL,
    IDENTIFICACION_PROYECTO,
    NOMBRE_PROYECTO,
    SMTP_FROM,
    SMTP_FROM_NAME,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_SSL,
    SMTP_TIMEOUT,
    SMTP_TLS,
    SMTP_USER,
)

logger = logging.getLogger('techpc.correo')

# Colores de la marca usados en las plantillas HTML
AZUL = '#1e3a8a'
AZUL_CLARO = '#eff6ff'
GRIS = '#64748b'


def _moneda(valor) -> str:
    """Formatea un valor como pesos colombianos: $ 1.234.567."""
    return f'$ {float(valor or 0):,.0f}'.replace(',', '.')


def _plantilla(titulo: str, subtitulo: str, contenido: str) -> str:
    """Envuelve el contenido en una plantilla HTML con la identidad del sitio."""
    return f"""\
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:{AZUL};padding:26px 28px;color:#ffffff;">
                <h1 style="margin:0;font-size:20px;">{NOMBRE_PROYECTO}</h1>
                <p style="margin:4px 0 0;font-size:12px;color:#c7d2fe;">{IDENTIFICACION_PROYECTO}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h2 style="margin:0 0 6px;font-size:18px;color:#0f172a;">{titulo}</h2>
                <p style="margin:0 0 18px;font-size:13px;color:{GRIS};">{subtitulo}</p>
                {contenido}
              </td>
            </tr>
            <tr>
              <td style="background:{AZUL_CLARO};padding:16px 28px;font-size:11px;color:{GRIS};">
                Correo generado automáticamente por {NOMBRE_PROYECTO}. Por favor no respondas a este mensaje.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def _tabla_items(items) -> str:
    """Construye la tabla HTML con los ítems de una venta o factura."""
    filas = ''.join(
        f"""\
        <tr>
          <td style="padding:7px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#0f172a;">{item.get('descripcion', '')}</td>
          <td style="padding:7px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:center;color:#0f172a;">{item.get('cantidad', 0)}</td>
          <td style="padding:7px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:right;color:#0f172a;">{_moneda(item.get('precio_unitario'))}</td>
          <td style="padding:7px 6px;border-bottom:1px solid #e2e8f0;font-size:12px;text-align:right;color:#0f172a;">{_moneda(item.get('subtotal'))}</td>
        </tr>"""
        for item in items
    )
    return f"""\
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:6px 0 16px;">
      <thead>
        <tr style="background:{AZUL};">
          <th align="left" style="padding:8px 6px;font-size:11px;color:#ffffff;">Descripción</th>
          <th align="center" style="padding:8px 6px;font-size:11px;color:#ffffff;">Cant.</th>
          <th align="right" style="padding:8px 6px;font-size:11px;color:#ffffff;">Valor unit.</th>
          <th align="right" style="padding:8px 6px;font-size:11px;color:#ffffff;">Subtotal</th>
        </tr>
      </thead>
      <tbody>{filas}</tbody>
    </table>"""


def _boton(texto: str, url: str) -> str:
    return (
        f'<a href="{url}" style="display:inline-block;background:{AZUL};color:#ffffff;'
        f'text-decoration:none;padding:11px 22px;border-radius:10px;font-size:13px;'
        f'font-weight:bold;">{texto}</a>'
    )


def construir_mensaje(
    destinatarios,
    asunto: str,
    html: str,
    texto_plano: str | None = None,
    adjuntos=None,
) -> EmailMessage:
    """Arma el EmailMessage (HTML + texto plano + adjuntos)."""
    mensaje = EmailMessage()
    mensaje['Subject'] = asunto
    mensaje['From'] = formataddr((SMTP_FROM_NAME, SMTP_FROM))
    mensaje['To'] = ', '.join(destinatarios)
    # Un texto simple de respaldo para los clientes de correo que no leen HTML
    mensaje.set_content(texto_plano or 'Este correo contiene información de TechPC.')
    mensaje.add_alternative(html, subtype='html')

    for adjunto in adjuntos or []:
        mensaje.add_attachment(
            adjunto['data'],
            maintype=adjunto.get('maintype', 'application'),
            subtype=adjunto.get('subtype', 'octet-stream'),
            filename=adjunto['filename'],
        )
    return mensaje


def enviar_correo(
    destinatarios,
    asunto: str,
    html: str,
    texto_plano: str | None = None,
    adjuntos=None,
) -> bool:
    """
    Envía un correo por SMTP. Devuelve True si se envió.

    Nunca lanza excepción: un fallo de correo no debe interrumpir una venta.
    """
    destinatarios = [d for d in (destinatarios or []) if d]
    if not destinatarios:
        logger.warning('Correo "%s" sin destinatarios: no se envió.', asunto)
        return False

    mensaje = construir_mensaje(destinatarios, asunto, html, texto_plano, adjuntos)

    if not EMAIL_ENABLED:
        logger.warning(
            'SMTP sin configurar (SMTP_USER/SMTP_PASSWORD vacíos). '
            'El correo "%s" para %s no se envió.',
            asunto,
            ', '.join(destinatarios),
        )
        return False

    try:
        if SMTP_SSL:
            contexto = ssl.create_default_context()
            with smtplib.SMTP_SSL(
                SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT, context=contexto
            ) as servidor:
                servidor.login(SMTP_USER, SMTP_PASSWORD)
                servidor.send_message(mensaje)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=SMTP_TIMEOUT) as servidor:
                servidor.ehlo()
                if SMTP_TLS:
                    servidor.starttls(context=ssl.create_default_context())
                    servidor.ehlo()
                servidor.login(SMTP_USER, SMTP_PASSWORD)
                servidor.send_message(mensaje)
        logger.info('Correo "%s" enviado a %s.', asunto, ', '.join(destinatarios))
        return True
    except (smtplib.SMTPException, OSError, ssl.SSLError) as exc:
        logger.error('No se pudo enviar el correo "%s": %s', asunto, exc)
        return False


# ════════════════════════════════════════════
# Confirmación de compra + factura
# ════════════════════════════════════════════

def enviar_confirmacion_compra(venta: dict, factura: dict | None = None, pdf: bytes | None = None) -> bool:
    """
    Envía al cliente la confirmación de su compra con la factura en PDF adjunta.

    Se envía una copia a EMAIL_COPIA_VENTAS (si está configurado) para que la
    tienda conserve el registro de cada operación.
    """
    correo_cliente = venta.get('cliente_correo')
    nombre = venta.get('cliente_nombre') or 'cliente'
    numero_venta = venta.get('numero_venta') or '—'
    numero_factura = (factura or {}).get('numero_factura')

    items = (factura or {}).get('items') or venta.get('items') or []
    subtotal = (factura or {}).get('subtotal', venta.get('subtotal'))
    impuestos = (factura or {}).get('impuestos', venta.get('impuestos'))
    descuento = (factura or {}).get('descuento', venta.get('descuento'))
    total = (factura or {}).get('total', venta.get('total'))

    bloque_factura = (
        f'<p style="margin:0 0 14px;font-size:13px;color:#0f172a;">'
        f'Factura de venta: <strong>{numero_factura}</strong></p>'
        if numero_factura
        else ''
    )
    adjunto_aviso = (
        '<p style="margin:0 0 6px;font-size:12px;color:#0f172a;">'
        'Adjuntamos tu factura de venta en formato PDF.</p>'
        if pdf
        else ''
    )

    contenido = f"""\
      <p style="margin:0 0 14px;font-size:13px;color:#0f172a;">
        Hola <strong>{nombre}</strong>, gracias por tu compra. Registramos la venta
        <strong>{numero_venta}</strong> correctamente.
      </p>
      {bloque_factura}
      {_tabla_items(items)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
        <tr><td align="right" style="padding:2px 0;">Subtotal:</td><td align="right" width="120" style="padding:2px 0;">{_moneda(subtotal)}</td></tr>
        <tr><td align="right" style="padding:2px 0;">Descuento:</td><td align="right" style="padding:2px 0;">{_moneda(descuento)}</td></tr>
        <tr><td align="right" style="padding:2px 0;">Impuestos:</td><td align="right" style="padding:2px 0;">{_moneda(impuestos)}</td></tr>
        <tr>
          <td align="right" style="padding:8px 0;font-weight:bold;border-top:1px solid #e2e8f0;">Total:</td>
          <td align="right" style="padding:8px 0;font-weight:bold;border-top:1px solid #e2e8f0;">{_moneda(total)}</td>
        </tr>
      </table>
      <p style="margin:18px 0 10px;font-size:12px;color:{GRIS};">
        {adjunto_aviso}
        También puedes consultar tus compras y facturas desde tu panel de cliente.
      </p>
      {_boton('Ver mis compras', FRONTEND_URL + '/login')}"""

    html = _plantilla(
        'Confirmación de compra',
        f'Venta {numero_venta}',
        contenido,
    )
    texto = (
        f'Gracias por tu compra, {nombre}. Venta {numero_venta}. '
        f'Total: {_moneda(total)}.'
        + (f' Factura: {numero_factura}.' if numero_factura else '')
    )

    adjuntos = []
    if pdf:
        adjuntos.append({
            'data': pdf,
            'filename': f'factura_{numero_factura or numero_venta}.pdf',
            'maintype': 'application',
            'subtype': 'pdf',
        })

    destinatarios = [correo_cliente, EMAIL_COPIA_VENTAS]
    enviado = enviar_correo(
        destinatarios,
        f'Confirmación de compra {numero_venta} - {NOMBRE_PROYECTO}',
        html,
        texto,
        adjuntos,
    )
    return enviado


def enviar_factura(factura: dict, pdf: bytes | None = None) -> bool:
    """
    Envía la factura al correo del cliente (por ejemplo cuando el equipo la
    genera manualmente desde el panel de facturación).
    """
    numero_factura = factura.get('numero_factura') or '—'
    contenido = f"""\
      <p style="margin:0 0 14px;font-size:13px;color:#0f172a;">
        Hola <strong>{factura.get('cliente_nombre') or 'cliente'}</strong>, adjuntamos
        tu factura de venta <strong>{numero_factura}</strong>.
      </p>
      {_tabla_items(factura.get('items') or [])}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;">
        <tr><td align="right" style="padding:2px 0;">Subtotal:</td><td align="right" width="120" style="padding:2px 0;">{_moneda(factura.get('subtotal'))}</td></tr>
        <tr><td align="right" style="padding:2px 0;">Impuestos:</td><td align="right" style="padding:2px 0;">{_moneda(factura.get('impuestos'))}</td></tr>
        <tr>
          <td align="right" style="padding:8px 0;font-weight:bold;border-top:1px solid #e2e8f0;">Total:</td>
          <td align="right" style="padding:8px 0;font-weight:bold;border-top:1px solid #e2e8f0;">{_moneda(factura.get('total'))}</td>
        </tr>
      </table>
      <p style="margin:18px 0 10px;font-size:12px;color:{GRIS};">
        También puedes descargar tus facturas desde tu panel de cliente.
      </p>
      {_boton('Ir a mi panel', FRONTEND_URL + '/login')}"""

    html = _plantilla('Factura de venta', f'Factura {numero_factura}', contenido)
    texto = (
        f'Factura de venta {numero_factura}. '
        f'Total: {_moneda(factura.get("total"))}.'
    )

    adjuntos = []
    if pdf:
        adjuntos.append({
            'data': pdf,
            'filename': f'factura_{numero_factura}.pdf',
            'maintype': 'application',
            'subtype': 'pdf',
        })

    return enviar_correo(
        [factura.get('cliente_correo')],
        f'Factura {numero_factura} - {NOMBRE_PROYECTO}',
        html,
        texto,
        adjuntos,
    )


# ════════════════════════════════════════════
# Recuperación de contraseña
# ════════════════════════════════════════════

def enviar_password_temporal(usuario: dict, password_temporal: str) -> bool:
    """
    Envía al usuario la contraseña temporal generada para restablecer su acceso.

    Las contraseñas del sistema se guardan con bcrypt (hash irreversible), por
    eso no es posible enviar la contraseña original: se genera una nueva.
    """
    nombre = usuario.get('nombre') or 'usuario'
    contenido = f"""\
      <p style="margin:0 0 16px;font-size:13px;color:#0f172a;">
        Hola <strong>{nombre}</strong>, recibimos una solicitud para recuperar
        la contraseña de tu cuenta <strong>{usuario.get('correo', '')}</strong>.
      </p>
      <p style="margin:0 0 10px;font-size:13px;color:#0f172a;">
        Tu nueva contraseña temporal es:
      </p>
      <p style="margin:0 0 18px;padding:14px;text-align:center;background:{AZUL_CLARO};
                border:1px dashed {AZUL};border-radius:10px;font-size:20px;
                font-weight:bold;letter-spacing:2px;color:{AZUL};">
        {password_temporal}
      </p>
      <p style="margin:0 0 18px;font-size:12px;color:{GRIS};">
        Por seguridad, te recomendamos iniciar sesión con esta contraseña y
        cambiarla por una propia lo antes posible.
      </p>
      {_boton('Iniciar sesión', FRONTEND_URL + '/login')}"""

    html = _plantilla(
        'Recuperación de contraseña',
        'Usa la contraseña temporal para volver a entrar',
        contenido,
    )
    texto = (
        f'Hola {nombre}. Tu contraseña temporal es: {password_temporal}. '
        'Inicia sesión y cámbiala por una propia.'
    )

    return enviar_correo(
        [usuario.get('correo')],
        f'Recuperación de contraseña - {NOMBRE_PROYECTO}',
        html,
        texto,
    )


__all__ = [
    'enviar_correo',
    'construir_mensaje',
    'enviar_confirmacion_compra',
    'enviar_factura',
    'enviar_password_temporal',
]
