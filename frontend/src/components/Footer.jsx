import { Link } from 'react-router-dom'

const Footer = ({ dark = true }) => (
  <footer
    className="border-t transition-colors duration-300"
    style={{
      background: dark ? '#020617' : '#f8fafc',
      borderColor: dark ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)',
    }}
  >
    {/* Línea decorativa neon (solo en modo oscuro) */}
    {dark && <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />}

    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-4">
        {/* Marca */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ${dark ? 'bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple/30' : 'bg-gradient-to-br from-primary-600 to-accent-500 shadow-primary-500/30'}`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="8" rx="2" />
                <rect x="3" y="14" width="10" height="6" rx="2" />
                <path d="M17 15v4M15 17h4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-lg font-extrabold" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
              Tech<span className={dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent' : 'bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent'}>PC</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
            Tu tienda especializada en componentes de computador. Tarjetas gráficas,
            procesadores, memorias y todo lo que necesitas para armar la PC de tus sueños,
            con asesoría experta y los mejores precios del mercado.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
            Navegación
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: '/', label: 'Inicio' },
              { to: '/quienes-somos', label: 'Quiénes Somos' },
              { to: '/contacto', label: 'Contacto' },
              { to: '/login', label: 'Iniciar sesión' },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`transition-colors ${dark ? 'text-slate-400 hover:text-neon-cyan' : 'text-slate-500 hover:text-primary-600'}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>
            Contacto
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
            <li className="flex items-center gap-2">
              <svg className={`h-4 w-4 ${dark ? 'text-neon-purple' : 'text-primary-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +57 304 4761403
            </li>
            <li className="flex items-center gap-2">
              <svg className={`h-4 w-4 ${dark ? 'text-neon-purple' : 'text-primary-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              ventas@techpc.com
            </li>
            <li className="flex items-start gap-2">
              <svg className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-neon-purple' : 'text-primary-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Cra 15 # 45-12, Bogotá
            </li>
          </ul>
        </div>
      </div>

      <div
        className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm sm:flex-row"
        style={{
          borderColor: dark ? '#1e293b' : '#e2e8f0',
          color: dark ? '#64748b' : '#94a3b8',
        }}
      >
        <p>© {new Date().getFullYear()} TechPC. Todos los derechos reservados.</p>
        <p style={{ color: dark ? '#475569' : '#cbd5e1' }}>Hecho con React + Vite + Tailwind CSS</p>
      </div>
    </div>
  </footer>
)

export default Footer
