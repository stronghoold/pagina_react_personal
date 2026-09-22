import { useCallback, useEffect, useState } from 'react'
import { apiFetch, descargarArchivo } from '../../utils/api'
import { formatCurrency, formatDateTime, etiquetaEstado, colorEstado } from '../../utils/format'

/**
 * Consulta de facturas (requerimiento 8) y descarga en PDF (requerimiento 9).
 * El cliente solo ve sus propias facturas; el backend aplica ese filtro.
 */
const FacturasPanel = ({ token, esCliente = false, usuario }) => {
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [clientes, setClientes] = useState([])
  const [filtros, setFiltros] = useState({
    numero_factura: '',
    cliente_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
  })

  const notificar = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3200)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '') params.append(clave, valor)
    })
    try {
      const data = await apiFetch(`/facturas?${params.toString()}`, { token })
      setFacturas(data.invoices || [])
    } catch (err) {
      notificar(err.message, 'error')
    }
    setCargando(false)
  }, [filtros, token])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (esCliente) return
    apiFetch('/dashboard/filtros', { token })
      .then((data) => setClientes(data.clientes || []))
      .catch(() => setClientes([]))
  }, [esCliente, token])

  const descargar = async (factura) => {
    try {
      await descargarArchivo(`/facturas/${factura.id}/pdf`, token, `factura_${factura.numero_factura}.pdf`)
      notificar(`Factura ${factura.numero_factura} descargada en PDF.`)
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const cambiarEstado = async (factura, estado) => {
    try {
      await apiFetch(`/facturas/${factura.id}/estado`, { method: 'PATCH', token, body: { estado } })
      notificar(`Factura ${factura.numero_factura} → ${etiquetaEstado(estado)}.`)
      cargar()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {esCliente ? 'Mis facturas' : 'Facturas de venta'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {facturas.length} factura(s) · Total facturado:{' '}
          <strong className="text-slate-700 dark:text-slate-200">
            {formatCurrency(facturas.reduce((s, f) => s + f.total, 0))}
          </strong>
        </p>
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

      <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          N° de factura
          <input
            type="text"
            placeholder="F-20260921-0001"
            value={filtros.numero_factura}
            onChange={(e) => setFiltros({ ...filtros, numero_factura: e.target.value })}
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
          Fecha inicial
          <input
            type="date"
            value={filtros.fecha_inicio}
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
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Estado
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            <option value="emitida">Emitida</option>
            <option value="pagada">Pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </label>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Cargando facturas…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['N° factura', 'Fecha', 'Venta', 'Cliente', 'Total', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {f.numero_factura}
                  </td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(f.fecha)}</td>
                  <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{f.numero_venta}</td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{f.cliente_nombre}</td>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(f.total)}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado(f.estado)}`}>
                      {etiquetaEstado(f.estado)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setDetalle(f)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => descargar(f)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                      >
                        PDF
                      </button>
                      {!esCliente && f.estado !== 'pagada' && (
                        <button
                          onClick={() => cambiarEstado(f, 'pagada')}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
                        >
                          Marcar pagada
                        </button>
                      )}
                      {usuario === 'administrador' && f.estado !== 'anulada' && (
                        <button
                          onClick={() => cambiarEstado(f, 'anulada')}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {facturas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                    No hay facturas registradas. Genera una desde el historial de ventas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setDetalle(null)} />
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Factura {detalle.numero_factura}
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {formatDateTime(detalle.fecha)} · Venta {detalle.numero_venta} · {detalle.metodo_pago}
            </p>

            <div className="mb-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50 sm:grid-cols-2">
              <p className="text-slate-600 dark:text-slate-300">
                <span className="block text-xs font-semibold uppercase text-slate-400">Cliente</span>
                {detalle.cliente_nombre}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="block text-xs font-semibold uppercase text-slate-400">Documento</span>
                {detalle.cliente_documento}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="block text-xs font-semibold uppercase text-slate-400">Correo</span>
                {detalle.cliente_correo}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                <span className="block text-xs font-semibold uppercase text-slate-400">Estado</span>
                {etiquetaEstado(detalle.estado)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Descripción</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Cant.</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
                    <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.items.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{i.descripcion}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{i.cantidad}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                        {formatCurrency(i.precio_unitario)}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{formatCurrency(i.subtotal)}</td>
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

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => descargar(detalle)}
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Descargar PDF
              </button>
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
    </div>
  )
}

export default FacturasPanel
