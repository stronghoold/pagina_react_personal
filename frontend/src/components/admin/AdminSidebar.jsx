import { useNavigate } from 'react-router-dom'
import Logo from '../layout/Logo'
import DarkModeToggle from '../DarkModeToggle'

// Secciones del panel (compartidas con AdminPanel)
export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'sales', label: 'Ventas', icon: '🧾' },
  { id: 'invoices', label: 'Facturas', icon: '📄' },
  { id: 'reports', label: 'Reportes', icon: '📈' },
  { id: 'pqr', label: 'PQR', icon: '📨' },
  { id: 'users', label: 'Usuarios', icon: '👤' },
  { id: 'products', label: 'Productos', icon: '📦' },
  { id: 'services', label: 'Servicios', icon: '🔧' },
]

/**
 * Sidebar del panel de administración.
 * En escritorio queda fijo a la izquierda; en móvil se abre como overlay.
 */
const AdminSidebar = ({
  activeTab,
  onNavigate,
  dark,
  onToggleTheme,
  user,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const navigate = useNavigate()

  const initials = `${user?.nombre?.[0] || ''}${user?.apellido?.[0] || ''}`.toUpperCase()

  const goStore = () => {
    onCloseMobile?.()
    navigate('/')
  }

  return (
    <>
      {/* Overlay en móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Encabezado con logo */}
        <div
          className="flex h-16 shrink-0 items-center justify-between border-b px-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Logo dark={dark} onClick={onCloseMobile} />
          <button
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border text-slate-500 lg:hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tarjeta de usuario */}
        <div className="border-b px-4 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                Administrador
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ADMIN_TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onNavigate(tab.id)
                  onCloseMobile?.()
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Pie: ver tienda, tema y cerrar sesión */}
        <div className="space-y-2 border-t px-3 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={goStore}
            title="Ir a la página principal de la tienda"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:brightness-110"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z"
              />
            </svg>
            Ver tienda
          </button>

          <div className="flex items-center gap-2">
            <DarkModeToggle dark={dark} onToggle={onToggleTheme} />
            <button
              onClick={() => {
                onCloseMobile?.()
                onLogout?.()
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
