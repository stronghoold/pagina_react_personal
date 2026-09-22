const ProductsClientTab = ({ products }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((p) => (
      <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition-all hover:border-neon-purple/40 hover:shadow-lg hover:shadow-neon-purple/5">
        <h3 className="font-bold text-white">{p.nombre}</h3>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-neon-purple">${Number(p.precio).toLocaleString()}</span>
          <span className="text-xs text-slate-500">Stock: {p.stock}</span>
        </div>
        {p.categoria_nombre && (
          <span className="mt-2 inline-block rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
            {p.categoria_nombre}
          </span>
        )}
      </div>
    ))}
    {products.length === 0 && <p className="col-span-full text-center text-slate-500">No hay productos disponibles.</p>}
  </div>
)

export default ProductsClientTab
