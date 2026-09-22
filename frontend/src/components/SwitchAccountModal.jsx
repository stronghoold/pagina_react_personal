import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getInitials, getRolColor, getRolBadge } from '../utils/format'

const eyeIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const eyeOffIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

// Obtener usuarios guardados en localStorage
const USERS_KEY = 'techpc_users'
const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

const SwitchAccountModal = ({ open, onClose }) => {
  const { user } = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [targetUser, setTargetUser] = useState(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('list') // 'list' | 'password'

  // Cargar usuarios al abrir
  useEffect(() => {
    if (open) {
      const users = getStoredUsers()
      setAllUsers(users)
      setStep('list')
      setTargetUser(null)
      setAdminPassword('')
      setShowPassword(false)
      setError('')
    }
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  // Seleccionar una cuenta
  const handleSelect = (target) => {
    if (target.correo === user.correo) return // Ya está en esta cuenta
    if (target.rol === 'administrador') {
      setTargetUser(target)
      setAdminPassword('')
      setError('')
      setStep('password')
    } else {
      doSwitch(target)
    }
  }

  // Ejecutar cambio — bypass backend, set user directly from localStorage
  const doSwitch = async (target) => {
    setLoading(true)
    setError('')
    try {
      const userData = {
        id: target.id,
        nombre: target.nombre,
        apellido: target.apellido,
        correo: target.correo,
        rol: target.rol || 'cliente',
        rol_id: target.rol_id || 3,
      }
      const fakeToken = `local_${target.id}_${Date.now()}`
      localStorage.setItem('techpc_token', fakeToken)
      localStorage.setItem('techpc_user', JSON.stringify(userData))
      onClose()
      window.location.reload()
    } catch (err) {
      setError(err.message || 'Error al cambiar de cuenta.')
    } finally {
      setLoading(false)
    }
  }

  // Confirmar contraseña admin
  const handleConfirm = () => {
    if (!adminPassword.trim()) {
      setError('Ingresa la contraseña del administrador.')
      return
    }
    if (adminPassword !== targetUser.contrasena) {
      setError('Contraseña incorrecta. Intenta de nuevo.')
      return
    }
    doSwitch(targetUser)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 px-6 py-5">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {step === 'list' ? 'Cambiar cuenta' : 'Confirmar acceso'}
                  </h3>
                  <p className="text-xs text-primary-100">
                    {step === 'list' ? 'Selecciona la cuenta que quieres usar' : 'Ingresa la contraseña para continuar'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            {step === 'list' ? (
              <div className="space-y-2">
                {allUsers.map((u) => {
                  const isCurrent = u.correo === user.correo
                  return (
                    <button
                      key={u.correo}
                      onClick={() => handleSelect(u)}
                      disabled={isCurrent}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isCurrent
                          ? 'border-neon-purple/30 bg-neon-purple/5 cursor-default'
                          : 'border-slate-800 bg-slate-800/50 hover:border-neon-purple/40 hover:bg-slate-800 hover:shadow-lg hover:shadow-neon-purple/5'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getRolColor(u.rol)} text-xs font-bold text-white`}>
                        {getInitials(u)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isCurrent ? 'text-neon-purple' : 'text-white group-hover:text-neon-purple'} transition-colors`}>
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{u.correo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getRolBadge(u.rol)}`}>
                          {u.rol}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-neon-cyan">ACTUAL</span>
                        ) : u.rol === 'administrador' ? (
                          <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Paso 2: Contraseña */
              <div className="space-y-4">
                {/* Usuario seleccionado */}
                <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-3 border border-slate-700/50">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getRolColor(targetUser?.rol)} text-xs font-bold text-white`}>
                    {targetUser && getInitials(targetUser)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{targetUser?.nombre} {targetUser?.apellido}</p>
                    <p className="text-xs text-slate-400 truncate">{targetUser?.correo}</p>
                  </div>
                </div>

                {/* Campo contraseña */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Contraseña del administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => { setAdminPassword(e.target.value); setError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition-all focus:border-neon-purple/50 focus:outline-none focus:ring-2 focus:ring-neon-purple/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? eyeOffIcon : eyeIcon}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('list'); setError(''); setAdminPassword('') }}
                    className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-neon-purple/25 transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                    Entrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SwitchAccountModal
