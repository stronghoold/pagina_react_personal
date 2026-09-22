import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../utils/api'
import { useAuth } from '../context/AuthContext'

/**
 * Chatbot de atención al cliente (requerimientos 17 y 18).
 *
 * Las respuestas las genera el backend FastAPI: usa el servicio de IA
 * configurado por variables de entorno y, si no hay API Key, responde con el
 * motor local de reglas. El widget nunca recibe ni muestra la clave.
 */
const Chatbot = () => {
  const { token } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [sugerencias, setSugerencias] = useState([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [conversacionId, setConversacionId] = useState(null)
  const [error, setError] = useState(null)
  const finRef = useRef(null)

  // Mensaje de bienvenida al abrir por primera vez
  useEffect(() => {
    if (!abierto || mensajes.length > 0) return
    const cargarInfo = async () => {
      try {
        const data = await apiFetch('/chat/info')
        setMensajes([{ rol: 'asistente', contenido: data.mensaje, fuente: data.ia_activa ? 'ia' : 'local' }])
        setSugerencias(data.sugerencias || [])
      } catch {
        setMensajes([
          {
            rol: 'asistente',
            contenido:
              '¡Hola! Soy TechBot 🤖. No pude conectar con el servidor, pero puedes escribirnos a contacto@techpc.com.',
            fuente: 'local',
          },
        ])
      }
    }
    cargarInfo()
  }, [abierto, mensajes.length])

  // Auto-scroll al último mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const enviar = async (mensaje) => {
    const limpio = (mensaje || '').trim()
    if (!limpio || cargando) return

    setMensajes((prev) => [...prev, { rol: 'usuario', contenido: limpio }])
    setTexto('')
    setCargando(true)
    setError(null)

    try {
      const data = await apiFetch('/chat', {
        method: 'POST',
        token,
        body: { mensaje: limpio, conversacion_id: conversacionId },
      })
      setConversacionId(data.conversacion_id)
      setMensajes((prev) => [
        ...prev,
        { rol: 'asistente', contenido: data.respuesta, fuente: data.fuente },
      ])
      if (data.sugerencias?.length) setSugerencias(data.sugerencias)
    } catch (err) {
      setError(err.message)
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'asistente',
          contenido:
            'Lo siento, no pude procesar tu mensaje en este momento. Intenta de nuevo o escríbenos a contacto@techpc.com.',
          fuente: 'local',
        },
      ])
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto((o) => !o)}
        aria-label="Abrir chat de atención"
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl shadow-lg shadow-violet-500/30 transition-all hover:scale-110"
      >
        {abierto ? (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span>🤖</span>
        )}
      </button>

      {/* Panel de conversación */}
      {abierto && (
        <div className="fixed bottom-44 right-6 z-50 flex h-[28rem] w-[min(23rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {/* Encabezado */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-700 via-violet-600 to-cyan-500 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg">🤖</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">TechBot</p>
              <p className="text-[11px] text-violet-100">Asistente virtual con IA</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white hover:bg-white/25"
              aria-label="Cerrar chat"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.rol === 'usuario'
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.contenido}
                  {m.rol === 'asistente' && m.fuente === 'ia' && (
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                      Respuesta generada con IA
                    </span>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-400 dark:bg-slate-800">
                  Escribiendo…
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-rose-500">{error}</p>}
            <div ref={finRef} />
          </div>

          {/* Sugerencias */}
          {sugerencias.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 py-2 dark:border-slate-800">
              {sugerencias.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  disabled={cargando}
                  className="rounded-full border border-violet-300 px-2.5 py-1 text-[11px] font-medium text-violet-600 transition-colors hover:bg-violet-50 disabled:opacity-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              enviar(texto)
            }}
            className="flex items-center gap-2 border-t border-slate-200 px-3 py-2.5 dark:border-slate-700"
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu pregunta…"
              maxLength={2000}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={cargando || !texto.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white transition-all hover:brightness-110 disabled:opacity-50"
              aria-label="Enviar mensaje"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default Chatbot
