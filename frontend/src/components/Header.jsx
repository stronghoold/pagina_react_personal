import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCartDrawer } from '../context/CartDrawerContext'
import DarkModeToggle from './DarkModeToggle'
import SwitchAccountModal from './SwitchAccountModal'
import Logo from './layout/Logo'
import DesktopNav from './layout/DesktopNav'
import MobileNav from './layout/MobileNav'
import ProfileMenu from './layout/ProfileMenu'

const CartButton = ({ dark, onClick, count, className = '' }) => (
  <button
    onClick={onClick}
    className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
      dark
        ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-neon-purple/50 hover:text-neon-cyan hover:shadow-lg hover:shadow-neon-purple/10'
        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-600 hover:shadow-lg hover:shadow-primary-500/10'
    } ${className}`}
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
    </svg>
    {count > 0 && (
      <span className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-lg ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-neon-purple/30' : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-primary-500/30'}`}>
        {count}
      </span>
    )}
  </button>
)

const Header = ({ dark, onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const { openDrawer } = useCartDrawer()

  const handleLogout = () => { logout(); setMenuOpen(false) }

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300"
      style={{
        background: dark ? 'rgba(2,6,23,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: dark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
      }}
    >
      {dark && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo dark={dark} onClick={() => setMenuOpen(false)} />
        <DesktopNav dark={dark} user={user} />

        <div className="flex items-center gap-2.5">
          <DarkModeToggle dark={dark} onToggle={onToggleTheme} />
          <CartButton dark={dark} onClick={openDrawer} count={totalItems} className="hidden md:flex" />

          {user ? (
            <ProfileMenu dark={dark} user={user} onLogout={handleLogout} onSwitchAccount={() => setSwitchOpen(true)} />
          ) : (
            <Link to="/login" className={`hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all md:inline-flex ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-neon-purple/25 hover:shadow-neon-purple/40 hover:brightness-110' : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0 17.9 17.9 0 01-7.5 1.5 17.9 17.9 0 01-7.5-1.5z" />
              </svg>
              Iniciar sesión
            </Link>
          )}

          <CartButton dark={dark} onClick={openDrawer} count={totalItems} className="md:hidden" />

          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Abrir menú" className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border md:hidden ${dark ? 'border-slate-700 bg-slate-800/80 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <MobileNav dark={dark} user={user} onLogout={handleLogout} onSwitchAccount={() => { setMenuOpen(false); setSwitchOpen(true) }} onClose={() => setMenuOpen(false)} />
      )}

      <SwitchAccountModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </header>
  )
}

export default Header
