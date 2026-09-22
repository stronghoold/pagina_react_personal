const REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { label: 'Un símbolo (!@#$…)', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
]

const LEVELS = [
  { label: 'Muy débil', barColor: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400', segments: 1 },
  { label: 'Débil', barColor: 'bg-orange-500', textColor: 'text-orange-600 dark:text-orange-400', segments: 2 },
  { label: 'Media', barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', segments: 3 },
  { label: 'Buena', barColor: 'bg-lime-500', textColor: 'text-lime-600 dark:text-lime-400', segments: 4 },
  { label: 'Fuerte', barColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', segments: 5 },
]

const getLevel = (password) => {
  if (!password) return { index: -1, ...LEVELS[0] }
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length
  const index = Math.min(Math.max(passed - 1, 0), LEVELS.length - 1)
  return { index, ...LEVELS[index] }
}

const PasswordStrength = ({ password }) => {
  const { index, label, barColor, textColor, segments } = getLevel(password)

  return (
    <div className="mt-2 space-y-2.5">
      {/* Barra de fortaleza */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < segments ? barColor : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        {password && (
          <span className={`text-xs font-bold ${textColor}`}>{label}</span>
        )}
      </div>

      {/* Checklist de requisitos */}
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {REQUIREMENTS.map((req) => {
          const ok = Boolean(password) && req.test(password)
          return (
            <li
              key={req.label}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                ok
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {ok ? (
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {req.label}
            </li>
          )
        })}
      </ul>
      {index === -1 && (
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Usa al menos 8 caracteres combinando mayúsculas, minúsculas, números y símbolos.
        </p>
      )}
    </div>
  )
}

export default PasswordStrength
