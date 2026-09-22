import { useCallback, useEffect, useRef, useState } from 'react'
import carouselData from '../data/carouselData'

const AUTOPLAY_INTERVAL = 5000

const Carousel = () => {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  const total = carouselData.length

  const goTo = useCallback(
    (index) => setCurrent(((index % total) + total) % total),
    [total]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // Autoplay con useEffect (requerimiento de hooks)
  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [next, paused])

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl shadow-primary-500/10 ring-1 ring-slate-200 dark:ring-slate-700"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Pista de slides */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {carouselData.map((slide) => (
          <div key={slide.id} className="relative w-full shrink-0">
            {/* Carrusel grande con imagen completa y margen */}
            <div className="relative flex h-96 w-full items-center justify-center overflow-hidden bg-slate-950 p-2 sm:h-[30rem] sm:p-4 lg:h-[560px] lg:p-5">
              <img
                src={slide.image}
                alt={slide.title}
                loading="lazy"
                draggable={false}
                className="max-h-full max-w-full object-contain"
              />
              {/* Degradado inferior sutil para integrar el panel de texto */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />
            </div>
            {/* Texto del slide */}
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
              <div className="inline-block rounded-xl bg-slate-950/60 px-3 py-2 backdrop-blur-md sm:px-3.5 sm:py-2.5">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                  Componente · {String(slide.id).padStart(2, '0')}
                </p>
                <h3 className="text-base font-extrabold text-white drop-shadow sm:text-lg">
                  {slide.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 max-w-md text-[11px] leading-snug text-slate-300 sm:text-xs">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flecha anterior */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-md transition-all hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-5"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Flecha siguiente */}
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur-md transition-all hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-5"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Contador */}
      <div className="absolute right-4 top-4 rounded-full bg-slate-950/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {current + 1} / {total}
      </div>

      {/* Puntos indicadores */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
        {carouselData.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goTo(index)}
            aria-label={`Ir a la diapositiva ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-8 bg-cyan-400'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel
