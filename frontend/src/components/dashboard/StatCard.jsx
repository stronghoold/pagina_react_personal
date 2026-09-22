/**
 * Tarjeta de indicador (Card) reutilizable en los Dashboards.
 * Los valores provienen de los endpoints de estadísticas de FastAPI.
 */
const colores = {
  indigo: 'from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  violet: 'from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20',
  emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
  cyan: 'from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  slate: 'from-slate-500/15 to-slate-500/5 text-slate-600 dark:text-slate-300 border-slate-500/20',
}

const StatCard = ({ label, value, icon = '📊', color = 'indigo', hint }) => (
  <div
    className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition-transform hover:-translate-y-0.5 ${
      colores[color] || colores.indigo
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm dark:bg-slate-900/60">
        {icon}
      </span>
    </div>
  </div>
)

export default StatCard
