const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon,
  rightIcon,
  valid,
  maxLength,
  hint,
  wrapperClassName = '',
  ...props
}) => {
  const hasError = Boolean(error)
  const showValid = valid && !hasError

  const borderClasses = hasError
    ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-300 dark:border-rose-500 dark:focus:ring-rose-400/40'
    : showValid
      ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-300 dark:border-emerald-500 dark:focus:ring-emerald-400/40'
      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-300 dark:border-slate-600 dark:focus:border-primary-400 dark:focus:ring-primary-400/40'

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 dark:text-slate-500">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={type === 'email' ? 'email' : undefined}
          autoComplete={type === 'email' ? 'email' : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
            icon ? 'pl-10' : ''
          } ${rightIcon || showValid ? 'pr-10' : ''} ${borderClasses}`}
          aria-invalid={hasError}
          {...props}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
            {rightIcon}
          </span>
        )}
        {showValid && !rightIcon && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-emerald-500">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
        {hint && !hasError && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
        {hasError && (
          <p className="mt-1 flex items-start gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            <svg
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default Input
