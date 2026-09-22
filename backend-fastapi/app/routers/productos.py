"""
Rutas de productos: /api/productos
- GET    /api/productos                → listar productos (público)
- GET    /api/productos/categorias     → listar categorías (público)
- GET    /api/productos/{id}           → consultar producto (público)
- POST   /api/productos                → crear producto (admin o empleado)
- PUT    /api/productos/{id}           → actualizar producto (admin o empleado)
- DELETE /api/productos/{id}           → eliminar producto (solo admin)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CategoriaProducto, Producto, Usuario
from ..schemas import CategoriaOut, ProductoCreate, ProductoOut, ProductoUpdate
from ..security import require_roles

router = APIRouter(prefix='/api/productos', tags=['Productos'])


@router.get('')
def listar_productos(db: Session = Depends(get_db)):
    """Lista todos los productos con su categoría."""
    productos = db.query(Producto).order_by(Producto.fecha_creacion.desc()).all()
    return {
        'products': [
            {
                **ProductoOut.model_validate(p).model_dump(),
                'categoria_nombre': p.categoria.nombre if p.categoria else None,
            }
            for p in productos
        ]
    }


@router.get('/categorias')
def listar_categorias(db: Session = Depends(get_db)):
    """Lista las categorías de productos."""
    categorias = db.query(CategoriaProducto).order_by(CategoriaProducto.id).all()
    return {
        'categories': [
            CategoriaOut.model_validate(c).model_dump() for c in categorias
        ]
    }


@router.get('/{producto_id}')
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    """Consulta un producto por ID."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Producto no encontrado.',
        )
    data = ProductoOut.model_validate(producto).model_dump()
    data['categoria_nombre'] = producto.categoria.nombre if producto.categoria else None
    return {'product': data}


@router.post('', status_code=status.HTTP_201_CREATED)
def crear_producto(
    body: ProductoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador', 'empleado')),
):
    """Crea un producto nuevo (solo administrador o empleado)."""
    producto = Producto(
        nombre=body.nombre,
        descripcion=body.descripcion,
        precio=body.precio,
        stock=body.stock,
        imagen_url=body.imagen_url,
        categoria_id=body.categoria_id,
        estado='activo',
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return {
        'message': 'Producto creado exitosamente.',
        'product': {'id': producto.id, 'nombre': producto.nombre, 'precio': float(producto.precio), 'stock': producto.stock},
    }


@router.put('/{producto_id}')
def actualizar_producto(
    producto_id: int,
    body: ProductoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador', 'empleado')),
):
    """Actualiza un producto (solo administrador o empleado)."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Producto no encontrado.',
        )
    data = body.model_dump(exclude_unset=True, exclude_none=True)
    for campo, valor in data.items():
        setattr(producto, campo, valor)
    db.commit()
    return {'message': 'Producto actualizado exitosamente.'}


@router.delete('/{producto_id}')
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles('administrador')),
):
    """Elimina un producto (solo administrador)."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if producto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Producto no encontrado.',
        )
    db.delete(producto)
    db.commit()
    return {'message': 'Producto eliminado exitosamente.'}