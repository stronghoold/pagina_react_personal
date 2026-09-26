"""
Chatbot del quinto avance.

Requerimiento 17 y 18: atención al cliente con respuestas naturales.
- Si existe IA_API_KEY en el .env, se consulta un servicio de IA
  (API compatible con OpenAI: OpenAI, Groq, OpenRouter, etc.).
- Si no hay clave o el servicio falla, responde un motor local de reglas
  con la información real de productos y servicios de la base de datos.

La clave NUNCA se escribe en el código: se lee siempre desde el entorno.
"""
import re

import httpx
from sqlalchemy.orm import Session

from ..config import (
    IA_API_KEY,
    IA_BASE_URL,
    IA_ENABLED,
    IA_MODEL,
    IA_TIMEOUT,
    IMPUESTO_PORCENTAJE,
    NOMBRE_PROYECTO,
)
from ..models import Producto, Servicio

MENSAJE_BIENVENIDA = (
    '¡Hola! Soy TechBot 🤖, el asistente virtual de TechPC. '
    'Puedo ayudarte con productos, servicios, precios, compras, facturas y PQR.'
)

SUGERENCIAS = [
    '¿Cuál es la tarjeta gráfica más barata?',
    '¿Cuál es el procesador más barato?',
    '¿Qué productos tienen disponibles?',
    '¿Cómo puedo comprar?',
]

SISTEMA_PROMPT = f"""Eres TechBot, el asistente virtual de {NOMBRE_PROYECTO}
Eres amable, breve y claro. Respondes siempre en español.
Tu función es:
1. Resolver preguntas frecuentes sobre la tienda.
2. Orientar sobre productos y servicios (usa el catálogo entregado).
3. Dar información general (horarios, contacto, envíos, garantías).
4. Orientar el proceso de compra desde el sitio web.
5. Recibir y orientar solicitudes de PQR (peticiones, quejas y reclamos).
Si no tienes el dato exacto, indícalo con amabilidad e invita a escribir al
correo contacto@techpc.com o al WhatsApp de la tienda.
Nunca inventes precios que no aparezcan en el catálogo.
El impuesto aplicado a las ventas es del {IMPUESTO_PORCENTAJE:.0f}%."""


def catalogo_para_contexto(db: Session, limite: int = 15) -> str:
    """Resume el catálogo real de la base de datos para dárselo a la IA."""
    productos = (
        db.query(Producto)
        .filter(Producto.estado == 'activo')
        .order_by(Producto.nombre)
        .limit(limite)
        .all()
    )
    servicios = (
        db.query(Servicio)
        .filter(Servicio.estado == 'activo')
        .order_by(Servicio.nombre)
        .limit(limite)
        .all()
    )

    lineas = ['PRODUCTOS DISPONIBLES:']
    lineas += [
        f"- {p.nombre}: ${float(p.precio):,.0f} (stock {p.stock})".replace(',', '.')
        for p in productos
    ] or ['- Sin productos registrados.']

    lineas.append('SERVICIOS DISPONIBLES:')
    lineas += [
        f"- {s.nombre}: ${float(s.precio):,.0f} ({s.duracion_estimada or 'duración no indicada'})".replace(',', '.')
        for s in servicios
    ] or ['- Sin servicios registrados.']

    lineas.append('')
    lineas.append(_resumen_precios(db))
    return '\n'.join(lineas)


def _resumen_precios(db: Session) -> str:
    """
    Resume el producto más barato y más caro de cada categoría.

    Se agrega al contexto de la IA para que pueda responder con datos exactos
    preguntas como "cuál es la tarjeta más barata" sin inventar precios.
    """
    productos = db.query(Producto).filter(Producto.estado == 'activo').all()
    if not productos:
        return 'PRECIOS: sin productos registrados.'

    por_categoria: dict[str, list] = {}
    for producto in productos:
        nombre = producto.categoria.nombre if producto.categoria else 'Sin categoría'
        por_categoria.setdefault(nombre, []).append(producto)

    lineas = ['PRECIOS EXTREMOS POR CATEGORÍA (producto más barato / más caro):']
    for nombre, lista in sorted(por_categoria.items()):
        barato = min(lista, key=lambda p: float(p.precio or 0))
        caro = max(lista, key=lambda p: float(p.precio or 0))
        linea = (
            f'- {nombre}: más barato "{barato.nombre}" a '
            f'${float(barato.precio):,.0f}; más caro "{caro.nombre}" a '
            f'${float(caro.precio):,.0f}'
        )
        lineas.append(linea.replace(',', '.'))
    return '\n'.join(lineas)


