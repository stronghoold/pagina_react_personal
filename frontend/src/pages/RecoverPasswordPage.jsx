import RecoverPassword from '../components/RecoverPassword'

// Página independiente para recuperar contraseña:
// reutiliza el componente RecoverPassword, que es reutilizable
// e independiente del módulo de inicio de sesión.
const RecoverPasswordPage = () => (
  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950 sm:px-6">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-primary-500/10 dark:border-slate-800 dark:bg-slate-900 sm:p-10">
      <RecoverPassword />
    </div>
  </div>
)

export default RecoverPasswordPage
