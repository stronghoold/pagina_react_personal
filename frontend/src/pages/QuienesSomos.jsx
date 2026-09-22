import { Link } from 'react-router-dom'
import Button from '../components/Button'

const stats = [
  { value: '+10.000', label: 'Clientes felices' },
  { value: '+500', label: 'Componentes disponibles' },
  { value: '4.9/5', label: 'Calificación promedio' },
  { value: '24/7', label: 'Soporte en línea' },
]

const values = [
  {
    title: 'Pasión por la tecnología',
    description:
      'Somos gamers, creadores y entusiastas. Entendemos lo que cada componente puede hacer por ti porque lo vivimos día a día.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Calidad garantizada',
    description:
      'Trabajamos solo con marcas reconocidas y componentes originales, con garantía oficial y soporte técnico real.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Compromiso con el cliente',
    description:
      'Te acompañamos antes, durante y después de la compra. Tu satisfacción es nuestra mejor estadística.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Precios justos',
    description:
      'Negociamos directamente con distribuidores para ofrecerte la mejor relación calidad-precio del mercado.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
]

const QuienesSomos = () => (
  <div>
    {/* Encabezado */}
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 py-20 text-center">
      <div className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-200">
          Nosotros
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-5xl">
          Quiénes Somos
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-100 sm:text-base">
          TechPC nació con una misión clara: acercar el hardware de alta gama a
          gamers, creadores y profesionales de toda Colombia, con honestidad,
          calidad y un servicio que marca la diferencia.
        </p>
      </div>
    </section>

    {/* Historia */}
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Nuestra historia
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Del ensamblaje de garaje a la tienda líder en componentes
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
            <p>
              Comenzamos en 2019 armando computadores para amigos y conocidos en
              un pequeño taller. Lo que empezó como un hobby se convirtió en una
              pasión: ayudar a cada persona a encontrar la configuración perfecta
              para sus necesidades y su presupuesto.
            </p>
            <p>
              Hoy somos un equipo de más de 15 especialistas en hardware que
              asesoran cada compra, prueban cada componente y garantizan que lo
              que recibes en tu puerta sea exactamente lo que prometimos.
            </p>
            <p>
              Nuestra misión es que cualquier persona, desde el gamer que arma su
              primera PC hasta el creador profesional, encuentre en TechPC un
              aliado de confianza.
            </p>
          </div>
        </div>

        {/* Imagen ilustrativa */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <img
              src="/images/gabinete.svg"
              alt="Componentes de PC TechPC"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  100% componentes originales
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Con garantía oficial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Estadísticas */}
    <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Valores */}
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Principios
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Lo que nos define
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <div
            key={value.title}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-700"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/25 transition-transform group-hover:scale-110">
              {value.icon}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {value.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Llamado a la acción */}
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 px-6 py-12 text-center shadow-2xl shadow-primary-500/30 sm:px-12">
        <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">
          ¿Hablamos de tu próximo proyecto?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-100 sm:text-base">
          Escríbenos y nuestro equipo te ayudará a elegir los componentes
          perfectos para tu presupuesto.
        </p>
        <Link to="/contacto" className="relative mt-6 inline-block">
          <Button size="lg" className="bg-white text-primary-700 shadow-white/40 hover:brightness-95">
            Contáctanos
          </Button>
        </Link>
      </div>
    </section>
  </div>
)

export default QuienesSomos
