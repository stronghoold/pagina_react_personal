import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInitials, getRolColor, getRolBadge } from '../../utils/format'
import { getPanelRoute } from './DesktopNav'

const ProfileMenu = ({ dark, user, onLogout, onSwitchAccount }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = getInitials(user)
  const panel = getPanelRoute(user.rol)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-sm font-semibold shadow-sm transition-all ${
          dark
            ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-neon-purple/30 hover:bg-slate-800'
            : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-slate-50'
        }`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${dark ? 'bg-gradient-to-br from-neon-purple to-neon-cyan' : 'bg-gradient-to-br from-primary-600 to-accent-500'}`}>
          {initials}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{user.nombre}</span>
        <svg className={`h-4 w-4 shrink-0 transition-transform text-slate-400 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border shadow-2xl ${dark ? 'border-slate-700 bg-slate-900 shadow-black/50' : 'border-slate-200 bg-white shadow-slate-900/10'}`}>
          {/* Usuario */}
          <div className={`border-b px-4 py-3 ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.nombre} {user.apellido}</p>
            <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.correo}</p>
            <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${dark ? getRolBadge(user.rol) : 'bg-primary-100 text-primary-700 border-primary-200'}`}>
              {user.rol}
            </span>
          </div>

          {/* Panel */}
          <Link to={panel.to} onClick={() => setOpen(false)} className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${dark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {panel.label}
          </Link>

          {/* Cambiar cuenta */}
          <button onClick={() => { setOpen(false); onSwitchAccount() }} className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${dark ? 'text-neon-cyan hover:bg-slate-800' : 'text-primary-600 hover:bg-slate-50'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            Cambiar cuenta
          </button>

          <div className={dark ? 'border-t border-slate-800' : 'border-t border-slate-100'} />

          {/* Cerrar sesión */}
          <button onClick={() => { onLogout(); setOpen(false) }} className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${dark ? 'text-rose-400 hover:bg-rose-950/30 hover:text-rose-300' : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'}`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu
