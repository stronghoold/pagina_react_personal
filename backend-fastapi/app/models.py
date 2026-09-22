"""
Modelos ORM (SQLAlchemy) que representan las tablas de la base de datos.
La estructura es idéntica a la definida en database.sql.

Cuarto avance: roles, permisos, usuarios, categorías, productos y servicios.
Quinto avance:  ventas, detalle_ventas, facturas, detalle_facturas,
                pqr, conversaciones y mensajes.
"""
from sqlalchemy import (
    Column,
    DateTime,
    DECIMAL,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from .database import Base


# ─── Tabla intermedia: rol_permisos ───
rol_permisos = Table(
    'rol_permisos',
    Base.metadata,
    Column('rol_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permiso_id', Integer, ForeignKey('permisos.id'), primary_key=True),
)


class Rol(Base):
    __tablename__ = 'roles'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(30), unique=True, nullable=False)
    descripcion = Column(String(100))

    permisos = relationship('Permiso', secondary=rol_permisos, backref='roles')


class Permiso(Base):
    __tablename__ = 'permisos'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(150))


class Usuario(Base):
    __tablename__ = 'usuarios'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    tipo_documento = Column(String(5), nullable=False)
    numero_documento = Column(String(12), unique=True, nullable=False)
    direccion = Column(String(80), nullable=False)
    telefono = Column(String(16), nullable=False)
    correo = Column(String(80), unique=True, nullable=False, index=True)
    contrasena = Column(String(255), nullable=False)  # Solo se almacena el hash
    rol_id = Column(Integer, ForeignKey('roles.id'), nullable=False, default=3)
    estado = Column(Enum('activo', 'inactivo'), default='activo', nullable=False)
    fecha_registro = Column(DateTime, server_default=func.now())

    rol = relationship('Rol', lazy='joined')
    ventas = relationship('Venta', foreign_keys='Venta.cliente_id', back_populates='cliente')


class CategoriaProducto(Base):
    __tablename__ = 'categorias_productos'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(150))


class Producto(Base):
    __tablename__ = 'productos'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    precio = Column(DECIMAL(12, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    imagen_url = Column(String(255))
    categoria_id = Column(Integer, ForeignKey('categorias_productos.id'))
    estado = Column(Enum('activo', 'inactivo'), default='activo', nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    categoria = relationship('CategoriaProducto', lazy='joined')


class Servicio(Base):
    __tablename__ = 'servicios'

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    precio = Column(DECIMAL(12, 2), nullable=False)
    duracion_estimada = Column(String(50))
    imagen_url = Column(String(255))
    estado = Column(Enum('activo', 'inactivo'), default='activo', nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())


# ════════════════════════════════════════════
# QUINTO AVANCE
# ════════════════════════════════════════════

class Venta(Base):
    """Venta registrada desde el sitio web (productos y/o servicios)."""
    __tablename__ = 'ventas'

    id = Column(Integer, primary_key=True, index=True)
    numero_venta = Column(String(20), unique=True, nullable=False, index=True)
    cliente_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))  # quién registró la operación
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False, default=0)
    metodo_pago = Column(String(30), default='efectivo')
    estado = Column(Enum('pendiente', 'pagada', 'anulada'), default='pendiente', nullable=False)
    fecha = Column(DateTime, server_default=func.now(), nullable=False)

    cliente = relationship('Usuario', foreign_keys=[cliente_id], lazy='joined')
    usuario = relationship('Usuario', foreign_keys=[usuario_id], lazy='joined')
    detalles = relationship(
        'DetalleVenta',
        back_populates='venta',
        cascade='all, delete-orphan',
        lazy='selectin',
    )
    factura = relationship(
        'Factura',
        back_populates='venta',
        uselist=False,
        cascade='all, delete-orphan',
    )


class DetalleVenta(Base):
    """Producto o servicio incluido en una venta (relación venta → detalle)."""
    __tablename__ = 'detalle_ventas'

    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey('ventas.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('producto', 'servicio'), nullable=False, default='producto')
    producto_id = Column(Integer, ForeignKey('productos.id'))
    servicio_id = Column(Integer, ForeignKey('servicios.id'))
    descripcion = Column(String(150), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)

    venta = relationship('Venta', back_populates='detalles')
    producto = relationship('Producto', lazy='joined')
    servicio = relationship('Servicio', lazy='joined')


class Factura(Base):
    """Factura de venta generada a partir de una operación comercial."""
    __tablename__ = 'facturas'

    id = Column(Integer, primary_key=True, index=True)
    numero_factura = Column(String(20), unique=True, nullable=False, index=True)
    venta_id = Column(Integer, ForeignKey('ventas.id', ondelete='CASCADE'), unique=True, nullable=False)
    cliente_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    impuestos = Column(DECIMAL(12, 2), nullable=False, default=0)
    total = Column(DECIMAL(12, 2), nullable=False, default=0)
    metodo_pago = Column(String(30), default='efectivo')
    estado = Column(Enum('emitida', 'pagada', 'anulada'), default='emitida', nullable=False)
    fecha = Column(DateTime, server_default=func.now(), nullable=False)

    venta = relationship('Venta', back_populates='factura')
    cliente = relationship('Usuario', foreign_keys=[cliente_id], lazy='joined')
    detalles = relationship(
        'DetalleFactura',
        back_populates='factura',
        cascade='all, delete-orphan',
        lazy='selectin',
    )


class DetalleFactura(Base):
    """Línea de la factura (queda congelada con el precio del momento)."""
    __tablename__ = 'detalle_facturas'

    id = Column(Integer, primary_key=True, index=True)
    factura_id = Column(Integer, ForeignKey('facturas.id', ondelete='CASCADE'), nullable=False)
    descripcion = Column(String(150), nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(DECIMAL(12, 2), nullable=False, default=0)
    descuento = Column(DECIMAL(12, 2), nullable=False, default=0)
    subtotal = Column(DECIMAL(12, 2), nullable=False, default=0)

    factura = relationship('Factura', back_populates='detalles')


class Pqr(Base):
    """Petición, queja o reclamo registrado por un cliente."""
    __tablename__ = 'pqr'

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    tipo = Column(Enum('peticion', 'queja', 'reclamo'), nullable=False, default='peticion')
    asunto = Column(String(120), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(
        Enum('pendiente', 'en_proceso', 'respondida', 'cerrada'),
        nullable=False,
        default='pendiente',
    )
    respuesta = Column(Text)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now())

    usuario = relationship('Usuario', lazy='joined')


class Conversacion(Base):
    """Conversación del chatbot (permite consultar el historial de atención)."""
    __tablename__ = 'conversaciones'

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'))
    titulo = Column(String(120), default='Nueva conversación')
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)

    usuario = relationship('Usuario', lazy='joined')
    mensajes = relationship(
        'Mensaje',
        back_populates='conversacion',
        cascade='all, delete-orphan',
        lazy='selectin',
    )


class Mensaje(Base):
    """Mensaje individual dentro de una conversación del chatbot."""
    __tablename__ = 'mensajes'

    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey('conversaciones.id', ondelete='CASCADE'), nullable=False)
    rol = Column(Enum('usuario', 'asistente'), nullable=False, default='usuario')
    contenido = Column(Text, nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now(), nullable=False)

    conversacion = relationship('Conversacion', back_populates='mensajes')
