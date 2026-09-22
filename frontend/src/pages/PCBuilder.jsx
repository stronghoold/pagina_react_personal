import { useState } from 'react'
import { Link } from 'react-router-dom'
import useDarkMode from '../hooks/useDarkMode'
import { useCart } from '../context/CartContext'

const componentCategories = [
  {
    id: 'procesador',
    label: 'Procesador',
    icon: '🧠',
    description: 'El cerebro de tu PC',
    options: [
      { id: 'cpu-1', name: 'Intel Core i9-14900K', price: 2100000, specs: '24 núcleos / 5.8 GHz / LGA 1700' },
      { id: 'cpu-2', name: 'Intel Core i7-14700K', price: 1500000, specs: '20 núcleos / 5.6 GHz / LGA 1700' },
      { id: 'cpu-3', name: 'AMD Ryzen 9 7950X', price: 2300000, specs: '16 núcleos / 5.7 GHz / AM5' },
      { id: 'cpu-4', name: 'AMD Ryzen 7 7800X3D', price: 1600000, specs: '8 núcleos / 5.0 GHz / AM5 / 3D V-Cache' },
      { id: 'cpu-5', name: 'Intel Core i5-14600K', price: 950000, specs: '14 núcleos / 5.3 GHz / LGA 1700' },
    ],
  },
  {
    id: 'gpu',
    label: 'Tarjeta Gráfica',
    icon: '🎮',
    description: 'Potencia visual para gaming',
    options: [
      { id: 'gpu-1', name: 'NVIDIA RTX 5090 32GB', price: 12000000, specs: '21760 CUDA / 2.62 GHz / Blackwell / GDDR7' },
      { id: 'gpu-2', name: 'NVIDIA RTX 5080 16GB', price: 5800000, specs: '10752 CUDA / 2.65 GHz / Blackwell / GDDR7' },
      { id: 'gpu-3', name: 'NVIDIA RTX 4090 24GB', price: 7500000, specs: '16384 CUDA / 2.52 GHz / Ada Lovelace' },
      { id: 'gpu-4', name: 'NVIDIA RTX 4070 Ti SUPER 16GB', price: 3200000, specs: '8448 CUDA / 2.61 GHz / Ada Lovelace' },
      { id: 'gpu-5', name: 'AMD RX 7900 XTX 24GB', price: 3500000, specs: '6144 SP / 2.5 GHz / RDNA 3' },
    ],
  },
  {
    id: 'ram',
    label: 'Memoria RAM',
    icon: '💾',
    description: 'Memoria de alto rendimiento',
    options: [
      { id: 'ram-1', name: 'Corsair Dominator 64GB DDR5', price: 980000, specs: '6400 MHz / CL32 / 2x32GB / RGB' },
      { id: 'ram-2', name: 'G.Skill Trident Z5 32GB DDR5', price: 520000, specs: '6000 MHz / CL30 / 2x16GB / RGB' },
      { id: 'ram-3', name: 'Kingston Fury Beast 32GB DDR5', price: 380000, specs: '5600 MHz / CL36 / 2x16GB' },
      { id: 'ram-4', name: 'Corsair Vengeance 16GB DDR5', price: 220000, specs: '5200 MHz / CL40 / 2x8GB' },
    ],
  },
  {
    id: 'motherboard',
    label: 'Placa Madre',
    icon: '🔧',
    description: 'La base de tu sistema',
    options: [
      { id: 'mb-1', name: 'ASUS ROG Maximus Z790 Hero', price: 1800000, specs: 'LGA 1700 / DDR5 / WiFi 6E / PCIe 5.0' },
      { id: 'mb-2', name: 'MSI MAG Z790 Tomahawk WiFi', price: 1100000, specs: 'LGA 1700 / DDR5 / WiFi 6E / 16+1 phases' },
      { id: 'mb-3', name: 'ASUS TUF Gaming B650-Plus WiFi', price: 750000, specs: 'AM5 / DDR5 / WiFi 6 / PCIe 4.0' },
      { id: 'mb-4', name: 'Gigabyte B760 Aorus Elite AX', price: 680000, specs: 'LGA 1700 / DDR5 / WiFi 6E' },
    ],
  },
  {
    id: 'storage',
    label: 'Almacenamiento',
    icon: '💿',
    description: 'Almacenamiento ultrarrápido',
    options: [
      { id: 'st-1', name: 'Samsung 990 Pro 2TB NVMe', price: 850000, specs: '7450 MB/s lectura / PCIe 4.0 / DRAM' },
      { id: 'st-2', name: 'WD Black SN850X 1TB NVMe', price: 520000, specs: '7300 MB/s lectura / PCIe 4.0 / DRAM' },
      { id: 'st-3', name: 'Kingston KC3000 1TB NVMe', price: 420000, specs: '7000 MB/s lectura / PCIe 4.0' },
      { id: 'st-4', name: 'Crucial P3 Plus 500GB NVMe', price: 220000, specs: '5000 MB/s lectura / PCIe 4.0' },
    ],
  },
  {
    id: 'psu',
    label: 'Fuente de Poder',
    icon: '⚡',
    description: 'Potencia estable y eficiente',
    options: [
      { id: 'psu-1', name: 'Corsair RM1000x 1000W 80+ Gold', price: 650000, specs: '1000W / 80+ Gold / Modular / ATX 3.0' },
      { id: 'psu-2', name: 'EVGA SuperNOVA 850 G7 850W', price: 520000, specs: '850W / 80+ Gold / Modular / ATX' },
      { id: 'psu-3', name: 'Corsair RM750e 750W 80+ Gold', price: 420000, specs: '750W / 80+ Gold / Semi-modular' },
    ],
  },
  {
    id: 'case',
    label: 'Gabinete',
    icon: '🖥️',
    description: 'Estilo y refrigeración',
    options: [
      { id: 'case-1', name: 'Lian Li O11 Dynamic EVO', price: 680000, specs: 'Mid-Tower / Vidrio templado / Airflow' },
      { id: 'case-2', name: 'NZXT H7 Flow RGB', price: 520000, specs: 'Mid-Tower / 3x RGB / Airflow optimizado' },
      { id: 'case-3', name: 'Corsair 4000D Airflow', price: 380000, specs: 'Mid-Tower / 2x ventiladores / Cable mgmt' },
    ],
  },
  {
    id: 'cooler',
    label: 'Refrigeración CPU',
    icon: '❄️',
    description: 'Mantén las temperaturas bajas',
    options: [
      { id: 'cool-1', name: 'NZXT Kraken Z73 360mm AIO', price: 980000, specs: '360mm / LCD / RGB / Intel + AMD' },
      { id: 'cool-2', name: 'Corsair iCUE H150i Elite 360mm', price: 750000, specs: '360mm / RGB / Intel + AMD' },
      { id: 'cool-3', name: 'Noctua NH-D15 chromax.black', price: 420000, specs: 'Torre dual / 150mm / Sin RGB / Silencioso' },
      { id: 'cool-4', name: 'DeepCool AK400', price: 150000, specs: 'Torre simple / 120mm / Intel + AMD' },
    ],
  },
]

