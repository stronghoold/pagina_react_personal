// Funciones de formato y utilidades compartidas entre componentes.

/** Obtiene las iniciales de un usuario: "Juan Pérez" → "JP" */
export const getInitials = (u) =>
  `${u.nombre?.[0] || ''}${u.apellido?.[0] || ''}`.toUpperCase()

/** Clase CSS del gradiente según el rol del usuario */
export const getRolColor = (rol) => {
  if (rol === 'administrador') return 'from-rose-500 to-orange-500'
  if (rol === 'empleado') return 'from-amber-500 to-yellow-500'
  return 'from-neon-purple to-neon-cyan'
}

/** Clase CSS del badge de estado según el rol */
export const getRolBadge = (rol) => {
  if (rol === 'administrador') return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  if (rol === 'empleado') return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-neon-purple/20 text-neon-purple border-neon-purple/30'
}

// ─── Quinto avance: formatos de dinero, fechas y estados ───

/** Formatea un número a pesos colombianos: 2850000 → "$ 2.850.000" */
export const formatCurrency = (valor) =>
  `$ ${Number(valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`

/** Formatea una fecha ISO a formato corto: 21/09/2026 */
export const formatDate = (fecha) => {
  if (!fecha) return '—'
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha).slice(0, 10)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Formatea una fecha ISO incluyendo la hora: 21/09/2026 10:35 */
export const formatDateTime = (fecha) => {
  if (!fecha) return '—'
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return String(fecha).replace('T', ' ').slice(0, 16)
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Devuelve la fecha de hoy en formato YYYY-MM-DD (para inputs type="date") */
export const hoyISO = () => new Date().toISOString().slice(0, 10)

/** Traduce el estado de una venta o factura a una etiqueta legible */
export const etiquetaEstado = (estado) =>
  ({
    pendiente: 'Pendiente',
    pagada: 'Pagada',
    anulada: 'Anulada',
    emitida: 'Emitida',
    en_proceso: 'En proceso',
    respondida: 'Respondida',
    cerrada: 'Cerrada',
    peticion: 'Petición',
    queja: 'Queja',
    reclamo: 'Reclamo',
    activo: 'Activo',
    inactivo: 'Inactivo',
  })[estado] || estado

/** Clases Tailwind del badge según el estado */
export const colorEstado = (estado) =>
  ({
    pagada: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    emitida: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    en_proceso: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    anulada: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    respondida: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    cerrada: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  })[estado] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
