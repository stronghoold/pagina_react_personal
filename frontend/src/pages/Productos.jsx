import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useCartDrawer } from '../context/CartDrawerContext'
import useDarkMode from '../hooks/useDarkMode'
import { formatCurrency } from '../utils/format'

// Imágenes de respaldo según la categoría (para productos sin imagen propia).
const IMAGENES = {
  procesador: '/images/procesador.jpg',
  tarjeta: '/images/tarjeta-grafica.jpg',
  grafica: '/images/tarjeta-grafica.jpg',
  memoria: '/images/memoria-ram.jpg',
  ram: '/images/memoria-ram.jpg',
  almacenamiento: '/images/disco-ssd.jpg',
  disco: '/images/disco-ssd.jpg',
  ssd: '/images/disco-ssd.jpg',
  motherboard: '/images/placa-madre.jpg',
  placa: '/images/placa-madre.jpg',
  fuente: '/images/fuente-poder.jpg',
  gabinete: '/images/gabinete.jpg',
  case: '/images/gabinete.jpg',
  monitor: '/images/monitor.jpg',
  teclado: '/images/teclado.jpg',
  refrigeracion: '/images/refrigeracion.jpg',
}

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const imagenDe = (item) => {
  if (item.imagen_url) return item.imagen_url
  const texto = normalizar(`${item.categoria_nombre || ''} ${item.nombre || ''}`)
  const encontrada = Object.entries(IMAGENES).find(([clave]) => texto.includes(clave))
  return encontrada ? encontrada[1] : '/images/producto-tarjeta-grafica.jpg'
}

/**
 * Sección pública del catálogo: muestra TODO lo que vende la página.
 * Consume el catálogo real de la base de datos (productos y servicios)
 * a través de la API y permite filtrar, buscar y agregar al carrito.
 */
