import { useState } from 'react'
import { apiFetch } from '../../utils/api'
import { formatCurrency } from '../../utils/format'

const IVA = 19 // % — debe coincidir con IMPUESTO_PORCENTAJE del backend

const itemVacio = () => ({ tipo: 'producto', item_id: '', cantidad: 1, descuento: 0 })

/**
 * Modal para registrar una venta con su detalle (requerimientos 1 y 2).
 * Permite combinar productos y servicios en la misma operación.
 */
const VentasModal = ({ token, productos, servicios, clientes, onClose, onCreada }) => {
  const [clienteId, setClienteId] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [estado, setEstado] = useState('pagada')
  const [descuentoGlobal, setDescuentoGlobal] = useState(0)
  const [items, setItems] = useState([itemVacio()])
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const catalogo = (tipo) => (tipo === 'producto' ? productos : servicios)

  const precioDe = (item) => {
    const encontrado = catalogo(item.tipo).find((c) => String(c.id) === String(item.item_id))
    return encontrado ? Number(encontrado.precio) : 0
  }

  const detalle = items.map((item) => {
    const bruto = precioDe(item) * Number(item.cantidad || 0)
    const descuento = Math.min(Number(item.descuento || 0), bruto)
    return { ...item, bruto, descuento, subtotal: bruto - descuento }
  })

  const subtotal = detalle.reduce((s, d) => s + d.bruto, 0)
  const descuentos = detalle.reduce((s, d) => s + d.descuento, 0) + Number(descuentoGlobal || 0)
  const base = Math.max(subtotal - descuentos, 0)
  const impuestos = Math.round(base * IVA) / 100
  const total = base + impuestos

  const actualizar = (indice, cambios) =>
    setItems((prev) => prev.map((item, i) => (i === indice ? { ...item, ...cambios } : item)))

  const agregarItem = () => setItems((prev) => [...prev, itemVacio()])
  const quitarItem = (indice) => setItems((prev) => prev.filter((_, i) => i !== indice))

  const guardar = async (e) => {
    e.preventDefault()
    setError(null)

    const validos = items.filter((i) => i.item_id)
    if (validos.length === 0) {
      setError('Agrega al menos un producto o servicio a la venta.')
      return
    }
    if (clientes.length > 0 && !clienteId) {
      setError('Selecciona el cliente de la venta.')
      return
    }

    const body = {
      cliente_id: clienteId ? Number(clienteId) : null,
      metodo_pago: metodoPago,
      estado,
      descuento: Number(descuentoGlobal || 0),
      items: validos.map((i) => ({
        tipo: i.tipo,
        producto_id: i.tipo === 'producto' ? Number(i.item_id) : null,
        servicio_id: i.tipo === 'servicio' ? Number(i.item_id) : null,
        cantidad: Number(i.cantidad) || 1,
        descuento: Number(i.descuento) || 0,
      })),
    }

    setEnviando(true)
    try {
      await apiFetch('/ventas', { method: 'POST', token, body })
      onCreada()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Registrar venta</h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Selecciona el cliente y agrega los productos y servicios vendidos.
        </p>

        <form onSubmit={guardar} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Cliente *
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={`mt-1 ${claseInput}`}>
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Método de pago
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={`mt-1 ${claseInput}`}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Estado
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={`mt-1 ${claseInput}`}>
                <option value="pagada">Pagada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Detalle de la venta</h4>
              <button
                type="button"
                onClick={agregarItem}
                className="rounded-lg border border-primary-300 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-950/30"
              >
                + Agregar ítem
              </button>
            </div>

            {items.map((item, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:grid-cols-12">
                <label className="sm:col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tipo
                  <select
                    value={item.tipo}
                    onChange={(e) => actualizar(i, { tipo: e.target.value, item_id: '' })}
                    className={`mt-1 ${claseInput}`}
                  >
                    <option value="producto">Producto</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </label>
                <label className="sm:col-span-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {item.tipo === 'producto' ? 'Producto' : 'Servicio'}
                  <select
                    value={item.item_id}
                    onChange={(e) => actualizar(i, { item_id: e.target.value })}
                    className={`mt-1 ${claseInput}`}
                  >
                    <option value="">Selecciona…</option>
                    {catalogo(item.tipo).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} — {formatCurrency(c.precio)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => actualizar(i, { cantidad: e.target.value })}
                    className={`mt-1 ${claseInput}`}
                  />
                </label>
                <label className="sm:col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Descuento
                  <input
                    type="number"
                    min="0"
                    value={item.descuento}
                    onChange={(e) => actualizar(i, { descuento: e.target.value })}
                    className={`mt-1 ${claseInput}`}
                  />
                </label>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => quitarItem(i)}
                    disabled={items.length === 1}
                    className="w-full rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    Quitar
                  </button>
                </div>
                <p className="sm:col-span-12 text-xs text-slate-500 dark:text-slate-400">
                  Subtotal del ítem: <strong>{formatCurrency(detalle[i]?.subtotal || 0)}</strong>
                </p>
              </div>
            ))}
          </div>

          <label className="block max-w-xs text-xs font-semibold text-slate-600 dark:text-slate-300">
            Descuento general
            <input
              type="number"
              min="0"
              value={descuentoGlobal}
              onChange={(e) => setDescuentoGlobal(e.target.value)}
              className={`mt-1 ${claseInput}`}
            />
          </label>

          <div className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Descuentos</span>
              <span>- {formatCurrency(descuentos)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Impuestos ({IVA}%)</span>
              <span>{formatCurrency(impuestos)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {enviando ? 'Guardando…' : 'Registrar venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VentasModal