const formatPrice = (num) => '$' + num.toLocaleString('es-CO')

const PCBuilder = () => {
  const { dark } = useDarkMode()
  const { addItem } = useCart()
  const [selected, setSelected] = useState({})
  const [expandedCategory, setExpandedCategory] = useState('procesador')

  const totalPrice = Object.values(selected).reduce((sum, item) => sum + (item?.price || 0), 0)
  const selectedCount = Object.keys(selected).length

  const handleSelect = (categoryId, option) => {
    setSelected((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId]?.id === option.id ? null : option,
    }))
  }

  const handleAddAllToCart = () => {
    Object.values(selected).forEach((item) => {
      if (item) {
        addItem({
          id: item.id,
          name: item.name,
          price: '$' + item.price.toLocaleString('es-CO'),
          category: 'PC Personalizada',
          image: '/images/producto-tarjeta-grafica.jpg',
          rating: 5,
          badge: null,
        })
      }
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className={`relative overflow-hidden ${dark ? 'bg-animated-gradient scanlines' : 'bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500'}`}>
        {dark && (
          <>
            <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-neon-purple/20 blur-[100px] orb-float" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-neon-cyan/15 blur-[100px] orb-float-slow" />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-sm ${dark ? 'border border-neon-purple/40 bg-neon-purple/10 text-neon-purple' : 'border border-white/20 bg-white/10 text-white'}`}>
            🔧 Configurador
          </span>
          <h1 className="mt-6 text-4xl font-extrabold text-white sm:text-5xl">
            Arma tu PC ideal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            Selecciona cada componente y mira el precio actualizarse en tiempo real.
          </p>
        </div>
        {dark && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent" />}
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Lista de categorías */}
          <div className="flex-1">
            <div className="space-y-3">
              {componentCategories.map((cat) => {
                const isSelected = selected[cat.id]
                const isExpanded = expandedCategory === cat.id

                return (
                  <div key={cat.id} className={`overflow-hidden rounded-2xl border transition-all ${dark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
                    {/* Header de categoría */}
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className={`flex w-full items-center justify-between p-4 text-left transition-colors ${dark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{cat.label}</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <span className={`text-sm font-bold ${dark ? 'text-neon-purple' : 'text-primary-600'}`}>
                            {formatPrice(isSelected.price)}
                          </span>
                        )}
                        <svg
                          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          style={{ color: 'var(--text-muted)' }}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </button>

                    {/* Opciones */}
                    {isExpanded && (
                      <div className={`border-t px-4 pb-4 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="mt-3 space-y-2">
                          {cat.options.map((option) => {
                            const isActive = selected[cat.id]?.id === option.id
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleSelect(cat.id, option)}
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                  isActive
                                    ? dark
                                      ? 'border-neon-purple/50 bg-neon-purple/10 shadow-lg shadow-neon-purple/10'
                                      : 'border-primary-400 bg-primary-50 shadow-lg shadow-primary-500/10'
                                    : dark
                                      ? 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/50'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="font-bold" style={{ color: isActive ? (dark ? '#a855f7' : '#7c3aed') : 'var(--text-primary)' }}>
                                      {option.name}
                                    </p>
                                    <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                      {option.specs}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-extrabold ${isActive ? (dark ? 'text-neon-purple' : 'text-primary-600') : ''}`} style={isActive ? {} : { color: 'var(--text-primary)' }}>
                                      {formatPrice(option.price)}
                                    </p>
                                    <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${isActive ? (dark ? 'border-neon-purple bg-neon-purple' : 'border-primary-600 bg-primary-600') : dark ? 'border-slate-600' : 'border-slate-300'}`}>
                                      {isActive && (
                                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Panel de resumen - Sticky */}
          <div className="lg:w-80">
            <div className={`sticky top-24 overflow-hidden rounded-2xl border ${dark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
              <div className={`p-6 ${dark ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50' : 'bg-gradient-to-br from-slate-50 to-white'}`}>
                <h3 className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Resumen de tu PC
                </h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedCount} de {componentCategories.length} componentes
                </p>

                {/* Barra de progreso */}
                <div className={`mt-3 h-2 overflow-hidden rounded-full ${dark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`}
                    style={{ width: `${(selectedCount / componentCategories.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Lista de seleccionados */}
              <div className="max-h-64 overflow-y-auto px-6 py-4">
                {selectedCount === 0 ? (
                  <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Empieza seleccionando un componente
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {componentCategories.map((cat) => {
                      const item = selected[cat.id]
                      if (!item) return null
                      return (
                        <li key={cat.id} className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                              {cat.icon} {cat.label}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {item.name}
                            </p>
                          </div>
                          <p className={`shrink-0 text-sm font-bold ${dark ? 'text-neon-purple' : 'text-primary-600'}`}>
                            {formatPrice(item.price)}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Total */}
              <div className={`border-t px-6 py-4 ${dark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total</span>
                  <span className={`text-2xl font-extrabold ${dark ? 'text-neon-purple glow-text-purple' : 'text-primary-600'}`}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Precio approximate con IVA
                </p>
              </div>

              {/* Botones */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleAddAllToCart}
                  disabled={selectedCount === 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-lg shadow-neon-purple/25 hover:shadow-neon-purple/40 hover:brightness-110' : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:brightness-110'}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
                  </svg>
                  Agregar todo al carrito
                </button>
                <Link
                  to="/"
                  className={`mt-2 flex w-full items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  ← Volver al catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PCBuilder