def _respuesta_ia(mensaje: str, historial: list[dict], contexto: str) -> str | None:
    """Consulta el proveedor de IA. Devuelve None si falla para usar el respaldo local."""
    if not IA_ENABLED:
        return None

    mensajes = [
        {'role': 'system', 'content': f'{SISTEMA_PROMPT}\n\n{contexto}'},
        *historial[-8:],
        {'role': 'user', 'content': mensaje},
    ]
    try:
        respuesta = httpx.post(
            f'{IA_BASE_URL}/chat/completions',
            headers={
                'Authorization': f'Bearer {IA_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'model': IA_MODEL,
                'messages': mensajes,
                'temperature': 0.4,
                'max_tokens': 500,
            },
            timeout=IA_TIMEOUT,
        )
        respuesta.raise_for_status()
        data = respuesta.json()
        contenido = data['choices'][0]['message']['content'].strip()
        return contenido or None
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        return None


# ════════════════════════════════════════════
# Consultas de precio sobre el catálogo real
# ════════════════════════════════════════════

# Expresiones que indican que el usuario quiere el producto más barato o más
# caro. Se usan límites de palabra (\b) para no confundir "cara" con
# "característica", por ejemplo.
RE_PRECIO_BARATO = re.compile(
    r'\b(barat[oa]s?|economic[oa]s?|menor precio|precio bajo|'
    r'menos cuesta|menos vale|mas economico|mas barato)\b'
)
RE_PRECIO_CARO = re.compile(
    r'\b(car[oa]s?|costos[oa]s?|premium|mayor precio|mas caro|'
    r'mas costoso|gama alta)\b'
)

# Sinónimos por categoría: así el chatbot entiende "GPU", "CPU", "SSD", etc.
SINONIMOS_CATEGORIA = {
    'tarjeta': ('gpu', 'rtx', 'gtx', 'grafic', 'grafica', 'video'),
    'procesador': ('cpu', 'ryzen', 'core i', 'intel'),
    'memoria': ('ram', 'ddr', 'memorias'),
    'almacenamiento': ('ssd', 'hdd', 'nvme', 'disco', 'discos'),
    'motherboard': ('placa', 'board', 'mainboard', 'madre'),
    'fuente': ('psu', 'poder'),
    'gabinete': ('case', 'chasis', 'torre'),
    'monitor': ('pantalla', 'monitores'),
    'periferico': ('mouse', 'teclado', 'audifono', 'audífono', 'diadema', 'parlante'),
}


def _normalizar(texto: str) -> str:
    """Pasa el texto a minúsculas y sin tildes para comparar con el catálogo."""
    reemplazos = str.maketrans('áéíóúüñ', 'aeiouun')
    return (texto or '').lower().translate(reemplazos)


def _variantes(palabra: str) -> set[str]:
    """Singular y plural aproximados de una palabra del nombre de la categoría."""
    variantes = {palabra}
    if palabra.endswith('es'):
        variantes.add(palabra[:-2])
    if palabra.endswith('s') and len(palabra) > 4:
        variantes.add(palabra[:-1])
    return variantes


def _categoria_del_mensaje(mensaje: str, categorias: list[str]) -> str | None:
    """Identifica la categoría a la que se refiere el usuario, si la menciona."""
    texto = _normalizar(mensaje)
    for categoria in categorias:
        palabras = [
            _normalizar(p) for p in categoria.split() if len(p.strip()) >= 4
        ]
        claves = set()
        for palabra in palabras:
            claves |= _variantes(palabra)
            for base, extras in SINONIMOS_CATEGORIA.items():
                if base in palabra:
                    claves |= set(extras)
        if any(clave and clave in texto for clave in claves):
            return categoria
    return None


def _descripcion_producto(producto) -> str:
    return (
        f'"{producto.nombre}" con un precio de '
        f'${float(producto.precio):,.0f} (stock {producto.stock})'.replace(',', '.')
    )


def consulta_precio_catalogo(mensaje: str, db: Session) -> str | None:
    """
    Responde preguntas como "¿cuál es la tarjeta gráfica más barata?" o
    "¿cuál es el procesador más caro?".

    Devuelve None cuando el mensaje no es una consulta de precio, para que
    sigan funcionando los demás caminos (IA o motor de reglas).
    """
    texto = _normalizar(mensaje)
    quiere_barato = RE_PRECIO_BARATO.search(texto) is not None
    quiere_caro = RE_PRECIO_CARO.search(texto) is not None
    if not (quiere_barato or quiere_caro):
        return None

    # Si menciona ambos, se prioriza la intención de "más barato".
    quiere_barato = quiere_barato and not quiere_caro

    productos = db.query(Producto).filter(Producto.estado == 'activo').all()
    if not productos:
        return 'Todavía no tenemos productos publicados en el catálogo 🙌'

    categorias = sorted({
        p.categoria.nombre for p in productos if p.categoria is not None
    })
    categoria = _categoria_del_mensaje(mensaje, categorias)

    if categoria:
        candidatos = [
            p for p in productos
            if p.categoria is not None and p.categoria.nombre == categoria
        ]
        if not candidatos:
            return (
                f'Por ahora no tenemos productos disponibles en la categoría '
                f'{categoria}. ¿Te ayudo con otra categoría?'
            )
    else:
        candidatos = productos

    candidatos.sort(key=lambda p: float(p.precio or 0), reverse=not quiere_barato)
    elegido = candidatos[0]

    # Alternativas cercanas para dar más opciones al cliente
    alternativas = candidatos[1:3]
    lista_alt = ''
    if alternativas:
        opciones = '\n'.join(f'• {_descripcion_producto(p)}' for p in alternativas)
        lista_alt = '\n\nOtras opciones:\n' + opciones

    if categoria:
        if quiere_barato:
            return (
                f'En {categoria}, el producto más económico es '
                f'{_descripcion_producto(elegido)}.{lista_alt}'
            )
        return (
            f'En {categoria}, el producto más costoso es '
            f'{_descripcion_producto(elegido)}.{lista_alt}'
        )

    if quiere_barato:
        return (
            f'El producto más económico de todo el catálogo es '
            f'{_descripcion_producto(elegido)}.{lista_alt}'
        )
    return (
        f'El producto más costoso de todo el catálogo es '
        f'{_descripcion_producto(elegido)}.{lista_alt}'
    )


def _respuesta_local(mensaje: str, db: Session) -> str:
    """Motor de reglas de respaldo: usa la información real de la base de datos."""
    texto = mensaje.lower()

    def contiene(*claves):
        return any(clave in texto for clave in claves)

    if contiene('hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 'hey'):
        return f'{MENSAJE_BIENVENIDA}\n\n¿En qué puedo ayudarte hoy?'

    if contiene('pqr', 'queja', 'reclamo', 'petición', 'peticion'):
        return (
            'Puedes registrar una PQR desde tu panel de cliente, en la pestaña '
            '"PQR". Describe el tipo (petición, queja o reclamo), un asunto y el '
            'detalle. Queda en estado "pendiente" y el equipo la atiende hasta '
            'dejarla "respondida" o "cerrada". También puedes consultar el estado '
            'de tus solicitudes en cualquier momento.'
        )

    if contiene('factura', 'facturación', 'facturacion', 'comprobante'):
        return (
            'Al registrar tu compra se genera una factura de venta con número '
            'consecutivo. Puedes consultarla y descargarla en PDF desde tu panel '
            'de cliente, en la pestaña "Mis facturas".'
        )

    if contiene('comprar', 'compra', 'carrito', 'pago', 'pagar', 'checkout'):
        return (
            'Comprar es muy fácil: agrega productos al carrito con el botón del '
            'producto, abre el carrito y pulsa "Proceder al pago". Si no has '
            'iniciado sesión te pediremos hacerlo, y luego confirmamos la venta. '
            f'El precio final incluye el {IMPUESTO_PORCENTAJE:.0f}% de impuestos.'
        )

    if contiene('envío', 'envio', 'domicilio', 'entrega'):
        return (
            'Realizamos entregas a domicilio en la ciudad y envíos nacionales con '
            'transportadora. Los tiempos se confirman al momento de la compra y '
            'pueden variar según la ciudad de destino.'
        )

    if contiene('garantía', 'garantia', 'devolución', 'devolucion'):
        return (
            'Todos nuestros productos cuentan con garantía del fabricante y los '
            'servicios con garantía de 30 días sobre el trabajo realizado. Para '
            'hacer efectiva una garantía registra una PQR en tu panel de cliente.'
        )

    if contiene('horario', 'abierto', 'atienden'):
        return (
            'Nuestro horario de atención es de lunes a viernes de 8:00 a.m. a '
            '6:00 p.m. y sábados de 8:00 a.m. a 1:00 p.m.'
        )

    if contiene('contacto', 'correo', 'teléfono', 'telefono', 'whatsapp', 'dirección', 'direccion'):
        return (
            'Puedes contactarnos al correo contacto@techpc.com, por WhatsApp '
            'desde el botón flotante del sitio o visitarnos en nuestra sede. '
            'Con gusto te atendemos.'
        )

    if contiene('servicio', 'ensamblaje', 'mantenimiento', 'instalación', 'instalacion', 'reparación', 'reparacion'):
        servicios = (
            db.query(Servicio)
            .filter(Servicio.estado == 'activo')
            .order_by(Servicio.nombre)
            .limit(8)
            .all()
        )
        if not servicios:
            return 'Por ahora no tenemos servicios publicados. Vuelve pronto 🙌'
        lista = '\n'.join(
            f'• {s.nombre}: ${float(s.precio):,.0f}'.replace(',', '.') for s in servicios
        )
        return f'Estos son nuestros servicios disponibles:\n{lista}\n\n¿Te interesa alguno?'

    if contiene('producto', 'precio', 'cuesta', 'costo', 'catálogo', 'catalogo', 'tienen', 'venden', 'stock'):
        productos = (
            db.query(Producto)
            .filter(Producto.estado == 'activo')
            .order_by(Producto.nombre)
            .limit(8)
            .all()
        )
        if not productos:
            return 'Por ahora el catálogo está vacío. Vuelve pronto 🙌'
        lista = '\n'.join(
            f'• {p.nombre}: ${float(p.precio):,.0f} (stock {p.stock})'.replace(',', '.')
            for p in productos
        )
        return f'Estos son algunos de nuestros productos:\n{lista}\n\n¿Buscas algo en particular?'

    return (
        'Puedo ayudarte con información de productos y servicios, el proceso de '
        'compra, facturas, garantías, envíos y PQR. ¿Sobre cuál de estos temas '
        'necesitas ayuda? También puedes escribirnos a contacto@techpc.com.'
    )


def responder(mensaje: str, historial: list[dict], db: Session) -> tuple[str, str]:
    """
    Genera la respuesta del chatbot.

    Devuelve una tupla (respuesta, fuente) donde fuente es 'ia' o 'local'.
    """
    # Las preguntas de precio se responden siempre con datos exactos del
    # catálogo (no dependen de que la IA esté configurada o acierte).
    catalogo = consulta_precio_catalogo(mensaje, db)
    if catalogo:
        return catalogo, 'local'

    contexto = catalogo_para_contexto(db)
    respuesta = _respuesta_ia(mensaje, historial, contexto)
    if respuesta:
        return respuesta, 'ia'
    return _respuesta_local(mensaje, db), 'local'
