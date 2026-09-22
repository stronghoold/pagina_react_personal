import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { formatCurrency, formatDateTime, etiquetaEstado, colorEstado } from '../../utils/format'
import StatCard from '../dashboard/StatCard'
import BarChart from '../charts/BarChart'
import LineChart from '../charts/LineChart'

/**
 * Dashboard del cliente (requerimientos 12 y 15): muestra únicamente la
 * información propia del usuario autenticado, obtenida desde FastAPI.
 */
const DashboardCliente = ({ token }) => {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        setDatos(await apiFetch('/dashboard/cliente', { token }))
      } catch (err) {
        setError(err.message)
      }
      setCargando(false)
    }
    cargar()
  }, [token])

  if (cargando) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Cargando dashboard…</p>
  }
  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
        {error}
      </p>
    )
  }

  const ind = datos?.indicadores || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mi resumen</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Consulta el comportamiento de tus compras y el estado de tus solicitudes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Compras realizadas" value={ind.total_compras ?? 0} icon="🛒" color="indigo" />
        <StatCard label="Total gastado" value={formatCurrency(ind.total_gastado)} icon="💰" color="emerald" />
        <StatCard label="Facturas" value={ind.total_facturas ?? 0} icon="🧾" color="cyan" />
        <StatCard label="PQR activas" value={ind.pqr_pendientes ?? 0} icon="📨" color="amber"
          hint={`${ind.pqr_total ?? 0} en total`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">Compras por mes</h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Gráfico de barras</p>
          <BarChart data={datos?.graficos?.compras_por_mes} formato={formatCurrency} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">Tendencia de los últimos 30 días</h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Gráfico lineal</p>
          <LineChart data={datos?.graficos?.compras_por_dia} formato={formatCurrency} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Últimas compras</h3>
        {(datos?.ultimas_compras || []).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Aún no has realizado compras. Explora el catálogo en la pestaña «Productos».
          </p>
        ) : (
          <ul className="space-y-2">
            {datos.ultimas_compras.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800/50"
              >
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {c.numero_venta}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(c.fecha)}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(c.total)}</span>
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado(c.estado)}`}>
                  {etiquetaEstado(c.estado)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default DashboardCliente
