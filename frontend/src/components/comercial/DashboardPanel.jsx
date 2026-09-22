import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { formatCurrency } from '../../utils/format'
import StatCard from '../dashboard/StatCard'
import BarChart from '../charts/BarChart'
import LineChart from '../charts/LineChart'

/**
 * Dashboard con indicadores (Card), gráfico de barras y gráfico lineal
 * alimentados por los endpoints de estadísticas de FastAPI.
 * Requerimientos 10, 11, 12, 13 y 15.
 */
const DashboardPanel = ({ token, rol = 'administrador' }) => {
  const esAdmin = rol === 'administrador'
  const [resumen, setResumen] = useState(null)
  const [series, setSeries] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    producto_id: '',
    servicio_id: '',
    estado: '',
    cliente_id: '',
    agrupacion: 'dia',
  })
  const [filtrosDisponibles, setFiltrosDisponibles] = useState(null)

  const cargarResumen = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await apiFetch(esAdmin ? '/dashboard/admin' : '/dashboard/empleado', { token })
      setResumen(data)
    } catch (err) {
      setError(err.message)
    }
    setCargando(false)
  }, [esAdmin, token])

  const cargarSeries = useCallback(async () => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '') params.append(clave, valor)
    })
    try {
      const data = await apiFetch(`/dashboard/ventas?${params.toString()}`, { token })
      setSeries(data)
    } catch {
      setSeries(null)
    }
  }, [filtros, token])

  useEffect(() => {
    cargarResumen()
  }, [cargarResumen])

  useEffect(() => {
    cargarSeries()
  }, [cargarSeries])

  useEffect(() => {
    apiFetch('/dashboard/filtros', { token })
      .then(setFiltrosDisponibles)
      .catch(() => setFiltrosDisponibles(null))
  }, [token])

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  if (cargando && !resumen) {
    return <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Cargando dashboard…</p>
  }

  if (error) {
    const esErrorConexion = /fetch|network|failed/i.test(error)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
        <p className="font-semibold">No se pudo cargar el dashboard</p>
        <p className="mt-1">{error}</p>
        {esErrorConexion && (
          <p className="mt-2 text-xs">
            Verifica que MySQL (XAMPP) esté iniciado y que el backend FastAPI esté corriendo:{' '}
            <code className="rounded bg-rose-100 px-1 py-0.5 font-mono dark:bg-rose-900/40">cd backend-fastapi && python run.py</code>
          </p>
        )}
      </div>
    )
  }

  const ind = resumen?.indicadores || {}
  const graficos = resumen?.graficos || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {esAdmin ? 'Dashboard administrativo' : 'Dashboard de ventas (empleado)'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Toda la información se calcula desde la base de datos a través de FastAPI.
        </p>
      </div>

      {/* ── Indicadores (Cards) ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {esAdmin ? (
          <>
            <StatCard label="Usuarios" value={ind.total_usuarios ?? 0} icon="👥" color="indigo"
              hint={`${ind.usuarios_activos ?? 0} activos`} />
            <StatCard label="Productos" value={ind.total_productos ?? 0} icon="📦" color="violet"
              hint={`${ind.productos_stock_bajo ?? 0} con stock bajo`} />
            <StatCard label="Servicios" value={ind.total_servicios ?? 0} icon="🔧" color="cyan" />
            <StatCard label="Ventas" value={ind.total_ventas ?? 0} icon="🧾" color="amber"
              hint={`${ind.total_facturas ?? 0} facturas`} />
            <StatCard label="Facturación total" value={formatCurrency(ind.facturacion_total)} icon="💰" color="emerald" />
            <StatCard label="Impuestos" value={formatCurrency(ind.impuestos_total)} icon="🏛️" color="slate" />
            <StatCard label="PQR pendientes" value={ind.pqr_pendientes ?? 0} icon="📨" color="rose"
              hint={`${ind.pqr_total ?? 0} en total`} />
            <StatCard label="PQR en proceso" value={ind.pqr_en_proceso ?? 0} icon="⏳" color="amber" />
          </>
        ) : (
          <>
            <StatCard label="Productos" value={ind.total_productos ?? 0} icon="📦" color="violet"
              hint={`${ind.productos_stock_bajo ?? 0} con stock bajo`} />
            <StatCard label="Servicios" value={ind.total_servicios ?? 0} icon="🔧" color="cyan" />
            <StatCard label="Ventas de hoy" value={ind.ventas_hoy ?? 0} icon="🛒" color="amber"
              hint={formatCurrency(ind.facturacion_hoy)} />
            <StatCard label="Ventas totales" value={ind.total_ventas ?? 0} icon="🧾" color="indigo" />
            <StatCard label="Facturación" value={formatCurrency(ind.facturacion_total)} icon="💰" color="emerald" />
            <StatCard label="PQR pendientes" value={ind.pqr_pendientes ?? 0} icon="📨" color="rose" />
            <StatCard label="PQR en proceso" value={ind.pqr_en_proceso ?? 0} icon="⏳" color="amber" />
          </>
        )}
      </div>

      {/* ── Filtros ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Filtros de los gráficos</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Fecha inicial
            <input type="date" value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className={`mt-1 ${claseInput}`} />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Fecha final
            <input type="date" value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className={`mt-1 ${claseInput}`} />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Producto
            <select value={filtros.producto_id}
              onChange={(e) => setFiltros({ ...filtros, producto_id: e.target.value })}
              className={`mt-1 ${claseInput}`}>
              <option value="">Todos</option>
              {(filtrosDisponibles?.productos || []).map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Servicio
            <select value={filtros.servicio_id}
              onChange={(e) => setFiltros({ ...filtros, servicio_id: e.target.value })}
              className={`mt-1 ${claseInput}`}>
              <option value="">Todos</option>
              {(filtrosDisponibles?.servicios || []).map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Estado
            <select value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className={`mt-1 ${claseInput}`}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Cliente
            <select value={filtros.cliente_id}
              onChange={(e) => setFiltros({ ...filtros, cliente_id: e.target.value })}
              className={`mt-1 ${claseInput}`}>
              <option value="">Todos</option>
              {(filtrosDisponibles?.clientes || []).map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Agrupar por
            <select value={filtros.agrupacion}
              onChange={(e) => setFiltros({ ...filtros, agrupacion: e.target.value })}
              className={`mt-1 ${claseInput}`}>
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={() =>
                setFiltros({ fecha_inicio: '', fecha_fin: '', producto_id: '', servicio_id: '', estado: '', cliente_id: '', agrupacion: 'dia' })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {series && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <StatCard label="Ventas filtradas" value={series.indicadores.total_ventas} icon="🧾" color="indigo" />
            <StatCard label="Facturación" value={formatCurrency(series.indicadores.facturacion)} icon="💰" color="emerald" />
            <StatCard label="Ticket promedio" value={formatCurrency(series.indicadores.ticket_promedio)} icon="📈" color="cyan" />
            <StatCard label="Unidades vendidas" value={series.indicadores.unidades_vendidas} icon="📦" color="violet" />
          </div>
        )}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">
            Ventas por {filtros.agrupacion}
          </h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Gráfico de barras · facturación</p>
          <BarChart data={series?.series} formato={formatCurrency} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">Tendencia de ventas</h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Gráfico lineal · últimos 14 días</p>
          <LineChart data={graficos.ventas_por_dia} formato={formatCurrency} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-200">Ventas por mes</h3>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Gráfico de barras · histórico</p>
          <BarChart data={graficos.ventas_por_mes} color="#10b981" colorOscuro="#047857" formato={formatCurrency} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Productos más vendidos</h3>
          {(resumen?.top_productos || []).length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="space-y-2">
              {resumen.top_productos.map((p, i) => (
                <li
                  key={p.nombre}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      {i + 1}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300">{p.nombre}</span>
                  </span>
                  <span className="ml-3 shrink-0 text-right">
                    <span className="block font-semibold text-slate-900 dark:text-white">{p.unidades} u.</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(p.valor)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mb-2 mt-5 text-sm font-bold text-slate-800 dark:text-slate-200">Ventas por estado</h3>
          <ul className="grid grid-cols-3 gap-2 text-center text-sm">
            {(resumen?.por_estado || []).map((e) => (
              <li key={e.estado} className="rounded-xl bg-slate-50 px-2 py-2 dark:bg-slate-800/50">
                <span className="block text-lg font-bold text-slate-900 dark:text-white">{e.cantidad}</span>
                <span className="block text-xs capitalize text-slate-500 dark:text-slate-400">{e.estado}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardPanel
