import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import PasswordStrength from './PasswordStrength'
import {
  validateName,
  validateDocumentNumber,
  validateAddress,
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  sanitizeDigits,
  sanitizeLetters,
} from '../utils/validations'

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PP', label: 'Pasaporte' },
]

const initialForm = {
  nombre: '',
  apellido: '',
  tipoDocumento: '',
  numeroDocumento: '',
  direccion: '',
  telefono: '',
  correo: '',
  contrasena: '',
  confirmarContrasena: '',
}

// Cada validador recibe el formulario completo para poder comparar contraseñas.
const validators = {
  nombre: (f) => validateName(f.nombre, 'nombre'),
  apellido: (f) => validateName(f.apellido, 'apellido'),
  tipoDocumento: (f) => validateRequired(f.tipoDocumento, 'tipo de documento'),
  numeroDocumento: (f) => validateDocumentNumber(f.numeroDocumento),
  direccion: (f) => validateAddress(f.direccion),
  telefono: (f) => validatePhone(f.telefono),
  correo: (f) => validateEmail(f.correo),
  contrasena: (f) => validatePassword(f.contrasena),
  confirmarContrasena: (f) => validateConfirmPassword(f.contrasena, f.confirmarContrasena),
}

// Iconos reutilizables de los campos
const userIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.1a7.5 7.5 0 0115 0 17.9 17.9 0 01-7.5 1.5 17.9 17.9 0 01-7.5-1.5z" />
  </svg>
)

const idCardIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
)

const homeIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const phoneIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
)

const mailIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const lockIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
)

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

const sectionHeader = (title) => (
  <div className="mb-4 flex items-center gap-3">
    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {title}
    </span>
    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
  </div>
)

const RegisterModal = ({ open, onClose }) => {
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [registered, setRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registerError, setRegisterError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Al abrir el modal, reiniciar el formulario
  useEffect(() => {
    if (open) {
      setForm(initialForm)
      setErrors({})
      setTouched({})
      setRegistered(false)
    }
  }, [open])

  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value

    // Restricción de caracteres no permitidos según el campo
    if (name === 'nombre' || name === 'apellido') {
      newValue = sanitizeLetters(value).slice(0, 50)
    } else if (name === 'numeroDocumento') {
      newValue = sanitizeDigits(value).slice(0, 12)
    } else if (name === 'telefono') {
      newValue = value.replace(/[^+0-9]/g, '').slice(0, 16)
    } else if (name === 'correo') {
      newValue = value.slice(0, 80)
    } else if (name === 'contrasena' || name === 'confirmarContrasena') {
      newValue = value.replace(/\s/g, '').slice(0, 20)
    }

    const nextForm = { ...form, [name]: newValue }
    setForm(nextForm)

    // Validación en tiempo real mientras el usuario escribe
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](nextForm) }))
      // Si cambia la contraseña, re-validar la confirmación
      if (name === 'contrasena' && touched.confirmarContrasena) {
        setErrors((prev) => ({
          ...prev,
          confirmarContrasena: validators.confirmarContrasena(nextForm),
        }))
      }
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validators[name](form) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    Object.keys(validators).forEach((field) => {
      newErrors[field] = validators[field](form)
    })
    setErrors(newErrors)
    setTouched(Object.fromEntries(Object.keys(form).map((key) => [key, true])))
    setRegisterError(null)

    const isValid = Object.values(newErrors).every((error) => error === null)
    if (!isValid) return

    setSubmitting(true)
    try {
      await register(form)
      setRegistered(true)
    } catch (err) {
      setRegisterError(err.message || 'Error al registrar usuario.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!registered) {
      setForm(initialForm)
      setErrors({})
      setTouched({})
      setRegisterError(null)
    }
    onClose()
  }

  const isValid = (field) => touched[field] && errors[field] === null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Registro de clientes"
    >
      <div
        className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con degradado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 px-6 py-6 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {registered ? 'Registro exitoso' : 'Crea tu cuenta'}
                </h2>
                <p className="text-xs text-primary-100">
                  {registered
                    ? 'Tu cuenta ha sido creada correctamente.'
                    : 'Únete a TechPC en menos de un minuto.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {registered ? (
          /* Confirmación del registro */
          <div className="px-6 py-12 text-center">
            <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              ¡Bienvenido, {form.nombre}!
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Tu cuenta fue registrada con éxito. Ya puedes iniciar sesión con tu
              correo <strong className="text-slate-700 dark:text-slate-200">{form.correo}</strong>.
            </p>
            <Button className="mt-6" onClick={handleClose}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          /* Formulario de registro */
          <form onSubmit={handleSubmit} noValidate className="px-6 py-6">
            {sectionHeader('Datos personales')}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombre}
                valid={isValid('nombre')}
                placeholder="Ej: Juan"
                hint="Solo letras, mínimo 2 caracteres."
                icon={userIcon}
              />
              <Input
                label="Apellido"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.apellido}
                valid={isValid('apellido')}
                placeholder="Ej: Pérez"
                icon={userIcon}
              />
              <Select
                label="Tipo de documento"
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.tipoDocumento}
                valid={isValid('tipoDocumento')}
                options={documentTypes}
                placeholder="Selecciona el tipo"
                icon={idCardIcon}
              />
              <Input
                label="Número de documento"
                name="numeroDocumento"
                value={form.numeroDocumento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.numeroDocumento}
                valid={isValid('numeroDocumento')}
                placeholder="Ej: 1023456789"
                hint="Solo números, entre 6 y 12 dígitos."
                icon={idCardIcon}
              />
            </div>

            {sectionHeader('Información de contacto')}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Dirección"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.direccion}
                valid={isValid('direccion')}
                placeholder="Ej: Cra 15 # 45-12"
                wrapperClassName="sm:col-span-2"
                icon={homeIcon}
              />
              <Input
                label="Teléfono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.telefono}
                valid={isValid('telefono')}
                placeholder="Ej: 3001234567"
                hint="Entre 7 y 15 dígitos."
                icon={phoneIcon}
              />
              <Input
                label="Correo electrónico"
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.correo}
                valid={isValid('correo')}
                placeholder="tucorreo@ejemplo.com"
                icon={mailIcon}
              />
            </div>

            {sectionHeader('Seguridad')}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contraseña"
                name="contrasena"
                type={showPassword ? 'text' : 'password'}
                value={form.contrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.contrasena}
                valid={isValid('contrasena')}
                placeholder="Mínimo 8 caracteres"
                icon={lockIcon}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Mostrar contraseña"
                  >
                    {showPassword ? eyeOffIcon : eyeIcon}
                  </button>
                }
              />
              <Input
                label="Confirmar contraseña"
                name="confirmarContrasena"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmarContrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmarContrasena}
                valid={isValid('confirmarContrasena')}
                placeholder="Repite tu contraseña"
                icon={lockIcon}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    tabIndex={-1}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Mostrar contraseña"
                  >
                    {showConfirm ? eyeOffIcon : eyeIcon}
                  </button>
                }
              />
            </div>

            {/* Medidor de fortaleza de contraseña */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <PasswordStrength password={form.contrasena} />
            </div>

            {registerError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {registerError}
              </div>
            )}

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registrando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                    />
                  </svg>
                  Registrarme
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default RegisterModal
