import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
import { formatDateTime, etiquetaEstado, colorEstado } from '../../utils/format'

/**
 * Módulo de PQR — Peticiones, Quejas y Reclamos (requerimiento 16).
 * - El cliente registra su solicitud y consulta el estado.
 * - El administrador y el empleado gestionan el estado y la respuesta.
 */
const PqrPanel = ({ token, esCliente = false, usuario }) => {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [gestionando, setGestionando] = useState(null)
  const [filtros, setFiltros] = useState({ estado: '', tipo: '' })

  // Formulario del cliente
  const [nueva, setNueva] = useState({ tipo: 'peticion', asunto: '', descripcion: '' })
  const [creando, setCreando] = useState(false)

  const notificar = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3400)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== '') params.append(clave, valor)
    })
    try {
      const data = await apiFetch(`/pqr?${params.toString()}`, { token })
      setSolicitudes(data.pqr || [])
    } catch (err) {
      notificar(err.message, 'error')
    }
    setCargando(false)
  }, [filtros, token])

  useEffect(() => {
    cargar()
  }, [cargar])

  const registrar = async (e) => {
    e.preventDefault()
    if (nueva.asunto.trim().length < 3 || nueva.descripcion.trim().length < 10) {
      notificar('El asunto debe tener mínimo 3 caracteres y la descripción mínimo 10.', 'error')
      return
    }
    setCreando(true)
    try {
      await apiFetch('/pqr', { method: 'POST', token, body: nueva })
      notificar('Solicitud registrada. Queda en estado pendiente.')
      setNueva({ tipo: 'peticion', asunto: '', descripcion: '' })
      cargar()
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setCreando(false)
    }
  }

  const guardarGestion = async (e) => {
    e.preventDefault()
    try {
      await apiFetch(`/pqr/${gestionando.id}`, {
        method: 'PATCH',
        token,
        body: { estado: gestionando.estado, respuesta: gestionando.respuesta || null },
      })
      notificar('Solicitud actualizada.')
      setGestionando(null)
      cargar()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const eliminar = async (item) => {
    if (!confirm(`¿Eliminar la solicitud #${item.id}?`)) return
    try {
      await apiFetch(`/pqr/${item.id}`, { method: 'DELETE', token })
      notificar('Solicitud eliminada.')
      cargar()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const claseInput =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white'

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {esCliente ? 'Mis PQR' : 'Gestión de PQR'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Peticiones, quejas y reclamos · {solicitudes.length} solicitud(es)
        </p>
      </div>

      {mensaje && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            mensaje.tipo === 'error'
              ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario del cliente */}
      {esCliente && (
        <form
          onSubmit={registrar}
          className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:grid-cols-4"
        >
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Tipo de solicitud
            <select
              value={nueva.tipo}
              onChange={(e) => setNueva({ ...nueva, tipo: e.target.value })}
              className={`mt-1 ${claseInput}`}
            >
              <option value="peticion">Petición</option>
              <option value="queja">Queja</option>
              <option value="reclamo">Reclamo</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-3">
            Asunto
            <input
              type="text"
              maxLength={120}
              value={nueva.asunto}
              onChange={(e) => setNueva({ ...nueva, asunto: e.target.value })}
              placeholder="Describe brevemente tu solicitud"
              className={`mt-1 ${claseInput}`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-4">
            Descripción
            <textarea
              rows={3}
              maxLength={2000}
              value={nueva.descripcion}
              onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
              placeholder="Cuéntanos con detalle lo sucedido (mínimo 10 caracteres)"
              className={`mt-1 resize-none ${claseInput}`}
            />
          </label>
          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {creando ? 'Enviando…' : 'Registrar solicitud'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Estado
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="respondida">Respondida</option>
            <option value="cerrada">Cerrada</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Tipo
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            className={`mt-1 ${claseInput}`}
          >
            <option value="">Todos</option>
            <option value="peticion">Petición</option>
            <option value="queja">Queja</option>
            <option value="reclamo">Reclamo</option>
          </select>
        </label>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Cargando solicitudes…</p>
      ) : (
        <div className="space-y-3">
          {solicitudes.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400">#{item.id}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {etiquetaEstado(item.tipo)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorEstado(item.estado)}`}
                    >
                      {etiquetaEstado(item.estado)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">{item.asunto}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.descripcion}</p>
                  {!esCliente && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.usuario_nombre} · {item.usuario_correo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-400">{formatDateTime(item.fecha_creacion)}</span>
                  {!esCliente && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setGestionando({ ...item })}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                      >
                        Gestionar
                      </button>
                      {usuario === 'administrador' && (
                        <button
                          onClick={() => eliminar(item)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {item.respuesta && (
                <div className="mt-3 rounded-xl border-l-4 border-emerald-400 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <span className="block text-xs font-bold uppercase tracking-wide">Respuesta del equipo</span>
                  {item.respuesta}
                </div>
              )}
            </div>
          ))}
          {solicitudes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
              {esCliente
                ? 'Aún no has registrado solicitudes. Usa el formulario de arriba para crear una.'
                : 'No hay solicitudes con los filtros aplicados.'}
            </p>
          )}
        </div>
      )}

      {/* Modal de gestión */}
      {gestionando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setGestionando(null)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
              Gestionar PQR #{gestionando.id}
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{gestionando.asunto}</p>

            <form onSubmit={guardarGestion} className="space-y-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Estado
                <select
                  value={gestionando.estado}
                  onChange={(e) => setGestionando({ ...gestionando, estado: e.target.value })}
                  className={`mt-1 ${claseInput}`}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="respondida">Respondida</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Respuesta al cliente
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={gestionando.respuesta || ''}
                  onChange={(e) => setGestionando({ ...gestionando, respuesta: e.target.value })}
                  placeholder="Obligatoria para marcar como respondida o cerrada"
                  className={`mt-1 resize-none ${claseInput}`}
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGestionando(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PqrPanel
