import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { formatCurrency, formatDateTime, etiquetaEstado, colorEstado, hoyISO } from '../../utils/format'
import VentasModal from './VentasModal'

/**
 * Historial de ventas con filtros y registro de nuevas ventas.
 * Se usa en el panel de administración, el de empleado y el de cliente
 * (en el panel del cliente solo se muestran sus propias compras).
 */
const VentasPanel = ({ token, esCliente = false, usuario }) => {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [modalVenta, setModalVenta] = useState(false)
  const [facturas, setFacturas] = useState([])
  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])
  const [clientes, setClientes] = useState([])

  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    cliente_id: '',
    producto_id: '',
    servicio_id: '',
    estado: '',
    numero: '',
    total_min: '',
    total_max: '',
  })

  const notificar = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3200)
  }

  const cargarCatalogos = useCallback(async () => {
    try {
      const data = await apiFetch('/dashboard/filtros', { token })
      setProductos(data.productos || [])
      setServicios(data.servicios || [])
      setClientes(data.clientes || [])
    } catch {
      // Si el usuario es cliente, usa los catálogos públicos
      try {
        const [prod, serv] = await Promise.all([
          apiFetch('/productos'),
          apiFetch('/servicios'),
        ])
        setProductos(prod.products || [])
        setServicios(serv.services || [])
      } catch {
        /* catálogos no disponibles */
      }
    }
  }, [token])

  const cargarVentas = useCallback(async () => {
    setCargando(true)
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '' && valor !== null) params.append(clave, valor)
    })
    try {
      const data = await apiFetch(`/ventas?${params.toString()}`, { token })
      setVentas(data.sales || [])
    } catch (err) {
      notificar(err.message, 'error')
    }
    setCargando(false)
  }, [filtros, token])

  const cargarFacturas = useCallback(async () => {
    try {
      const data = await apiFetch('/facturas', { token })
      setFacturas(data.invoices || [])
    } catch {
      setFacturas([])
    }
  }, [token])

  useEffect(() => {
    cargarCatalogos()
    cargarFacturas()
  }, [cargarCatalogos, cargarFacturas])

  useEffect(() => {
    cargarVentas()
  }, [cargarVentas])

  const totalFiltrado = useMemo(
    () => ventas.filter((v) => v.estado !== 'anulada').reduce((s, v) => s + v.total, 0),
    [ventas],
  )

  const cambiarEstado = async (venta, estado) => {
    try {
      await apiFetch(`/ventas/${venta.id}/estado`, { method: 'PATCH', token, body: { estado } })
      notificar(`Venta ${venta.numero_venta} → ${etiquetaEstado(estado)}.`)
      cargarVentas()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const generarFactura = async (venta) => {
    try {
      const data = await apiFetch('/facturas', { method: 'POST', token, body: { venta_id: venta.id } })
      notificar(`Factura ${data.invoice.numero_factura} generada.`)
      cargarVentas()
      cargarFacturas()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const eliminarVenta = async (venta) => {
    if (!confirm(`¿Eliminar la venta ${venta.numero_venta}? Esta acción no se puede deshacer.`)) return
    try {
      await apiFetch(`/ventas/${venta.id}`, { method: 'DELETE', token })
      notificar('Venta eliminada.')
      cargarVentas()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const limpiarFiltros = () =>
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      cliente_id: '',
      producto_id: '',
      servicio_id: '',
      estado: '',
      numero: '',
      total_min: '',
      total_max: '',
    })

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {esCliente ? 'Mis compras' : 'Historial de ventas'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {ventas.length} venta(s) · Total facturado (sin anuladas):{' '}
            <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(totalFiltrado)}</strong>
          </p>
        </div>
        {!esCliente && (
          <button
            onClick={() => setModalVenta(true)}
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            + Registrar venta
          </button>
        )}
      </div>

      {mensaje && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            mensaje.tipo === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Fecha inicial
          <input
            type="date"
            value={filtros.fecha_inicio}
            max={hoyISO()}
            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
            className={`mt-1 ${claseInput}`}
          />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Fecha final
          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
            className={`mt-1 ${claseInput}`}
          />
        </label>
        {!esCliente && (
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Cliente
            <select
              value={filtros.cliente_id}
              onChange={(e) => setFiltros({ ...filtros, cliente_id: e.target.value })}
              className={`mt-1 ${claseInput}`}
            >
              <option value="">Todos</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Producto
          <select
            value={filtros.producto_id}
            onChange={(e) => setFiltros({ ...filtros, producto_id: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Servicio
          <select
            value={filtros.servicio_id}
            onChange={(e) => setFiltros({ ...filtros, servicio_id: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Estado
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          N° de venta
          <input
            type="text"
            placeholder="V-20260921-0001"
            value={filtros.numero}
            onChange={(e) => setFiltros({ ...filtros, numero: e.target.value })}
            className={`mt-1 ${claseInput}`}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Valor mín.
            <input
              type="number"
              min="0"
              value={filtros.total_min}
              onChange={(e) => setFiltros({ ...filtros, total_min: e.target.value })}
              className={`mt-1 ${claseInput}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Valor máx.
            <input
              type="number"
              min="0"
              value={filtros.total_max}
              onChange={(e) => setFiltros({ ...filtros, total_max: e.target.value })}
              className={`mt-1 ${claseInput}`}
            />
          </label>
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
          <button
            onClick={limpiarFiltros}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Cargando ventas…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['N° venta', 'Fecha', 'Cliente', 'Detalle', 'Total', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {v.numero_venta}
                  </td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(v.fecha)}</td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {v.cliente_nombre}
                    <span className="block text-xs text-slate-400">{v.cliente_correo}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                    <span className="block">{v.items.length} ítem(s)</span>
                    <span className="block max-w-[16rem] truncate text-xs">
                      {v.items.map((i) => `${i.cantidad}× ${i.descripcion}`).join(', ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(v.total)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado(v.estado)}`}
                    >
                      {etiquetaEstado(v.estado)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setDetalle(v)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      >
                        Ver
                      </button>
                      {!esCliente && !v.tiene_factura && v.estado !== 'anulada' && (
                        <button
                          onClick={() => generarFactura(v)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                        >
                          Facturar
                        </button>
                      )}
                      {!esCliente && v.estado !== 'pagada' && (
                        <button
                          onClick={() => cambiarEstado(v, 'pagada')}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
                        >
                          Marcar pagada
                        </button>
                      )}
                      {usuario === 'administrador' && (
                        <button
                          onClick={() => eliminarVenta(v)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                    No se encontraron ventas con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Venta {detalle.numero_venta}
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {formatDateTime(detalle.fecha)} · Cliente: {detalle.cliente_nombre} · Registró:{' '}
              {detalle.usuario_nombre || '—'}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Ítem</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Tipo</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Cant.</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.items.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{i.descripcion}</td>
                      <td className="px-3 py-2 capitalize text-slate-500 dark:text-slate-400">{i.tipo}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{i.cantidad}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                        {formatCurrency(i.precio_unitario)}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                        {formatCurrency(i.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-1 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(detalle.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Descuento</span>
                <span>- {formatCurrency(detalle.descuento)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Impuestos</span>
                <span>{formatCurrency(detalle.impuestos)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(detalle.total)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              {detalle.tiene_factura && (
                <span className="mr-auto self-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Factura generada
                </span>
              )}
              <button
                onClick={() => setDetalle(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVenta && (
        <VentasModal
          token={token}
          productos={productos}
          servicios={servicios}
          clientes={clientes}
          onClose={() => setModalVenta(false)}
          onCreada={() => {
            setModalVenta(false)
            notificar('Venta registrada exitosamente.')
            cargarVentas()
          }}
        />
      )}

      {facturas.length > 0 && (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Facturas emitidas: {facturas.length} · Consulta y descarga en la pestaña «Facturas».
        </p>
      )}
    </div>
  )
}

export default VentasPanel
