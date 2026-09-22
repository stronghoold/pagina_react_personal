import { useCart } from '../context/CartContext'
import useDarkMode from '../hooks/useDarkMode'

// Características simuladas por categoría
const specsByCategory = {
  'Tarjetas gráficas': [
    { label: 'Memoria VRAM', value: '32GB GDDR7' },
    { label: 'Arquitectura', value: 'Blackwell' },
    { label: 'CUDA Cores', value: '21,760' },
    { label: 'Frecuencia boost', value: '2,620 MHz' },
    { label: 'TDP', value: '575W' },
    { label: 'Interfaz', value: 'PCIe 5.0 x16' },
    { label: 'Salidas', value: '4x DisplayPort 2.1, 1x HDMI 2.1' },
    { label: 'Refrigeración', value: 'Triple ventilador vapor chamber' },
  ],
  'Procesadores': [
    { label: 'Núcleos', value: '24 (8P + 16E)' },
    { label: 'Hilos', value: '24' },
    { label: 'Frecuencia base', value: '3.7 GHz' },
    { label: 'Frecuencia boost', value: '5.7 GHz' },
    { label: 'Caché L3', value: '36 MB' },
    { label: 'TDP', value: '125W' },
    { label: 'Socket', value: 'LGA 1851' },
    { label: 'Integrado', value: 'Intel UHD Graphics' },
  ],
  'Memorias': [
    { label: 'Capacidad', value: '32GB (2x16GB)' },
    { label: 'Tipo', value: 'DDR5' },
    { label: 'Velocidad', value: '6400 MHz' },
    { label: 'Latencia', value: 'CL32' },
    { label: 'Voltaje', value: '1.35V' },
    { label: 'Disipador', value: 'Aluminio RGB' },
    { label: 'Perfil', value: 'Low Profile' },
    { label: 'Garantía', value: 'De por vida' },
  ],
  'Almacenamiento': [
    { label: 'Capacidad', value: '2TB' },
    { label: 'Interfaz', value: 'NVMe PCIe Gen4 x4' },
    { label: 'Velocidad lectura', value: '7,000 MB/s' },
    { label: 'Velocidad escritura', value: '6,500 MB/s' },
    { label: 'TBW', value: '1,200 TB' },
    { label: 'Forma', value: 'M.2 2280' },
    { label: 'DRAM', value: 'Sí, con DRAM cache' },
    { label: 'Garantía', value: '5 años' },
  ],
  'Placas base': [
    { label: 'Socket', value: 'LGA 1851' },
    { label: 'Chipset', value: 'Intel Z890' },
    { label: 'RAM', value: '4x DDR5, hasta 8000 MHz' },
    { label: 'Almacenamiento', value: '4x M.2 NVMe' },
    { label: 'WiFi', value: 'WiFi 7 (802.11be)' },
    { label: 'Bluetooth', value: '5.4' },
    { label: 'USB', value: '2x USB4, 6x USB 3.2' },
    { label: 'Audio', value: 'Realtek ALC4082' },
  ],
  'Gabinetes': [
    { label: 'Tipo', value: 'Mid-Tower ATX' },
    { label: 'Material', value: 'Acero + Templo' },
    { label: 'Ventiladores', value: '4x ARGB preinstalados' },
    { label: 'Radiador', value: 'Hasta 360mm' },
    { label: 'GPU max', value: '380mm' },
    { label: 'CPU Cooler max', value: '175mm' },
    { label: 'PSU', value: 'Fuente incluida: No' },
    { label: 'Panel lateral', value: 'Vidrio templado' },
  ],
}

// Beneficios de la tienda
const storeBenefits = [
  { icon: '🚚', text: 'Envío gratis en compras superiores a $500.000' },
  { icon: '🛡️', text: 'Garantía oficial de fábrica incluida' },
  { icon: '💳', text: 'Paga en hasta 12 cuotas sin interés' },
  { icon: '🔄', text: 'Devolución gratuita en 30 días' },
  { icon: '💬', text: 'Soporte técnico especializado' },
  { icon: '📦', text: 'Despacho en 24-72 horas' },
]

