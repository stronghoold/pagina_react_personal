import { useState, useEffect } from 'react'

import API_URL from '../../utils/api'


const emptyProduct = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', imagen_url: '' }

const ProductsTab = ({ token }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/productos/categorias`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => { fetchProducts(); fetchCategories() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const body = { ...editing, precio: Number(editing.precio), stock: Number(editing.stock), categoria_id: editing.categoria_id || null }

    if (editing.id) {
      try {
        await fetch(`${API_URL}/productos/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      } catch { /* fallback local */ }
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...body } : p)))
    } else {
      try {
        const res = await fetch(`${API_URL}/productos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
        const data = await res.json()
        if (data.product) setProducts((prev) => [{ ...body, id: data.product.id }, ...prev])
      } catch {
        setProducts((prev) => [{ ...body, id: Date.now() }, ...prev])
      }
    }
    setShowModal(false)
    setEditing(null)
    setMessage({ type: 'success', text: editing.id ? 'Producto actualizado.' : 'Producto creado.' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try { await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }) } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setMessage({ type: 'success', text: 'Producto eliminado.' })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando productos...</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gestión de Productos</h2>
        <button
          onClick={() => { setEditing({ ...emptyProduct }); setShowModal(true) }}
          className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Nuevo Producto
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
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Stock</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Categoría</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
              <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.nombre}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">${Number(p.precio).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.stock}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.categoria_nombre || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                  }`}>{p.estado}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing({ ...p }); setShowModal(true) }} className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No hay productos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{editing.id ? 'Editar' : 'Nuevo'} Producto</h3>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stock *</label>
                  <input type="number" required min="0" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/30" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                <select value={editing.categoria_id || ''} onChange={(e) => setEditing({ ...editing, categoria_id: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/30">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsTab
