import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/contacto', label: 'Contacto' },
]

export const getPanelRoute = (rol) => {
  if (rol === 'administrador') return { to: '/admin', label: '⚙️ Admin' }
  if (rol === 'empleado') return { to: '/empleado', label: '🔧 Empleado' }
  return { to: '/cliente', label: '👤 Mi Panel' }
}

const linkClass = (dark) => ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-all ${
    isActive
      ? dark
        ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/30'
        : 'bg-primary-100 text-primary-700 border border-primary-200'
      : dark
        ? 'text-slate-400 hover:text-white hover:bg-white/5'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`

const DesktopNav = ({ dark, user }) => (
  <nav className="hidden items-center gap-1 md:flex">
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} className={linkClass(dark)} end={item.to === '/'}>
        {item.label}
      </NavLink>
    ))}
    {user && (() => {
      const panel = getPanelRoute(user.rol)
      return (
        <NavLink key={panel.to} to={panel.to} className={linkClass(dark)}>
          {panel.label}
        </NavLink>
      )
    })()}
  </nav>
)

export default DesktopNav
