"""
Esquemas (Pydantic) para validar los datos recibidos por la API.
Diferenciados de los modelos ORM: aquí se validan tipos, campos
obligatorios, longitudes, formatos, correos y contraseñas.
"""
import re

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

# ─── Expresiones regulares de validación ───
DOCUMENTO_RE = re.compile(r'^\d{6,12}$')
TELEFONO_RE = re.compile(r'^[0-9+\-\s]{7,16}$')
CONTRASENA_RE = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$')
# Al menos una letra, un número y un carácter especial, mínimo 8 caracteres


# ════════════════════════════════════════════
# Autenticación
# ════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: EmailStr
    contrasena: str = Field(min_length=1, max_length=255)


class LoginResponse(BaseModel):
    message: str
    token: str
    user: dict


class RecuperarPasswordRequest(BaseModel):
    """Solicitud de recuperación: solo se necesita el correo del usuario."""
    email: EmailStr


# ════════════════════════════════════════════
# Usuarios
# ════════════════════════════════════════════

class UsuarioRegistro(BaseModel):
    """El Frontend envía tipoDocumento/numeroDocumento (camelCase);
    también se aceptan los nombres de columna en snake_case."""
    nombre: str = Field(min_length=2, max_length=50)
    apellido: str = Field(min_length=2, max_length=50)
    tipo_documento: str = Field(min_length=2, max_length=5, validation_alias='tipoDocumento', serialization_alias='tipoDocumento')
    numero_documento: str = Field(min_length=6, max_length=12, validation_alias='numeroDocumento', serialization_alias='numeroDocumento')
    direccion: str = Field(min_length=5, max_length=80)
    telefono: str = Field(min_length=7, max_length=16)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=255)

    model_config = {'populate_by_name': True}

    @field_validator('nombre', 'apellido')
    @classmethod
    def solo_letras(cls, v, info):
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s\'-]+$', v):
            raise ValueError(f'{info.field_name.capitalize()} solo puede contener letras.')
        return v.strip()

    @field_validator('tipo_documento')
    @classmethod
    def tipo_documento_valido(cls, v):
        if v.upper() not in {'CC', 'TI', 'CE', 'PP', 'NIT'}:
            raise ValueError('Tipo de documento no válido (CC, TI, CE, PP, NIT).')
        return v.upper()

    @field_validator('numero_documento')
    @classmethod
    def numero_documento_valido(cls, v):
        if not DOCUMENTO_RE.match(v):
            raise ValueError('Número de documento debe tener entre 6 y 12 dígitos.')
        return v

    @field_validator('telefono')
    @classmethod
    def telefono_valido(cls, v):
        if not TELEFONO_RE.match(v):
            raise ValueError('Teléfono no válido (7 a 16 caracteres: dígitos, +, - o espacios).')
        return v

    @field_validator('contrasena')
    @classmethod
    def contrasena_valida(cls, v):
        if not CONTRASENA_RE.match(v):
            raise ValueError('La contraseña debe tener mínimo 8 caracteres, incluir una letra, un número y un carácter especial.')
        return v


class UsuarioUpdate(BaseModel):
    """Todos los campos opcionales para la edición de usuarios."""
    nombre: str | None = Field(default=None, min_length=2, max_length=50)
    apellido: str | None = Field(default=None, min_length=2, max_length=50)
    tipo_documento: str | None = Field(default=None, min_length=2, max_length=5)
    numero_documento: str | None = Field(default=None, min_length=6, max_length=12)
    direccion: str | None = Field(default=None, min_length=5, max_length=80)
    telefono: str | None = Field(default=None, min_length=7, max_length=16)
    correo: EmailStr | None = None
    contrasena: str | None = Field(default=None, min_length=8, max_length=255)
    rol_id: int | None = None
    estado: str | None = None

    @field_validator('estado')
    @classmethod
    def estado_valido(cls, v):
        if v is not None and v not in {'activo', 'inactivo'}:
            raise ValueError("El estado debe ser 'activo' o 'inactivo'.")
        return v

    @field_validator('rol_id')
    @classmethod
    def rol_valido(cls, v):
        if v is not None and v not in {1, 2, 3}:
            raise ValueError('Rol no válido.')
        return v


class UsuarioOut(BaseModel):
    """Representación de un usuario sin contraseña."""
    id: int
    nombre: str
    apellido: str
    tipo_documento: str | None = None
    numero_documento: str | None = None
    direccion: str | None = None
    telefono: str | None = None
    correo: str
    estado: str
    rol_id: int
    rol_nombre: str | None = None
    fecha_registro: object | None = None

    model_config = {'from_attributes': True}


class EstadoUpdate(BaseModel):
    estado: str = Field(pattern='^(activo|inactivo)$')


# ════════════════════════════════════════════
# Roles y permisos
# ════════════════════════════════════════════

class RolOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

    model_config = {'from_attributes': True}


# ════════════════════════════════════════════
# Productos
# ════════════════════════════════════════════

class ProductoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio: float = Field(gt=0, le=999999999999.99)
    stock: int = Field(ge=0, le=1000000)
    imagen_url: str | None = Field(default=None, max_length=255)
    categoria_id: int | None = None


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=255)
    categoria_id: int | None = None
    estado: str | None = Field(default=None, pattern='^(activo|inactivo)$')


class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    precio: float
    stock: int
    imagen_url: str | None = None
    categoria_id: int | None = None
    categoria_nombre: str | None = None
    estado: str
    fecha_creacion: object | None = None

    model_config = {'from_attributes': True}


class CategoriaOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None

    model_config = {'from_attributes': True}


# ════════════════════════════════════════════
# Servicios
# ════════════════════════════════════════════

class ServicioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio: float = Field(gt=0, le=999999999999.99)
    duracion_estimada: str | None = Field(default=None, max_length=50)
    imagen_url: str | None = Field(default=None, max_length=255)


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio: float | None = Field(default=None, gt=0)
    duracion_estimada: str | None = Field(default=None, max_length=50)
    imagen_url: str | None = Field(default=None, max_length=255)
    estado: str | None = Field(default=None, pattern='^(activo|inactivo)$')


class ServicioOut(BaseModel):
    id: int
    nombre: str
    descripcion: str | None = None
    precio: float
    duracion_estimada: str | None = None
    imagen_url: str | None = None
    estado: str
    fecha_creacion: object | None = None

    model_config = {'from_attributes': True}


# ════════════════════════════════════════════
# VENTAS Y DETALLE DE VENTAS (quinto avance)
# ════════════════════════════════════════════

TIPO_ITEM = '^(producto|servicio)$'
ESTADO_VENTA = '^(pendiente|pagada|anulada)$'


class DetalleVentaCreate(BaseModel):
    """Línea de la venta: puede ser un producto o un servicio."""
    tipo: str = Field(pattern=TIPO_ITEM)
    producto_id: int | None = Field(default=None, gt=0)
    servicio_id: int | None = Field(default=None, gt=0)
    cantidad: int = Field(gt=0, le=10000)
    descuento: float = Field(default=0, ge=0)
    # Si no se envía el precio, se toma el registrado en el catálogo.
    precio_unitario: float | None = Field(default=None, gt=0)

    @model_validator(mode='after')
    def referencia_valida(self):
        if self.tipo == 'producto' and not self.producto_id:
            raise ValueError('Debes enviar producto_id cuando el tipo es producto.')
        if self.tipo == 'servicio' and not self.servicio_id:
            raise ValueError('Debes enviar servicio_id cuando el tipo es servicio.')
        return self


class VentaCreate(BaseModel):
    cliente_id: int | None = Field(default=None, gt=0)
    metodo_pago: str = Field(default='efectivo', max_length=30)
    descuento: float = Field(default=0, ge=0)
    estado: str = Field(default='pendiente', pattern=ESTADO_VENTA)
    items: list[DetalleVentaCreate] = Field(min_length=1)


class DetalleVentaOut(BaseModel):
    id: int
    tipo: str
    producto_id: int | None = None
    servicio_id: int | None = None
    descripcion: str
    cantidad: int
    precio_unitario: float
    descuento: float
    subtotal: float

    model_config = {'from_attributes': True}


class VentaOut(BaseModel):
    id: int
    numero_venta: str
    cliente_id: int
    cliente_nombre: str | None = None
    cliente_correo: str | None = None
    usuario_id: int | None = None
    usuario_nombre: str | None = None
    subtotal: float
    descuento: float
    impuestos: float
    total: float
    metodo_pago: str | None = None
    estado: str
    fecha: object | None = None
    items: list[DetalleVentaOut] = []
    tiene_factura: bool = False

    model_config = {'from_attributes': True}


class VentaEstadoUpdate(BaseModel):
    estado: str = Field(pattern=ESTADO_VENTA)


# ════════════════════════════════════════════
# FACTURAS (quinto avance)
# ════════════════════════════════════════════

ESTADO_FACTURA = '^(emitida|pagada|anulada)$'


class FacturaCreate(BaseModel):
    """Genera la factura a partir de una venta ya registrada."""
    venta_id: int = Field(gt=0)
    metodo_pago: str | None = Field(default=None, max_length=30)


class DetalleFacturaOut(BaseModel):
    id: int
    descripcion: str
    cantidad: int
    precio_unitario: float
    descuento: float
    subtotal: float

    model_config = {'from_attributes': True}


class FacturaOut(BaseModel):
    id: int
    numero_factura: str
    venta_id: int
    numero_venta: str | None = None
    cliente_id: int
    cliente_nombre: str | None = None
    cliente_correo: str | None = None
    cliente_documento: str | None = None
    subtotal: float
    descuento: float
    impuestos: float
    total: float
    metodo_pago: str | None = None
    estado: str
    fecha: object | None = None
    items: list[DetalleFacturaOut] = []

    model_config = {'from_attributes': True}


class FacturaEstadoUpdate(BaseModel):
    estado: str = Field(pattern=ESTADO_FACTURA)


# ════════════════════════════════════════════
# PQR (quinto avance)
# ════════════════════════════════════════════

TIPO_PQR = '^(peticion|queja|reclamo)$'
ESTADO_PQR = '^(pendiente|en_proceso|respondida|cerrada)$'


class PqrCreate(BaseModel):
    tipo: str = Field(pattern=TIPO_PQR)
    asunto: str = Field(min_length=3, max_length=120)
    descripcion: str = Field(min_length=10, max_length=2000)


class PqrUpdate(BaseModel):
    tipo: str | None = Field(default=None, pattern=TIPO_PQR)
    asunto: str | None = Field(default=None, min_length=3, max_length=120)
    descripcion: str | None = Field(default=None, min_length=10, max_length=2000)
    estado: str | None = Field(default=None, pattern=ESTADO_PQR)
    respuesta: str | None = Field(default=None, max_length=2000)


class PqrOut(BaseModel):
    id: int
    usuario_id: int
    usuario_nombre: str | None = None
    usuario_correo: str | None = None
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: str | None = None
    fecha_creacion: object | None = None
    fecha_actualizacion: object | None = None

    model_config = {'from_attributes': True}


# ════════════════════════════════════════════
# CHATBOT (quinto avance)
# ════════════════════════════════════════════

class ChatRequest(BaseModel):
    mensaje: str = Field(min_length=1, max_length=2000)
    conversacion_id: int | None = Field(default=None, gt=0)


class MensajeOut(BaseModel):
    id: int
    rol: str
    contenido: str
    fecha_creacion: object | None = None

    model_config = {'from_attributes': True}


class ChatResponse(BaseModel):
    conversacion_id: int
    respuesta: str
    fuente: str  # 'ia' o 'local'
    sugerencias: list[str] = []


class ConversacionOut(BaseModel):
    id: int
    usuario_id: int | None = None
    titulo: str
    fecha_creacion: object | None = None
    mensajes: list[MensajeOut] = []

    model_config = {'from_attributes': True}