const ProductDetail = ({ product, open, onClose }) => {
  const { addItem } = useCart()
  const { dark } = useDarkMode()

  if (!open || !product) return null

  const specs = specsByCategory[product.category] || specsByCategory['Tarjetas gráficas']

  const handleAdd = () => {
    addItem(product)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 pt-8 sm:pt-16">
        <div
          className="w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: dark ? '#0f0a1e' : '#ffffff',
            border: dark ? '1px solid rgba(30,41,59,0.8)' : '1px solid #e2e8f0',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con imagen */}
          <div className="relative">
            <div className={`relative overflow-hidden ${dark ? 'bg-slate-800/50' : 'bg-slate-100'}`} style={{ minHeight: '280px' }}>
              <img
                src={product.image}
                alt={product.name}
                className="mx-auto h-auto max-h-[400px] w-full object-contain p-4"
              />
              <div className={`absolute inset-0 pointer-events-none ${dark ? 'bg-gradient-to-t from-[#0f0a1e] via-transparent to-transparent opacity-60' : 'bg-gradient-to-t from-white via-transparent to-transparent opacity-40'}`} />

              {/* Badge */}
              {product.badge && (
                <span
                  className={`absolute left-4 top-4 z-10 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg ${
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

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur transition-colors ${dark ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-white/80 text-slate-600 hover:bg-white'}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info principal */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan' : 'text-accent-600'}`}>
                    {product.category}
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                    {product.name}
                  </h2>

                  {/* Estrellas */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < product.rating ? 'fill-current' : dark ? 'fill-slate-700' : 'fill-slate-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.286 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      ({product.rating}/5)
                    </span>
                  </div>
                </div>

                {/* Precio y acción */}
                <div className="sm:text-right">
                  <p className={`text-3xl font-extrabold ${dark ? 'text-neon-purple glow-text-purple' : 'text-primary-600'}`}>
                    {product.price}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    IVA incluido
                  </p>
                  <button
                    onClick={handleAdd}
                    className={`mt-4 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all active:scale-[0.97] sm:ml-auto ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-lg shadow-neon-purple/25 hover:shadow-neon-purple/40 hover:brightness-110' : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110'}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
                    </svg>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className={`border-t px-6 pb-6 sm:px-8 sm:pb-8 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
            {/* Descripción */}
            <div className="mt-6">
              <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Descripción
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {getdescription(product.category, product.name)}
              </p>
            </div>

            {/* Características */}
            <div className="mt-6">
              <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Especificaciones técnicas
              </h3>
              <div className={`mt-3 overflow-hidden rounded-xl border ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                {specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${
                      i % 2 === 0
                        ? dark ? 'bg-slate-800/30' : 'bg-slate-50'
                        : ''
                    }`}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{spec.label}</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficios */}
            <div className="mt-6">
              <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Beneficios de compra
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {storeBenefits.map((b) => (
                  <div
                    key={b.text}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${dark ? 'bg-slate-800/30' : 'bg-slate-50'}`}
                  >
                    <span className="text-lg">{b.icon}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Generar descripción según categoría
function getdescription(category, name) {
  const descriptions = {
    'Tarjetas gráficas': `${name} es la tarjeta gráfica más potente del mundo. Con 32GB de memoria GDDR7 y la arquitectura Blackwell, ofrece un rendimiento sin precedentes en juegos en 4K y 8K, aplicaciones de IA y renderizado. Compatible con ray tracing de cuarta generación, DLSS 4 Multi Frame Generation y neural rendering para gráficos fotorrealistas.`,
    'Procesadores': `${name} es un procesador de alto rendimiento con 24 núcleos híbridos que combina núcleos de alto rendimiento (P-cores) y de eficiencia (E-cores). Ideal para gaming, streaming y productividad multitarea. Su frecuencia boost de hasta 5.7 GHz garantiza un rendimiento excepcional en cualquier tarea.`,
    'Memorias': `${name} ofrece altas velocidades de transferencia de datos para gaming y productividad. Con perfiles XMP/EXPO integrados, es fácil de configurar y overclockear. El disipador de aluminio con RGB mantiene las temperaturas bajas mientras añade estilo a tu build.`,
    'Almacenamiento': `${name} ofrece velocidades de lectura/escritura ultrarrápidas para tiempos de carga mínimos. Ideal para juegos, edición de video y aplicaciones pesadas. Su formato M.2 compacto se instala directamente en la placa base sin cables adicionales.`,
    'Placas base': `${name} es la base perfecta para tu build de alto rendimiento. Con soporte para los últimos procesadores, WiFi 7, y múltiples ranuras M.2 NVMe, está preparada para el futuro. Su sistema de refrigeración robusto mantiene todo funcionando de manera estable.`,
    'Gabinetes': `${name} combina estilo y funcionalidad con su diseño airflow optimizado y panel de vidrio templado. Los ventiladores ARGB preinstalados ofrecen refrigeración excelente y un look espectacular. Espacio amplio para GPU y refrigeración líquida.`,
  }
  return descriptions[category] || `${name} es un componente de alta calidad diseñado para ofrecer el mejor rendimiento. Con tecnología de última generación y materiales premium, está garantizado para satisfacer las necesidades de los usuarios más exigentes. Incluye garantía oficial de fábrica.`
}

export default ProductDetail
