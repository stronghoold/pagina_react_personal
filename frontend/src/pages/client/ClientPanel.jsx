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

const SERVICES_KEY = 'techpc_services'
const PRODUCTS_KEY = 'techpc_products'
const getStored = (key) => { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } }

const ClientPanel = () => {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
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

  const tabs = [
    { id: 'dashboard', label: '📊 Mi resumen' },
    { id: 'products', label: '📦 Productos' },
    { id: 'services', label: '🔧 Servicios' },
    { id: 'purchases', label: '🛒 Mis compras' },
    { id: 'invoices', label: '📄 Mis facturas' },
    { id: 'pqr', label: '📨 PQR' },
    { id: 'profile', label: '👤 Mi Perfil' },
    { id: 'switch', label: '🔄 Cambiar cuenta' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-neon-purple/20 bg-gradient-to-r from-slate-900 via-primary-950/80 to-slate-900 p-6 text-white shadow-xl shadow-neon-purple/10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-neon-purple/15 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-neon-cyan/10 blur-[50px]" />
        <h1 className="relative text-2xl font-extrabold">¡Bienvenido, {user.nombre}!</h1>
        <p className="relative mt-1 text-sm text-slate-300">
          Explora productos y servicios, revisa tus compras y gestiona tus solicitudes.
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border-neon-purple text-neon-purple'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && ['products', 'services'].includes(activeTab) ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
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
    </div>
  )
}

export default ClientPanel
