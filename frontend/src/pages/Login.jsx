import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import RegisterModal from '../components/RegisterModal'
import { validateEmail, validatePassword } from '../utils/validations'

const Login = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const [form, setForm] = useState({ email: '', contrasena: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [loading, setLoading] = useState(false)

  const validateField = (field, value) =>
    field === 'email' ? validateEmail(value) : validatePassword(value)

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextForm = { ...form, [name]: value }
    setForm(nextForm)
    setLoginError(null)
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {
      email: validateEmail(form.email),
      contrasena: validatePassword(form.contrasena),
    }
    setErrors(newErrors)
    setTouched({ email: true, contrasena: true })

    const isValid = Object.values(newErrors).every((error) => error === null)
    if (!isValid) return

    setLoading(true)
    setLoginError(null)

    try {
      await login(form.email, form.contrasena)

      // Recordar usuario
      if (remember) localStorage.setItem('rememberUser', form.email)
      else localStorage.removeItem('rememberUser')

      navigate('/')
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl shadow-primary-500/10 ring-1 ring-slate-200 dark:ring-slate-700 lg:grid-cols-2">
        {/* Panel de marca */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="8" rx="2" />
                  <rect x="3" y="14" width="10" height="6" rx="2" />
                  <path d="M17 15v4M15 17h4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-xl font-extrabold text-white">TechPC</span>
            </div>
            <h2 className="mt-12 text-3xl font-extrabold leading-tight text-white">
              Tu cuenta,
              <br />
              tu próxima PC gamer.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-100">
              Accede a tu cuenta para gestionar pedidos, cotizaciones y ofertas
              exclusivas en componentes de computador.
            </p>
          </div>
          <ul className="relative space-y-3 text-sm text-primary-100">
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              Ofertas exclusivas para clientes
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              Seguimiento de tus pedidos
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              Asesoría técnica especializada
            </li>
          </ul>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 dark:bg-slate-900 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Iniciar sesión
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Ingresa tus datos para continuar.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="tucorreo@ejemplo.com"
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />

              <div>
                <Input
                  label="Contraseña"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.contrasena}
                  placeholder="••••••••"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label="Mostrar contraseña"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  }
                />
                <div className="mt-2 text-right">
                  <Link
                    to="/recuperar-password"
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* Recordarme */}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 accent-primary-600 focus:ring-primary-500 dark:border-slate-600"
                />
                Recordarme / No cerrar sesión
              </label>

              {loginError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  {loginError}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0 17.9 17.9 0 01-7.5 1.5 17.9 17.9 0 01-7.5-1.5z" />
                    </svg>
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>

            {/* Crear cuenta */}
            <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ¿Aún no tienes cuenta?{' '}
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Crear una cuenta
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de registro */}
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  )
}

export default Login
