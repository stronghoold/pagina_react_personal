import { useState } from 'react'
import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import Button from '../components/Button'
import productsData from '../data/productsData'
import { useCart } from '../context/CartContext'
import useDarkMode from '../hooks/useDarkMode'
import ProductDetail from '../components/ProductDetail'

const features = [
  {
    title: 'Envío nacional',
    description: 'Llevamos tu pedido a cualquier ciudad de Colombia en 24-72 horas.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    title: 'Garantía extendida',
    description: 'Todos nuestros componentes cuentan con garantía oficial de fábrica.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Asesoría experta',
    description: 'Te ayudamos a elegir los componentes ideales para tu presupuesto.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Pago seguro',
    description: 'Paga con tarjeta, PSE, Nequi o contra entrega con total seguridad.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
]

const Particles = () => (
  <div className="particles">
    {Array.from({ length: 8 }).map((_, i) => (
      <span key={i} className="particle" />
    ))}
  </div>
)

const Index = () => {
  const { addItem } = useCart()
  const { dark } = useDarkMode()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section
        className={`relative overflow-hidden ${dark ? 'bg-animated-gradient scanlines' : 'bg-gradient-to-br from-primary-50 via-white to-accent-50'}`}
      >
        {dark && <Particles />}

        {/* Brillos decorativos */}
        <div className={`pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full blur-[120px] ${dark ? 'bg-neon-purple/20 orb-float' : 'bg-primary-200/40'}`} />
        <div className={`pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full blur-[120px] ${dark ? 'bg-neon-cyan/15 orb-float-slow' : 'bg-accent-200/30'}`} />
        {dark && <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-pink/10 blur-[100px] orb-float" />}

        {/* Grid decorativo (solo oscuro) */}
        {dark && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.6) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${dark ? 'border border-neon-purple/40 bg-neon-purple/10 text-neon-purple' : 'border border-primary-200 bg-primary-50 text-primary-700'}`}>
            <span className={`h-2 w-2 animate-pulse rounded-full ${dark ? 'bg-neon-cyan shadow-lg shadow-neon-cyan/50' : 'bg-primary-500'}`} />
            Nuevos lanzamientos 2026
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
            Arma la PC de tus{' '}
            <span className="relative inline-block">
              <span className={dark ? 'bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink bg-clip-text text-transparent glow-text-purple' : 'bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent'}>
                sueños
              </span>
              {dark && <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink opacity-60" />}
            </span>
            {' '}con los mejores{' '}
            <span className={dark ? 'bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan bg-clip-text text-transparent glow-text-cyan' : 'bg-gradient-to-r from-accent-600 via-primary-600 to-accent-600 bg-clip-text text-transparent'}>
              componentes
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Tarjetas gráficas, procesadores, memorias, almacenamiento y más. Encuentra
            todo lo que necesitas para gaming, diseño y productividad, con precios
            competitivos y asesoría especializada.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/contacto">
              <Button size="lg" className={`${dark ? 'glow-pulse' : ''} px-8 py-4 text-base`}>
                Cotiza tu PC ideal
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </Link>
            <Link to="/quienes-somos">
              <Button variant="outline" size="lg" className={`px-8 py-4 text-base ${dark ? 'border-slate-600/50 text-slate-200 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:text-neon-cyan' : 'border-slate-300 text-slate-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700'}`}>
                Conócenos
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-6">
            {[
              { value: '500+', label: 'Productos' },
              { value: '24h', label: 'Envío rápido' },
              { value: '4.9★', label: 'Satisfacción' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-2xl font-extrabold sm:text-3xl ${dark ? 'text-white glow-text-purple' : 'text-primary-700'}`}>{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {dark && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />}
      </section>

      {/* ═══════════════════════════════════════════
          CARRUSEL
          ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan glow-text-cyan' : 'text-accent-600'}`}>
              Lo más destacado
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Nuestros componentes estrella
            </h2>
          </div>
          <p className="hidden text-sm sm:block" style={{ color: 'var(--text-muted)' }}>
            Desliza para ver más →
          </p>
        </div>
        <Carousel />
      </section>

      {/* Línea divisora */}
      {dark && <div className="neon-divider mx-auto max-w-7xl" />}

      {/* ═══════════════════════════════════════════
          BENEFICIOS
          ═══════════════════════════════════════════ */}
      <section className={`border-y transition-colors ${dark ? 'border-slate-800/50 bg-slate-950/90' : 'border-slate-200 bg-slate-50'}`}>
        {dark && (
          <>
            <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-neon-purple/10 blur-[80px]" />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-neon-cyan/10 blur-[80px]" />
          </>
        )}

        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`card-tilt group rounded-2xl border p-6 transition-all ${dark ? 'border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950/80 hover:border-neon-purple/40 hover:shadow-xl hover:shadow-neon-purple/10' : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10'}`}
            >
              <span className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110 ${dark ? 'bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon-purple/30 group-hover:shadow-neon-purple/50 group-hover:rotate-3' : 'bg-gradient-to-br from-primary-600 to-accent-500 shadow-primary-500/25 group-hover:shadow-primary-500/40'}`}>
                {feature.icon}
              </span>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUCTOS DESTACADOS
          ═══════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan glow-text-cyan' : 'text-accent-600'}`}>
            Catálogo
          </p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Productos destacados
          </h2>
          <div className={`mx-auto mt-4 h-1 w-24 rounded-full ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`} />
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {productsData.map((product) => (
            <article
              key={product.id}
              onClick={() => { setSelectedProduct(product); setDetailOpen(true) }}
              className={`border-glow-card card-tilt group relative cursor-pointer overflow-hidden rounded-2xl transition-all ${dark ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/95' : 'bg-white'}`}
              style={{ boxShadow: dark ? undefined : 'var(--shadow-card)' }}
            >
              {/* Badge */}
              {product.badge && (
                <span
                  className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${
                    product.badge === 'Oferta'
                      ? 'bg-rose-500 shadow-rose-500/40'
                      : product.badge === 'Nuevo'
                        ? 'bg-emerald-500 shadow-emerald-500/40'
                        : dark
                          ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-neon-purple/40'
                          : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-primary-500/40'
                  }`}
                >
                  {product.badge}
                </span>
              )}

              {/* Imagen */}
              <div className={`relative aspect-[16/9] overflow-hidden ${dark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className={`pointer-events-none absolute inset-0 ${dark ? 'bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent' : 'bg-gradient-to-t from-white/60 via-transparent to-transparent'}`} />
              </div>

              <div className="relative p-5">
                <p className={`text-[11px] font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan' : 'text-accent-600'}`}>
                  {product.category}
                </p>
                <h3 className="mt-1.5 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xl font-extrabold ${dark ? 'text-neon-purple glow-text-purple' : 'text-primary-600'}`}>
                    {product.price}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${product.rating} de 5 estrellas`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < product.rating ? `fill-current ${dark ? 'drop-shadow-[0_0_3px_rgb(251,191,36,0.5)]' : ''}` : dark ? 'fill-slate-700' : 'fill-slate-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.286 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                    ))}
                  </div>
                </div>              <button
                  onClick={(e) => { e.stopPropagation(); addItem(product) }}
                  className={`mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-300 active:scale-[0.97] ${dark ? 'bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple bg-[length:200%_100%] shadow-lg shadow-neon-purple/25 hover:shadow-neon-purple/50 hover:brightness-110 hover:bg-[length:100%_100%]' : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110'}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Agregar al carrito
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/productos">
            <Button variant="outline" size="lg" className="px-8 py-3.5">
              Ver catálogo completo
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16 ${dark ? 'border border-neon-purple/20 bg-gradient-to-br from-slate-900 via-primary-950/80 to-slate-900 shadow-2xl shadow-neon-purple/15' : 'border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-xl shadow-primary-500/10'}`}>
          {dark && (
            <>
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-neon-purple/15 blur-[80px] orb-float" />
              <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-neon-cyan/10 blur-[80px] orb-float-slow" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
            </>
          )}

          <h2 className="relative text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            ¿Listo para{' '}
            <span className={dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent glow-text-purple' : 'bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent'}>
              armar
            </span>
            {' '}tu PC?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Selecciona cada componente, personaliza tu setup y mira el precio
            actualizarse en tiempo real.
          </p>
          <Link to="/armar-pc" className="relative mt-8 inline-block">
            <Button size="lg" className={`${dark ? 'glow-pulse' : ''} px-10 py-4 text-base`}>
              🔧 Crear mi PC
            </Button>
          </Link>
        </div>
      </section>
      {/* Modal detalle de producto */}
      <ProductDetail
        product={selectedProduct}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedProduct(null) }}
      />
    </div>
  )
}

export default Index
