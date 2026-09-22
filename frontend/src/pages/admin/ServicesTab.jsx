import { useState, useEffect } from 'react'

import API_URL from '../../utils/api'

const SERVICES_KEY = 'techpc_services'

const getStoredServices = () => {
  try {
    return JSON.parse(localStorage.getItem(SERVICES_KEY)) || []
  } catch {
    return []
  }
}
const saveStoredServices = (services) => localStorage.setItem(SERVICES_KEY, JSON.stringify(services))

const emptyService = { nombre: '', descripcion: '', precio: '', duracion_estimada: '', imagen_url: '', estado: 'activo' }

const ServicesTab = ({ token }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/servicios`, { headers })
      const data = await res.json()
      const apiServices = data.services || []
      setServices(apiServices)
      // Guardar en localStorage como fallback
      if (apiServices.length > 0) saveStoredServices(apiServices)
    } catch {
      // Fallback: cargar desde localStorage
      setServices(getStoredServices())
    }
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const body = { ...editing, precio: Number(editing.precio) }

    if (editing.id) {
      try { await fetch(`${API_URL}/servicios/${editing.id}`, { method: 'PUT', headers, body: JSON.stringify(body) }) } catch {}
      setServices((prev) => {
        const updated = prev.map((s) => (s.id === editing.id ? { ...s, ...body } : s))
        saveStoredServices(updated)
        return updated
      })
    } else {
      const newId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const newService = { ...body, id: newId, estado: 'activo' }
      try {
        const res = await fetch(`${API_URL}/servicios`, { method: 'POST', headers, body: JSON.stringify(body) })
        const data = await res.json()
        if (data.service) newService.id = data.service.id
      } catch {}
      setServices((prev) => {
        // Evitar duplicados por nombre
        const exists = prev.some((s) => s.nombre === newService.nombre && s.precio === newService.precio)
        if (exists) return prev
        const updated = [newService, ...prev]
        saveStoredServices(updated)
        return updated
      })
    }
    setShowModal(false)
    setEditing(null)
    setSaving(false)
    setMessage({ type: 'success', text: editing.id ? 'Servicio actualizado.' : 'Servicio creado.' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return
    try { await fetch(`${API_URL}/servicios/${id}`, { method: 'DELETE', headers }) } catch {}
    setServices((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      saveStoredServices(updated)
      return updated
    })
    setMessage({ type: 'success', text: 'Servicio eliminado.' })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando servicios...</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gestión de Servicios</h2>
        <button
          onClick={() => { setEditing({ ...emptyService }); setShowModal(true) }}
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Nuevo Servicio
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Duración</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.nombre}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">${Number(s.precio).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{s.duracion_estimada || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                  }`}>{s.estado}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing({ ...s }); setShowModal(true) }} className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400">Editar</button>
                    <button onClick={() => handleDelete(s.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No hay servicios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{editing.id ? 'Editar' : 'Nuevo'} Servicio</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre *</label>
                <input autoFocus type="text" required value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                <textarea value={editing.descripcion || ''} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Precio *</label>
                  <input type="number" required min="0" value={editing.precio} onChange={(e) => setEditing({ ...editing, precio: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Duración estimada</label>
                  <input type="text" value={editing.duracion_estimada || ''} onChange={(e) => setEditing({ ...editing, duracion_estimada: e.target.value })} placeholder="Ej: 2 horas" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicesTab
