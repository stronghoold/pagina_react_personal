"""
Generación de facturas a partir de una venta.

La factura se puede crear en dos momentos:

- Automáticamente al registrar la compra desde el sitio web
  (así el cliente recibe su factura en el correo).
- Manualmente desde /api/facturas (administrador o empleado).

Ambos caminos usan esta misma función para que la factura siempre quede
idéntica al detalle de la venta (con los precios congelados del momento).
"""
from sqlalchemy.orm import Session

from ..models import DetalleFactura, Factura
from .numeracion import generar_numero_factura


def crear_factura_desde_venta(
    db: Session,
    venta,
    metodo_pago: str | None = None,
    marcar_pagada: bool = True,
) -> Factura:
    """
    Crea la factura de una venta ya registrada (no hace commit).

    Devuelve el objeto Factura; el llamador decide cuándo confirmar la
    transacción para poder, por ejemplo, enviar el correo después.
    """
    factura = Factura(
        numero_factura=generar_numero_factura(db),
        venta_id=venta.id,
        cliente_id=venta.cliente_id,
        subtotal=venta.subtotal,
        descuento=venta.descuento,
        impuestos=venta.impuestos,
        total=venta.total,
        metodo_pago=metodo_pago or venta.metodo_pago,
        estado='pagada' if venta.estado == 'pagada' else 'emitida',
    )
    # La factura congela el detalle con los precios del momento de la venta.
    factura.detalles = [
        DetalleFactura(
            descripcion=d.descripcion,
            cantidad=d.cantidad,
            precio_unitario=d.precio_unitario,
            descuento=d.descuento,
            subtotal=d.subtotal,
        )
        for d in venta.detalles
    ]

    if marcar_pagada and venta.estado == 'pendiente':
        venta.estado = 'pagada'

    db.add(factura)
    return factura


__all__ = ['crear_factura_desde_venta']
