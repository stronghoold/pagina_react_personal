import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import Input from './Input'
import { validateEmail } from '../utils/validations'

// Componente reutilizable e independiente para recuperar la contraseña.
const RecoverPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    const value = e.target.value
    setEmail(value)
    // Validación en tiempo real cuando el usuario ya tocó el campo
    if (touched) setError(validateEmail(value))
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validateEmail(email))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    setError(validationError)
    setTouched(true)
    if (!validationError) setSent(true)
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Encabezado */}
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/30">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 15.75a2.25 2.25 0 01-2.25 2.25H7.5v1.5a2.25 2.25 0 01-2.25 2.25H4.5v-2.25l5.997-5.997c.405-.404.527-1 .43-1.563A6 6 0 1118.75 8.25z"
            />
          </svg>
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para
          restablecer tu contraseña.
        </p>
      </div>

      {sent ? (
        /* Confirmación de envío */
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            Correo enviado
          </h2>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un
            correo con el enlace para restablecer tu contraseña.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setEmail('') }}>
            Enviar otro correo
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={error}
            placeholder="tucorreo@ejemplo.com"
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            }
          />

          <Button type="submit" size="lg" className="w-full">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Recuperar contraseña
          </Button>
        </form>
      )}

      {/* Regresar al inicio de sesión */}
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        ¿Recordaste tu contraseña?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}

export default RecoverPassword
