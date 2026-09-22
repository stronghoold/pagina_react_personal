import { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CartDrawerProvider, useCartDrawer } from './context/CartDrawerContext'
import CartSidebar from './components/CartSidebar'
import Chatbot from './components/Chatbot'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import useDarkMode from './hooks/useDarkMode'
import Index from './pages/Index'
import QuienesSomos from './pages/QuienesSomos'
import Contacto from './pages/Contacto'
import Login from './pages/Login'
import RecoverPasswordPage from './pages/RecoverPasswordPage'
import AdminPanel from './pages/admin/AdminPanel'
import EmployeePanel from './pages/employee/EmployeePanel'
import ClientPanel from './pages/client/ClientPanel'
import PCBuilder from './pages/PCBuilder'

// Sube al inicio de la página al cambiar de ruta
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Botón flotante para que el administrador vuelva al panel desde la tienda
const AdminFloatingButton = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!user || user.rol !== 'administrador') return null
  if (pathname === '/admin') return null

  return (
    <button
      onClick={() => navigate('/admin')}
      title="Volver al panel de administración"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-primary-500/30 transition-all hover:scale-105 hover:brightness-110"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.98 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.98 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Panel admin
    </button>
  )
}

function AppContent() {
  const { dark, toggle } = useDarkMode()
  const { open, closeDrawer } = useCartDrawer()
  const { pathname } = useLocation()

  // En el panel de administración todo el chrome de la tienda desaparece:
  // solo queda el sidebar del panel.
  const isAdminRoute = pathname === '/admin'

  return (
      <div className="flex min-h-screen flex-col transition-colors duration-300" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ScrollToTop />
        {!isAdminRoute && <Header dark={dark} onToggleTheme={toggle} />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/armar-pc" element={<PCBuilder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-password" element={<RecoverPasswordPage />} />
            {/* Paneles por rol */}
            <Route path="/admin" element={<AdminPanel dark={dark} onToggleTheme={toggle} />} />
            <Route path="/empleado" element={<EmployeePanel />} />
            <Route path="/cliente" element={<ClientPanel />} />
            {/* Ruta por defecto para URLs desconocidas */}
            <Route path="*" element={<Index />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer dark={dark} />}
        {!isAdminRoute && <WhatsAppButton />}
        {!isAdminRoute && <Chatbot />}
        {!isAdminRoute && <CartSidebar open={open} onClose={closeDrawer} />}
        {!isAdminRoute && <AdminFloatingButton />}
      </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartDrawerProvider>
          <AppContent />
        </CartDrawerProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
