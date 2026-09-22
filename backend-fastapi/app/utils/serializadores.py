"""
Funciones que convierten los modelos ORM (ventas, facturas y PQR) a
diccionarios listos para responder por la API.

Se centralizan aquí para que todos los routers devuelvan exactamente la
misma estructura que espera el Frontend en React.
"""
def detalle_venta_a_dict(detalle) -> dict:
    return {
        'id': detalle.id,
        'tipo': detalle.tipo,
        'producto_id': detalle.producto_id,
        'servicio_id': detalle.servicio_id,
        'descripcion': detalle.descripcion,
        'cantidad': detalle.cantidad,
        'precio_unitario': float(detalle.precio_unitario or 0),
        'descuento': float(detalle.descuento or 0),
        'subtotal': float(detalle.subtotal or 0),
    }


def venta_a_dict(venta, incluir_items: bool = True) -> dict:
    cliente = venta.cliente
    usuario = venta.usuario
    data = {
        'id': venta.id,
        'numero_venta': venta.numero_venta,
        'cliente_id': venta.cliente_id,
        'cliente_nombre': f'{cliente.nombre} {cliente.apellido}' if cliente else None,
        'cliente_correo': cliente.correo if cliente else None,
        'usuario_id': venta.usuario_id,
        'usuario_nombre': (
            f'{usuario.nombre} {usuario.apellido}' if usuario else None
        ),
        'subtotal': float(venta.subtotal or 0),
        'descuento': float(venta.descuento or 0),
        'impuestos': float(venta.impuestos or 0),
        'total': float(venta.total or 0),
        'metodo_pago': venta.metodo_pago,
        'estado': venta.estado,
        'fecha': venta.fecha,
        'tiene_factura': venta.factura is not None,
        'items': [],
    }
    if incluir_items:
        data['items'] = [detalle_venta_a_dict(d) for d in venta.detalles]
    else:
        data['items'] = []
    return data


def detalle_factura_a_dict(detalle) -> dict:
    return {
        'id': detalle.id,
        'descripcion': detalle.descripcion,
        'cantidad': detalle.cantidad,
        'precio_unitario': float(detalle.precio_unitario or 0),
        'descuento': float(detalle.descuento or 0),
        'subtotal': float(detalle.subtotal or 0),
    }


def factura_a_dict(factura) -> dict:
    cliente = factura.cliente
    data = {
        'id': factura.id,
        'numero_factura': factura.numero_factura,
        'venta_id': factura.venta_id,
        'numero_venta': factura.venta.numero_venta if factura.venta else None,
        'cliente_id': factura.cliente_id,
        'cliente_nombre': f'{cliente.nombre} {cliente.apellido}' if cliente else None,
        'cliente_correo': cliente.correo if cliente else None,
        'cliente_documento': (
            f'{cliente.tipo_documento} {cliente.numero_documento}' if cliente else None
        ),
        'subtotal': float(factura.subtotal or 0),
        'descuento': float(factura.descuento or 0),
        'impuestos': float(factura.impuestos or 0),
        'total': float(factura.total or 0),
        'metodo_pago': factura.metodo_pago,
        'estado': factura.estado,
        'fecha': factura.fecha,
        'items': [detalle_factura_a_dict(d) for d in factura.detalles],
    }
    return data


def pqr_a_dict(pqr) -> dict:
    usuario = pqr.usuario
    return {
        'id': pqr.id,
        'usuario_id': pqr.usuario_id,
        'usuario_nombre': f'{usuario.nombre} {usuario.apellido}' if usuario else None,
        'usuario_correo': usuario.correo if usuario else None,
        'tipo': pqr.tipo,
        'asunto': pqr.asunto,
        'descripcion': pqr.descripcion,
        'estado': pqr.estado,
        'respuesta': pqr.respuesta,
        'fecha_creacion': pqr.fecha_creacion,
        'fecha_actualizacion': pqr.fecha_actualizacion,
    }


__all__ = [
    'detalle_venta_a_dict',
    'venta_a_dict',
    'detalle_factura_a_dict',
    'factura_a_dict',
    'pqr_a_dict',
]
