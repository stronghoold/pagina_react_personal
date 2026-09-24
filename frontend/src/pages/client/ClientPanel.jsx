import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API_URL from '../../utils/api'
import ProductsClientTab from './ProductsClientTab'
import ServicesClientTab from './ServicesClientTab'
import ProfileTab from './ProfileTab'
import SwitchAccountTab from './SwitchAccountTab'
import DashboardCliente from '../../components/comercial/DashboardCliente'
import VentasPanel from '../../components/comercial/VentasPanel'
import FacturasPanel from '../../components/comercial/FacturasPanel'
import PqrPanel from '../../components/comercial/PqrPanel'
import ClientSidebar, { CLIENT_TABS } from '../../components/client/ClientSidebar'

const SERVICES_KEY = 'techpc_services'
const PRODUCTS_KEY = 'techpc_products'
const getStored = (key) => { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }

const ClientPanel = ({ dark, onToggleTheme }) => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, servRes] = await Promise.all([
          fetch(`${API_URL}/productos`, { headers }),
          fetch(`${API_URL}/servicios`, { headers }),
        ])
        const [prodData, servData] = await Promise.all([prodRes.json(), servRes.json()])
        const apiProducts = (prodData.products || []).filter((p) => p.estado === 'activo')
        const apiServices = (servData.services || []).filter((s) => s.estado === 'activo')
        setProducts(apiProducts.length > 0 ? apiProducts : getStored(PRODUCTS_KEY).filter((p) => p.estado === 'activo'))
        setServices(apiServices.length > 0 ? apiServices : getStored(SERVICES_KEY).filter((s) => s.estado === 'activo'))
      } catch {
        setProducts(getStored(PRODUCTS_KEY).filter((p) => p.estado === 'activo'))
        setServices(getStored(SERVICES_KEY).filter((s) => s.estado === 'activo'))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (!user) return null

  const activeLabel = CLIENT_TABS.find((t) => t.id === activeTab)?.label || ''

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar fijo */}
      <ClientSidebar
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
            Mi Panel
          </h1>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Encabezado de la sección activa */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              ¡Bienvenido, {user.nombre}!
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeLabel}: explora productos y servicios, revisa tus compras y gestiona tus solicitudes.
            </p>
          </div>

          {/* Contenido de la sección */}
          {loading && ['products', 'services'].includes(activeTab) ? (
            <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
              {activeTab === 'dashboard' && <DashboardCliente token={token} />}
              {activeTab === 'products' && <ProductsClientTab products={products} />}
              {activeTab === 'services' && <ServicesClientTab services={services} />}
              {activeTab === 'purchases' && <VentasPanel token={token} esCliente />}
              {activeTab === 'invoices' && <FacturasPanel token={token} esCliente />}
              {activeTab === 'pqr' && <PqrPanel token={token} esCliente />}
              {activeTab === 'profile' && <ProfileTab user={user} />}
              {activeTab === 'switch' && <SwitchAccountTab user={user} />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default ClientPanel
