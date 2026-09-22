const ServicesClientTab = ({ services }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {services.map((s) => (
      <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition-all hover:border-neon-purple/40 hover:shadow-lg hover:shadow-neon-purple/5">
        <h3 className="font-bold text-white">{s.nombre}</h3>
        <p className="mt-1 text-sm text-slate-400 line-clamp-2">{s.descripcion || 'Sin descripción'}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-neon-purple">${Number(s.precio).toLocaleString()}</span>
          {s.duracion_estimada && <span className="text-xs text-slate-500">⏱ {s.duracion_estimada}</span>}
        </div>
      </div>
    ))}
    {services.length === 0 && <p className="col-span-full text-center text-slate-500">No hay servicios disponibles.</p>}
  </div>
)

export default ServicesClientTab
