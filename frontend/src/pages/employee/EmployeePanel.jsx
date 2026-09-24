import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProductsTab from '../admin/ProductsTab'
import ServicesTab from '../admin/ServicesTab'
import DashboardPanel from '../../components/comercial/DashboardPanel'
import VentasPanel from '../../components/comercial/VentasPanel'
import FacturasPanel from '../../components/comercial/FacturasPanel'
import ReportsPanel from '../../components/comercial/ReportsPanel'
import PqrPanel from '../../components/comercial/PqrPanel'
import EmployeeSidebar, { EMPLOYEE_TABS } from '../../components/employee/EmployeeSidebar'

const EmployeePanel = ({ dark, onToggleTheme }) => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!user || (user.rol !== 'empleado' && user.rol !== 'administrador')) navigate('/')
  }, [user, navigate])

  if (!user || (user.rol !== 'empleado' && user.rol !== 'administrador')) return null

  const activeLabel = EMPLOYEE_TABS.find((t) => t.id === activeTab)?.label || ''

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar fijo */}
      <EmployeeSidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        dark={dark}
        onToggleTheme={onToggleTheme}
        user={user}
        onLogout={() => {
          logout()
          navigate('/')
        }}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Contenido principal: queda al lado del sidebar (lg:pl-72) */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        {/* Barra superior del contenido (solo móvil: botón del menú) */}
        <header
          className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-xl lg:hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú del panel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Panel de Empleado
          </h1>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Encabezado de la sección activa */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{activeLabel}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registra ventas, gestiona productos y servicios y atiende las PQR de los clientes.
            </p>
          </div>

          {/* Contenido de la sección */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            {activeTab === 'dashboard' && <DashboardPanel token={token} rol={user.rol} />}
            {activeTab === 'sales' && <VentasPanel token={token} usuario={user.rol} />}
            {activeTab === 'invoices' && <FacturasPanel token={token} usuario={user.rol} />}
            {activeTab === 'reports' && <ReportsPanel token={token} />}
            {activeTab === 'pqr' && <PqrPanel token={token} usuario={user.rol} />}
            {activeTab === 'products' && <ProductsTab token={token} />}
            {activeTab === 'services' && <ServicesTab token={token} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeePanel
