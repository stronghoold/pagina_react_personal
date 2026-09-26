import { NavLink, Link } from 'react-router-dom'
import { getInitials, getRolBadge } from '../../utils/format'
import { getPanelRoute } from './DesktopNav'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/contacto', label: 'Contacto' },
]

const MobileNav = ({ dark, user, onLogout, onSwitchAccount, onClose }) => {
  const initials = user ? getInitials(user) : ''

  return (
    <nav className={`border-t px-4 py-3 backdrop-blur-xl md:hidden ${dark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'}`}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive
                ? dark
                  ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30'
                  : 'bg-primary-100 text-primary-700 border border-primary-200'
                : dark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
          onClick={onClose}
          end={item.to === '/'}
        >
          {item.label}
        </NavLink>
      ))}

      {user ? (
        <>
          <div className={`my-2 flex items-center gap-3 rounded-lg px-3 py-2.5 ${dark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-slate-50 border border-slate-200'}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${dark ? 'bg-gradient-to-br from-neon-purple to-neon-cyan' : 'bg-gradient-to-br from-primary-600 to-accent-500'}`}>
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.nombre} {user.apellido}</p>
              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.correo}</p>
            </div>
          </div>

          {(() => {
            const panel = getPanelRoute(user.rol)
            return (
              <Link to={panel.to} onClick={onClose} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${dark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                {panel.label}
              </Link>
            )
          })()}

          <button onClick={() => { onClose(); onSwitchAccount() }} className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${dark ? 'border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan hover:bg-neon-cyan/10' : 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Cambiar cuenta
          </button>

          <button onClick={() => { onLogout(); onClose() }} className={`mt-1 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${dark ? 'border-rose-900/50 text-rose-400 hover:bg-rose-950/30' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar sesión
          </button>
        </>
      ) : (
        <Link to="/login" onClick={onClose} className={`mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`}>
          Iniciar sesión
        </Link>
      )}
    </nav>
  )
}

export default MobileNav
