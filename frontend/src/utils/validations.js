// Utilidades de validación en tiempo real para los formularios.

// Devuelve null si el valor es válido o un mensaje de error si no lo es.

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const ONLY_LETTERS_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/
export const ONLY_DIGITS_REGEX = /^[0-9]+$/
export const PHONE_REGEX = /^\+?[0-9]{7,15}$/
export const DOCUMENT_REGEX = /^[0-9]{6,12}$/

export const validateEmail = (value) => {
  if (!value) return 'El correo electrónico es obligatorio.'
  if (value.length > 80) return 'El correo no puede superar los 80 caracteres.'
  if (!EMAIL_REGEX.test(value))
    return 'Ingresa un correo válido, por ejemplo: usuario@correo.com'
  return null
}

export const validatePassword = (value) => {
  if (!value) return 'La contraseña es obligatoria.'
  if (value.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.'
  if (value.length > 20) return 'La contraseña no puede superar los 20 caracteres.'
  if (!/[A-Z]/.test(value))
    return 'Debe incluir al menos una letra mayúscula.'
  if (!/[a-z]/.test(value))
    return 'Debe incluir al menos una letra minúscula.'
  if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número.'
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
    return 'Debe incluir al menos un carácter especial (!@#$%...).'
  if (/[\s]/.test(value)) return 'La contraseña no puede contener espacios.'
  return null
}

export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) return `El campo ${fieldName} es obligatorio.`
  return null
}

export const validateName = (value, fieldName, min = 2, max = 50) => {
  const required = validateRequired(value, fieldName)
  if (required) return required
  if (value.trim().length < min)
    return `El ${fieldName.toLowerCase()} debe tener mínimo ${min} caracteres.`
  if (value.trim().length > max)
    return `El ${fieldName.toLowerCase()} no puede superar los ${max} caracteres.`
  if (!ONLY_LETTERS_REGEX.test(value))
    return `El ${fieldName.toLowerCase()} solo puede contener letras y espacios.`
  return null
}

export const validateDocumentNumber = (value) => {
  const required = validateRequired(value, 'número de documento')
  if (required) return required
  if (!ONLY_DIGITS_REGEX.test(value))
    return 'El número de documento solo puede contener dígitos.'
  if (!DOCUMENT_REGEX.test(value))
    return 'El número de documento debe tener entre 6 y 12 dígitos.'
  return null
}

export const validateAddress = (value) => {
  const required = validateRequired(value, 'dirección')
  if (required) return required
  if (value.trim().length < 5)
    return 'La dirección debe tener mínimo 5 caracteres.'
  if (value.trim().length > 80)
    return 'La dirección no puede superar los 80 caracteres.'
  return null
}

export const validatePhone = (value) => {
  const required = validateRequired(value, 'teléfono')
  if (required) return required
  if (!PHONE_REGEX.test(value))
    return 'Ingresa un teléfono válido (7 a 15 dígitos).'
  return null
}

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Confirma tu contraseña.'
  if (password !== confirm) return 'Las contraseñas no coinciden.'
  return null
}

// Limpia caracteres no permitidos en un campo numérico.
export const sanitizeDigits = (value) => value.replace(/[^0-9]/g, '')

// Limpia caracteres no permitidos en nombres (solo letras y espacios).
export const sanitizeLetters = (value) => value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '')