const Productos = () => {
  const { dark } = useDarkMode()
  const { addItem } = useCart()
  const { openDrawer } = useCartDrawer()

  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [tipo, setTipo] = useState('todos')
  const [orden, setOrden] = useState('relevancia')

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setCargando(true)
      setError(null)
      try {
        const [prod, serv, cats] = await Promise.all([
          apiFetch('/productos'),
          apiFetch('/servicios'),
          apiFetch('/productos/categorias'),
        ])
        if (!activo) return
        setProductos((prod.products || []).filter((p) => p.estado === 'activo'))
        setServicios((serv.services || []).filter((s) => s.estado === 'activo'))
        setCategorias(cats.categories || [])
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  // Catálogo unificado: cada ítem lleva su tipo y una clave de carrito única.
  const catalogo = useMemo(
    () => [
      ...productos.map((p) => ({
        ...p,
        tipo: 'producto',
        carritoId: `p-${p.id}`,
        nombre: p.nombre,
      })),
      ...servicios.map((s) => ({
        ...s,
        tipo: 'servicio',
        carritoId: `s-${s.id}`,
        categoria_nombre: 'Servicios',
        nombre: s.nombre,
      })),
    ],
    [productos, servicios],
  )

  const visibles = useMemo(() => {
    const termino = normalizar(busqueda.trim())
    let lista = catalogo.filter((item) => {
      if (tipo === 'productos' && item.tipo !== 'producto') return false
      if (tipo === 'servicios' && item.tipo !== 'servicio') return false
      if (
        categoria !== 'todas' &&
        item.tipo === 'producto' &&
        String(item.categoria_id) !== String(categoria)
      ) {
        return false
      }
      if (categoria !== 'todas' && item.tipo === 'servicio') return false
      if (!termino) return true
      return normalizar(
        `${item.nombre} ${item.descripcion || ''} ${item.categoria_nombre || ''}`,
      ).includes(termino)
    })

    if (orden === 'precio-asc') lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') lista = [...lista].sort((a, b) => b.precio - a.precio)
    if (orden === 'nombre')
      lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))
    return lista
  }, [catalogo, busqueda, categoria, tipo, orden])

  const agregar = (item) => {
    addItem({
      id: item.carritoId,
      name: item.nombre,
      price: Number(item.precio),
      image: imagenDe(item),
      category: item.categoria_nombre || (item.tipo === 'servicio' ? 'Servicios' : 'Productos'),
    })
    openDrawer()
  }

  const claseCampo =
    'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="text-center">
        <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan' : 'text-accent-600'}`}>
          Catálogo completo
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
          Todo lo que vendemos
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--text-secondary)' }}>
          Explora el catálogo real de la tienda: componentes, accesorios y servicios
          técnicos, con precios y disponibilidad actualizados.
        </p>
        <div className={`mx-auto mt-5 h-1 w-24 rounded-full ${dark ? 'bg-gradient-to-r from-neon-purple to-neon-cyan' : 'bg-gradient-to-r from-primary-600 to-accent-500'}`} />
      </div>

      {/* Filtros */}
      <div className="mt-10 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Buscar</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Ej: RTX, SSD, teclado…"
            className={claseCampo}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Categoría</span>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={claseCampo}>
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={claseCampo}>
            <option value="todos">Productos y servicios</option>
            <option value="productos">Solo productos</option>
            <option value="servicios">Solo servicios</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Ordenar por</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className={claseCampo}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </label>
      </div>

      {/* Estado */}
      {cargando && (
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Cargando catálogo…
        </p>
      )}

      {error && !cargando && (
        <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <p className="font-semibold">No se pudo cargar el catálogo.</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!cargando && !error && (
        <>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            {visibles.length} {visibles.length === 1 ? 'resultado' : 'resultados'}
          </p>

          {visibles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No encontramos productos con esos filtros.
              </p>
              <button
                onClick={() => {
                  setBusqueda('')
                  setCategoria('todas')
                  setTipo('todos')
                  setOrden('relevancia')
                }}
                className="mt-4 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((item) => (
                <article
                  key={item.carritoId}
                  className={`group flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 ${
                    dark
                      ? 'border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/95 hover:border-neon-purple/40'
                      : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10'
                  }`}
                >
                  <div className={`relative aspect-[16/9] overflow-hidden ${dark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                    <img
                      src={imagenDe(item)}
                      alt={item.nombre}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold text-white ${
                        item.tipo === 'servicio'
                          ? 'bg-cyan-600/90'
                          : dark
                            ? 'bg-gradient-to-r from-neon-purple to-neon-cyan'
                            : 'bg-gradient-to-r from-primary-600 to-accent-500'
                      }`}
                    >
                      {item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                    </span>
                    {item.stock !== undefined && item.stock <= 5 && (
                      <span className="absolute right-3 top-3 rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-bold text-white">
                        Últimas {item.stock}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${dark ? 'text-neon-cyan' : 'text-accent-600'}`}>
                      {item.categoria_nombre || 'Sin categoría'}
                    </p>
                    <h2 className="mt-1.5 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.nombre}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {item.descripcion || 'Sin descripción disponible.'}
                    </p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-extrabold ${dark ? 'text-neon-purple' : 'text-primary-600'}`}>
                          {formatCurrency(Number(item.precio))}
                        </span>
                        {item.tipo === 'producto' ? (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Stock: {item.stock}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {item.duracion_estimada || 'Duración a convenir'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => agregar(item)}
                        className={`mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all active:scale-[0.97] ${
                          dark
                            ? 'bg-gradient-to-r from-neon-purple to-neon-cyan shadow-lg shadow-neon-purple/25 hover:brightness-110'
                            : 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-lg shadow-primary-500/25 hover:brightness-110'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <div className="mt-14 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          ¿No encuentras lo que buscas?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
          Cuéntanos qué necesitas y te ayudamos a armarlo, o contacta a nuestro
          equipo para una cotización personalizada.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            to="/contacto"
            className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:brightness-110"
          >
            Contactar a la tienda
          </Link>
          <Link
            to="/armar-pc"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-white dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Armar mi PC
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Productos
