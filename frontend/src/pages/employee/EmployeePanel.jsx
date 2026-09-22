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

const tabs = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'sales', label: '🧾 Ventas' },
  { id: 'invoices', label: '📄 Facturas' },
  { id: 'reports', label: '📈 Reportes' },
  { id: 'pqr', label: '📨 PQR' },
  { id: 'products', label: '📦 Productos' },
  { id: 'services', label: '🔧 Servicios' },
]

const EmployeePanel = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (!user || (user.rol !== 'empleado' && user.rol !== 'administrador')) navigate('/')
  }, [user, navigate])

  if (!user || (user.rol !== 'empleado' && user.rol !== 'administrador')) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Panel de Empleado</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Registra ventas, gestiona productos y servicios y atiende las PQR.
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {activeTab === 'dashboard' && <DashboardPanel token={token} rol={user.rol} />}
        {activeTab === 'sales' && <VentasPanel token={token} usuario={user.rol} />}
        {activeTab === 'invoices' && <FacturasPanel token={token} usuario={user.rol} />}
        {activeTab === 'reports' && <ReportsPanel token={token} />}
        {activeTab === 'pqr' && <PqrPanel token={token} usuario={user.rol} />}
        {activeTab === 'products' && <ProductsTab token={token} />}
        {activeTab === 'services' && <ServicesTab token={token} />}
      </div>
    </div>
  )
}

export default EmployeePanel
