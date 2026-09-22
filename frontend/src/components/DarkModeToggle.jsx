const DarkModeToggle = ({ dark, onToggle }) => (
  <button
    onClick={onToggle}
    aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    title={dark ? 'Modo claro' : 'Modo oscuro'}
    className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-primary-400 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
  >
    {dark ? (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2a5.5 5.5 0 104.9 8.001A6.5 6.5 0 0112 2zm.5 1.5a1 1 0 00-.14 1.99 5.5 5.5 0 016.15 6.15 1 1 0 001.99-.14A7.5 7.5 0 0012.5 3.5zM12 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm8.5 8.5a1 1 0 011 1v.5h.5a1 1 0 110 2h-.5v.5a1 1 0 11-2 0v-.5h-.5a1 1 0 110-2h.5v-.5a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
          clipRule="evenodd"
        />
      </svg>
    )}
  </button>
)

export default DarkModeToggle
