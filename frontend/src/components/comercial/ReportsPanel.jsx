import { useCallback, useEffect, useState } from 'react'
import { apiFetch, descargarArchivo } from '../../utils/api'
import { formatCurrency, formatDate, etiquetaEstado, colorEstado, hoyISO } from '../../utils/format'
import StatCard from '../dashboard/StatCard'

/**
 * Reporte diario de ventas (requerimientos 4, 5 y 6).
 * Se consulta la información en FastAPI y se exporta a PDF y Excel.
 */
const ReportsPanel = ({ token }) => {
  const [fecha, setFecha] = useState(hoyISO())
  const [reporte, setReporte] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  const notificar = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3400)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      setReporte(await apiFetch(`/ventas/reporte/diario?fecha=${fecha}`, { token }))
    } catch (err) {
      notificar(err.message, 'error')
      setReporte(null)
    }
    setCargando(false)
  }, [fecha, token])

  useEffect(() => {
    cargar()
  }, [cargar])

  const exportar = async (formato) => {
    try {
      const nombre = await descargarArchivo(
        `/ventas/reporte/diario/${formato}?fecha=${fecha}`,
        token,
        `reporte_ventas_${fecha}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`,
      )
      notificar(`Reporte exportado: ${nombre}`)
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const resumen = reporte?.resumen

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reporte diario de ventas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consulta y exporta las ventas de una fecha determinada.
          </p>
        </div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Fecha del reporte
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 block rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>
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

      <div className="mb-5 flex flex-wrap gap-3">
        <button
          onClick={() => exportar('pdf')}
          className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
        >
          📄 Exportar PDF
        </button>
        <button
          onClick={() => exportar('excel')}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          📊 Exportar Excel
        </button>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Generando reporte…</p>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Ventas del día" value={resumen?.total_ventas ?? 0} icon="🧾" color="indigo" />
            <StatCard label="Facturación" value={formatCurrency(resumen?.facturacion)} icon="💰" color="emerald" />
            <StatCard label="Impuestos" value={formatCurrency(resumen?.impuestos)} icon="🏛️" color="cyan" />
            <StatCard label="Descuentos" value={formatCurrency(resumen?.descuentos)} icon="🏷️" color="amber" />
            <StatCard label="Unidades vendidas" value={resumen?.unidades ?? 0} icon="📦" color="violet" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['N° venta', 'Cliente', 'Productos / Servicios', 'Cant.', 'Valor unit.', 'Total', 'Estado'].map((h) => (
                    <th key={h} className="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reporte?.ventas || []).map((v) =>
                  v.items.map((item, i) => (
                    <tr key={`${v.id}-${item.id}`} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {i === 0 ? v.numero_venta : ''}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{i === 0 ? v.cliente_nombre : ''}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{item.descripcion}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{item.cantidad}</td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.precio_unitario)}
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                        {i === 0 ? formatCurrency(v.total) : ''}
                      </td>
                      <td className="px-3 py-2">
                        {i === 0 && (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado(v.estado)}`}>
                            {etiquetaEstado(v.estado)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )),
                )}
                {(reporte?.ventas || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-400">
                      No hay ventas registradas el {formatDate(fecha)}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPanel
