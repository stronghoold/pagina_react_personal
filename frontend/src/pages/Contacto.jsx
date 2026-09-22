import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { validateEmail, validateName, validatePhone, validateRequired } from '../utils/validations'
import useDarkMode from '../hooks/useDarkMode'

const subjects = [
  { value: 'cotizacion', label: 'Cotización de una PC' },
  { value: 'asesoria', label: 'Asesoría técnica' },
  { value: 'pedido', label: 'Estado de mi pedido' },
  { value: 'garantia', label: 'Garantía o devolución' },
  { value: 'otro', label: 'Otro tema' },
]

const initialForm = { nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' }

const Particles = () => (
  <div className="particles">
    {Array.from({ length: 8 }).map((_, i) => (
      <span key={i} className="particle" />
    ))}
  </div>
)

const Contacto = () => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const { dark } = useDarkMode()

  const validateField = (name, value) => {
    switch (name) {
      case 'nombre':
        return validateName(value, 'nombre')
      case 'correo':
        return validateEmail(value)
      case 'telefono':
        return validatePhone(value)
      case 'asunto':
        return validateRequired(value, 'asunto')
      case 'mensaje':
        if (!value || !value.trim()) return 'El mensaje es obligatorio.'
        if (value.trim().length < 10)
          return 'El mensaje debe tener mínimo 10 caracteres.'
        if (value.trim().length > 500)
          return 'El mensaje no puede superar los 500 caracteres.'
        return null
      default:
        return null
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value
    if (name === 'nombre') newValue = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').slice(0, 50)
    if (name === 'telefono') newValue = value.replace(/[^+0-9]/g, '').slice(0, 16)
    if (name === 'correo') newValue = value.slice(0, 80)
    if (name === 'mensaje') newValue = value.slice(0, 500)

    const nextForm = { ...form, [name]: newValue }
    setForm(nextForm)
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, form[field])
    })
    setErrors(newErrors)
    setTouched(Object.fromEntries(Object.keys(form).map((key) => [key, true])))

    const isValid = Object.values(newErrors).every((error) => error === null)
    if (isValid) setSent(true)
  }

  const infoCards = [
    {
      title: 'Visítanos',
      lines: ['Cra 15 # 45-12, Bogotá', 'Lun - Vie: 9am a 7pm', 'Sáb: 9am a 5pm'],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      title: 'Escríbenos',
      lines: ['ventas@techpc.com', 'soporte@techpc.com', 'Respuesta en menos de 24h'],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      title: 'Llámanos',
      lines: ['+57 300 123 4567', '+57 (601) 555 8899', 'Atención personalizada'],
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      {/* HERO */}
      <section className={`relative overflow-hidden ${dark ? 'bg-animated-gradient scanlines' : 'bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500'}`}>
        {dark && <Particles />}
        <div className={`pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full blur-[100px] ${dark ? 'bg-neon-purple/20 orb-float' : 'bg-white/10'}`} />
        <div className={`pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full blur-[100px] ${dark ? 'bg-neon-cyan/15 orb-float-slow' : 'bg-white/10'}`} />

        {dark && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        )}

        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${dark ? 'badge-pulse border border-neon-purple/40 bg-neon-purple/10 text-neon-purple' : 'border border-white/20 bg-white/10 text-white'}`}>
            <span className={`h-2 w-2 animate-pulse rounded-full ${dark ? 'bg-neon-cyan shadow-lg shadow-neon-cyan/50' : 'bg-white'}`} />
            Estamos para ayudarte
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Contacto
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base text-white/80">
            ¿Tienes dudas sobre un componente, quieres una cotización o necesitas
            soporte? Escríbenos y te responderemos lo antes posible.
          </p>
        </div>
        {dark && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />}
      </section>

      {/* TARJETAS DE INFORMACIÓN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className={`card-tilt group rounded-2xl border p-6 transition-all ${dark ? 'border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950/80 hover:border-neon-purple/40 hover:shadow-xl hover:shadow-neon-purple/10' : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10'}`}
            >
              <span className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform group-hover:scale-110 ${dark ? 'bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple/30' : 'bg-gradient-to-br from-primary-600 to-accent-500 shadow-primary-500/25'}`}>
                {card.icon}
              </span>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {card.lines.map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <span className={`h-1 w-1 rounded-full ${dark ? 'bg-neon-cyan/60' : 'bg-primary-400'}`} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan glow-text-cyan' : 'text-accent-600'}`}>
              Escríbenos
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Envíanos un mensaje
            </h2>
            <div className={`mx-auto mt-4 h-1 w-24 rounded-full ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`} />
          </div>

          {sent ? (
            <div className={`rounded-3xl p-10 text-center shadow-2xl ${dark ? 'border border-emerald-500/30 bg-gradient-to-b from-emerald-950/50 to-slate-950/80 shadow-emerald-500/10' : 'border border-emerald-200 bg-emerald-50 shadow-emerald-500/10'}`}>
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                ¡Mensaje enviado!
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Gracias por escribirnos, <strong style={{ color: 'var(--text-accent)' }}>{form.nombre}</strong>. Nuestro
                equipo te responderá a <strong style={{ color: 'var(--text-accent)' }}>{form.correo}</strong> en menos de
                24 horas.
              </p>
              <Button
                variant="outline"
                className={`mt-8 ${dark ? 'border-slate-600 text-slate-200 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:text-neon-cyan' : 'border-slate-300 text-slate-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700'}`}
                onClick={() => {
                  setForm(initialForm)
                  setErrors({})
                  setTouched({})
                  setSent(false)
                }}
              >
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombre}
                  placeholder="Tu nombre completo"
                />
                <Input
                  label="Correo electrónico"
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.correo}
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Teléfono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                  placeholder="Ej: 3001234567"
                />
                <Select
                  label="Asunto"
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.asunto}
                  options={subjects}
                  placeholder="Selecciona el asunto"
                />
              </div>
              <div>
                <label
                  htmlFor="mensaje"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={5}
                  maxLength={500}
                  placeholder="Cuéntanos qué necesitas..."
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
                    dark ? 'bg-slate-800/80 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400'
                  } ${
                    errors.mensaje
                      ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-300'
                      : dark
                        ? 'border-slate-700 focus:border-neon-purple/50 focus:ring-neon-purple/30 hover:border-slate-600'
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-300 hover:border-slate-400'
                  }`}
                />
                <div className="mt-2 flex items-center justify-between">
                  {errors.mensaje ? (
                    <p className="flex items-start gap-1.5 text-xs font-medium text-rose-500">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.mensaje}
                    </p>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Mínimo 10 caracteres
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {form.mensaje.length}/500
                  </span>
                </div>
              </div>
              <Button type="submit" size="lg" className={`${dark ? 'glow-pulse' : ''} w-full sm:w-auto`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Contacto
