import { getInitials, getRolColor, getRolBadge } from '../../utils/format'

const ProfileTab = ({ user }) => (
  <div className="mx-auto max-w-md space-y-6">
    <div className="flex items-center gap-4">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${getRolColor(user.rol)} text-xl font-bold text-white shadow-lg`}>
        {getInitials(user)}
      </span>
      <div>
        <h3 className="text-xl font-bold text-white">{user.nombre} {user.apellido}</h3>
        <p className="text-sm text-slate-400">{user.correo}</p>
      </div>
    </div>
    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
      <div className="grid gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Rol:</span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRolBadge(user.rol)}`}>
            {user.rol}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Estado:</span>
          <span className="font-medium text-emerald-400">Activo</span>
        </div>
      </div>
    </div>
  </div>
)

export default ProfileTab
