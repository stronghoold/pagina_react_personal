import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getInitials, getRolColor, getRolBadge } from '../../utils/format'

const USERS_KEY = 'techpc_users'
const getStoredUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}

const SwitchAccountTab = ({ user: currentUser }) => {
  const { login } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [switchModal, setSwitchModal] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [switchError, setSwitchError] = useState('')
  const [switchLoading, setSwitchLoading] = useState(false)

  useEffect(() => { setAllUsers(getStoredUsers()) }, [])

  const handleSwitchClick = (target) => {
    if (target.rol === 'administrador') {
      setTargetUser(target); setAdminPassword(''); setSwitchError(''); setSwitchModal(true)
    } else {
      doSwitch(target)
    }
  }

  const doSwitch = async (target) => {
    setSwitchLoading(true); setSwitchError('')
    try {
      await login(target.correo, target.contrasena)
      setSwitchModal(false); window.location.reload()
    } catch (err) {
      setSwitchError(err.message || 'Error al cambiar de cuenta.')
    } finally { setSwitchLoading(false) }
  }

  const handleConfirmAdmin = () => {
    if (!adminPassword.trim()) { setSwitchError('Ingresa la contraseña del administrador.'); return }
    if (adminPassword !== targetUser.contrasena) { setSwitchError('Contraseña incorrecta.'); return }
    doSwitch(targetUser)
  }

  return (
    <div className="space-y-6">
      {/* Cuenta actual */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neon-cyan">Cuenta actual</p>
        <div className="flex items-center gap-4 rounded-xl border border-neon-purple/30 bg-neon-purple/5 p-4">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${getRolColor(currentUser.rol)} text-lg font-bold text-white shadow-lg shadow-neon-purple/20`}>
            {getInitials(currentUser)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white">{currentUser.nombre} {currentUser.apellido}</h3>
            <p className="truncate text-sm text-slate-400">{currentUser.correo}</p>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRolBadge(currentUser.rol)}`}>
            {currentUser.rol}
          </span>
        </div>
      </div>

      {/* Otras cuentas */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Cuentas disponibles</p>
        <div className="space-y-3">
          {allUsers.filter((u) => u.correo !== currentUser.correo).map((u) => (
            <button key={u.correo} onClick={() => handleSwitchClick(u)} className="group flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-slate-800/50 p-4 text-left transition-all hover:border-neon-purple/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-neon-purple/5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getRolColor(u.rol)} text-sm font-bold text-white`}>
                {getInitials(u)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white transition-colors group-hover:text-neon-purple">{u.nombre} {u.apellido}</h3>
                <p className="truncate text-sm text-slate-400">{u.correo}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRolBadge(u.rol)}`}>
                  {u.rol}
                </span>
                {u.rol === 'administrador' ? (
                  <span className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Requiere contraseña
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-xs font-semibold text-neon-cyan">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Acceso directo
                  </span>
                )}
              </div>
            </button>
          ))}
          {allUsers.filter((u) => u.correo !== currentUser.correo).length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No hay otras cuentas registradas.</p>
          )}
        </div>
      </div>

      {/* Modal contraseña admin */}
      {switchModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" onClick={() => setSwitchModal(false)} />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-5">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Acceso Admin</h3>
                    <p className="text-xs text-amber-100">Ingresa la contraseña para continuar</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-sm font-bold text-white">
                    {targetUser && getInitials(targetUser)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{targetUser?.nombre} {targetUser?.apellido}</p>
                    <p className="truncate text-xs text-slate-400">{targetUser?.correo}</p>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Contraseña del administrador</label>
                  <input type="password" value={adminPassword} onChange={(e) => { setAdminPassword(e.target.value); setSwitchError('') }} onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdmin()} placeholder="••••••••" autoFocus className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                </div>
                {switchError && <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{switchError}</div>}
                <div className="mt-5 flex gap-3">
                  <button onClick={() => setSwitchModal(false)} className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800">Cancelar</button>
                  <button onClick={handleConfirmAdmin} disabled={switchLoading} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 disabled:opacity-50">
                    {switchLoading ? <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SwitchAccountTab
