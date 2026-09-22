import { useState, useEffect } from 'react'

import API_URL from '../../utils/api'

const UsersTab = ({ token }) => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState(null)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, { headers })
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      // Fallback localStorage
      const stored = JSON.parse(localStorage.getItem('techpc_users') || '[]')
      setUsers(stored.map((u, i) => ({ ...u, id: u.id || i + 1, rol_nombre: u.rol || 'cliente' })))
    }
    setLoading(false)
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/roles`, { headers })
      const data = await res.json()
      setRoles(data.roles || [])
    } catch {
      setRoles([
        { id: 1, nombre: 'administrador' },
        { id: 2, nombre: 'empleado' },
        { id: 3, nombre: 'cliente' },
      ])
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleToggleStatus = async (userId) => {
    try {
      await fetch(`${API_URL}/usuarios/${userId}/estado`, { method: 'PATCH', headers })
      fetchUsers()
      setMessage({ type: 'success', text: 'Estado actualizado.' })
    } catch {
      // Fallback: toggle locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' } : u
        )
      )
      setMessage({ type: 'success', text: 'Estado actualizado (local).' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    try {
      await fetch(`${API_URL}/usuarios/${userId}`, { method: 'DELETE', headers })
      fetchUsers()
      setMessage({ type: 'success', text: 'Usuario eliminado.' })
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setMessage({ type: 'success', text: 'Usuario eliminado (local).' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleEdit = (user) => {
    setEditingUser({ ...user, rol_id: user.rol_id || 3 })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API_URL}/usuarios/${editingUser.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editingUser),
      })
      setShowModal(false)
      fetchUsers()
      setMessage({ type: 'success', text: 'Usuario actualizado.' })
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...editingUser } : u))
      )
      setShowModal(false)
      setMessage({ type: 'success', text: 'Usuario actualizado (local).' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando usuarios...</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{users.length} usuarios</span>
      </div>

      {message && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Correo</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Rol</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 text-slate-900 dark:text-white">{u.nombre} {u.apellido}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.correo}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.rol_nombre === 'administrador'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : u.rol_nombre === 'empleado'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {u.rol_nombre}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    u.estado === 'activo'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                  }`}>
                    {u.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/30"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                    >
                      {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {showModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Editar Usuario</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                <input
                  autoFocus
                  type="text"
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                <input
                  type="text"
                  value={editingUser.apellido}
                  onChange={(e) => setEditingUser({ ...editingUser, apellido: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo</label>
                <input
                  type="email"
                  value={editingUser.correo}
                  onChange={(e) => setEditingUser({ ...editingUser, correo: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
                <select
                  value={editingUser.rol_id}
                  onChange={(e) => setEditingUser({ ...editingUser, rol_id: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/30"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
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

export default UsersTab
