import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, descargarArchivo } from '../utils/api'
import { formatCurrency } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const IVA = 19 // % — debe coincidir con IMPUESTO_PORCENTAJE del backend

/** Normaliza un texto para comparar nombres del carrito con el catálogo real. */
const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Busca en el catálogo el ítem que corresponde a un producto del carrito. */
const buscarEnCatalogo = (nombre, catalogo) => {
  const objetivo = normalizar(nombre)
  const palabras = objetivo.split(' ').filter((p) => p.length >= 4)
  return (
    catalogo.find((c) => normalizar(c.nombre) === objetivo) ||
    catalogo.find((c) => {
      const actual = normalizar(c.nombre)
      return actual.includes(objetivo) || objetivo.includes(actual)
    }) ||
    catalogo.find((c) => {
      const actual = normalizar(c.nombre)
      return palabras.some((p) => actual.includes(p))
    }) ||
    null
  )
}

/**
 * Procedimiento de compra desde el sitio web (requerimientos 1 y 2).
 * Toma los ítems del carrito, los cruza con el catálogo real de la base de
 * datos y registra la venta a través de FastAPI.
 */
const CheckoutModal = ({ open, onClose }) => {
  const { user, token } = useAuth()
  const { items, totalPrice, clearCart } = useCart()

  const [catalogo, setCatalogo] = useState([])
  const [lineas, setLineas] = useState([])
  const [metodoPago, setMetodoPago] = useState('tarjeta')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [ventaCreada, setVentaCreada] = useState(null)
  const [facturaCreada, setFacturaCreada] = useState(null)
  const [correoEnviado, setCorreoEnviado] = useState(false)
  const [descargando, setDescargando] = useState(false)

  // Cargar el catálogo real y cruzar los productos del carrito
  useEffect(() => {
    if (!open) return
    let activo = true
    const cargar = async () => {
      try {
        const [prod, serv] = await Promise.all([apiFetch('/productos'), apiFetch('/servicios')])
        if (!activo) return
        const productos = (prod.products || []).filter((p) => p.estado === 'activo')
        const servicios = (serv.services || []).filter((s) => s.estado === 'activo')
        const todos = [
          ...productos.map((p) => ({ ...p, tipo: 'producto' })),
          ...servicios.map((s) => ({ ...s, tipo: 'servicio' })),
        ]
        setCatalogo(todos)

        const iniciales = []
        items.forEach((item) => {
          const encontrado = buscarEnCatalogo(item.name, todos)
          if (encontrado) {
            iniciales.push({
              clave: `${encontrado.tipo}-${encontrado.id}`,
              tipo: encontrado.tipo,
              item_id: encontrado.id,
              nombre: encontrado.nombre,
              precio: Number(encontrado.precio),
              cantidad: item.quantity || 1,
            })
          }
        })
        setLineas(iniciales)
      } catch (err) {
        setError(err.message)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [open, items])

  const subtotal = useMemo(
    () => lineas.reduce((s, l) => s + l.precio * Number(l.cantidad || 0), 0),
    [lineas],
  )
  const impuestos = Math.round(subtotal * IVA) / 100
  const total = subtotal + impuestos
  const totalCarrito = totalPrice

  const agregarLinea = (tipo, id) => {
    const encontrado = catalogo.find((c) => c.tipo === tipo && String(c.id) === String(id))
    if (!encontrado) return
    setLineas((prev) => {
      const existente = prev.find((l) => l.clave === `${tipo}-${encontrado.id}`)
      if (existente) {
        return prev.map((l) =>
          l.clave === existente.clave ? { ...l, cantidad: l.cantidad + 1 } : l,
        )
      }
      return [
        ...prev,
        {
          clave: `${tipo}-${encontrado.id}`,
          tipo,
          item_id: encontrado.id,
          nombre: encontrado.nombre,
          precio: Number(encontrado.precio),
          cantidad: 1,
        },
      ]
    })
  }

  const cambiarCantidad = (clave, cantidad) =>
    setLineas((prev) =>
      prev
        .map((l) => (l.clave === clave ? { ...l, cantidad: Number(cantidad) } : l))
        .filter((l) => l.cantidad > 0),
    )

  const confirmar = async () => {
    setError(null)
    if (lineas.length === 0) {
      setError('No hay ítems válidos del catálogo en tu carrito. Agrega productos disponibles.')
      return
    }
    setCargando(true)
    try {
      const data = await apiFetch('/ventas', {
        method: 'POST',
        token,
        body: {
          metodo_pago: metodoPago,
          estado: 'pagada',
          items: lineas.map((l) => ({
            tipo: l.tipo,
            producto_id: l.tipo === 'producto' ? l.item_id : null,
            servicio_id: l.tipo === 'servicio' ? l.item_id : null,
            cantidad: Number(l.cantidad) || 1,
            descuento: 0,
          })),
        },
      })
      setVentaCreada(data.sale)
      setFacturaCreada(data.invoice || null)
      setCorreoEnviado(Boolean(data.correo_enviado))
      clearCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (!open) return null

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {ventaCreada ? '¡Compra registrada! 🎉' : 'Finalizar compra'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {ventaCreada
                ? 'Tu factura fue generada y enviada al correo de tu cuenta.'
                : 'Revisa los ítems antes de confirmar la venta.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!user ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-semibold">Necesitas iniciar sesión para completar la compra.</p>
            <p className="mt-1">
              Al registrarte o iniciar sesión podremos asociar la venta a tu cuenta y emitir tu factura.
            </p>
            <Link
              to="/login"
              onClick={onClose}
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : ventaCreada ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              <p className="text-sm">
                Número de venta: <strong>{ventaCreada.numero_venta}</strong>
              </p>
              {facturaCreada && (
                <p className="mt-1 text-sm">
                  Factura: <strong>{facturaCreada.numero_factura}</strong>
                </p>
              )}
              <p className="mt-1 text-sm">
                Total registrado: <strong>{formatCurrency(ventaCreada.total)}</strong>
              </p>
              <p className="mt-1 text-sm">Estado: {ventaCreada.estado}</p>
            </div>

            {facturaCreada && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  {correoEnviado
                    ? `Enviamos la factura al correo ${user?.correo || 'de tu cuenta'}.`
                    : 'La factura quedó registrada. Podrás enviarla o descargarla desde tu panel.'}
                </p>
                <button
                  onClick={async () => {
                    setDescargando(true)
                    try {
                      await descargarArchivo(
                        `/facturas/${facturaCreada.id}/pdf`,
                        token,
                        `factura_${facturaCreada.numero_factura}.pdf`,
                      )
                    } finally {
                      setDescargando(false)
                    }
                  }}
                  disabled={descargando}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 disabled:opacity-60 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-950/40"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {descargando ? 'Generando…' : 'Descargar factura PDF'}
                </button>
              </div>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Puedes consultar el detalle y todas tus facturas en «Mi panel → Mis compras».
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Entendido
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {lineas.length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                Los productos del carrito no coinciden con el catálogo actual de la tienda. Agrega
                productos disponibles para continuar.
              </div>
            )}

            {lineas.map((l) => (
              <div
                key={l.clave}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{l.nombre}</p>
                  <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                    {l.tipo} · {formatCurrency(l.precio)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={l.cantidad}
                    onChange={(e) => cambiarCantidad(l.clave, e.target.value)}
                    className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="w-28 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(l.precio * l.cantidad)}
                  </span>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Agregar del catálogo
              </p>
              <select
                value=""
                onChange={(e) => {
                  const [tipo, id] = e.target.value.split(':')
                  if (tipo) agregarLinea(tipo, id)
                }}
                className={claseInput}
              >
                <option value="">Selecciona un producto o servicio…</option>
                {catalogo.map((c) => (
                  <option key={`${c.tipo}-${c.id}`} value={`${c.tipo}:${c.id}`}>
                    {c.tipo === 'producto' ? '📦' : '🔧'} {c.nombre} — {formatCurrency(c.precio)}
                  </option>
                ))}
              </select>
            </div>

            <label className="block max-w-xs text-xs font-semibold text-slate-600 dark:text-slate-300">
              Método de pago
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className={`mt-1 ${claseInput}`}
              >
                <option value="tarjeta">Tarjeta</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </label>

            <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Impuestos ({IVA}%)</span>
                <span>{formatCurrency(impuestos)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="pt-1 text-xs text-slate-400">
                Carrito: {formatCurrency(totalCarrito)} (referencia del catálogo de la tienda)
              </p>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                disabled={cargando}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:brightness-110 disabled:opacity-60"
              >
                {cargando ? 'Registrando…' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal
