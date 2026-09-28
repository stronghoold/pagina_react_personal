// URL base de la API y helpers para las peticiones al backend FastAPI.
//
// Quinto avance: la URL se puede configurar con la variable de entorno
// VITE_API_URL (útil al desplegar en Railway, Render, Vercel, etc.).
// En desarrollo local se usa http://localhost:8000/api.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

/**
 * Extrae el mensaje de error que devuelve la API.
 *
 * FastAPI responde los errores en `detail`: un texto para HTTPException
 * (ej: "El correo ya está registrado.") o una lista cuando falla la
 * validación de Pydantic (422). Algunos endpoints propios devuelven
 * `message`. Antes se leía solo `message`, así que el motivo real del error
 * se perdía y la interfaz mostraba un texto genérico.
 */
export const mensajeDeError = (data, porDefecto = 'Ocurrió un error inesperado.') => {
  const detalle = data?.detail ?? data?.message

  if (typeof detalle === 'string' && detalle.trim()) return detalle

  if (Array.isArray(detalle)) {
    const mensajes = detalle
      .map((d) => (typeof d === 'string' ? d : d?.msg))
      .filter(Boolean)
    if (mensajes.length) return mensajes.join(' ')
  }

  return porDefecto
}

/**
 * Realiza una petición a la API y devuelve el JSON.
 * Lanza un Error con el mensaje del backend cuando la respuesta no es exitosa.
 */
export const apiFetch = async (path, { token, method = 'GET', body, ...rest } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const tipo = res.headers.get('content-type') || ''
  const data = tipo.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    throw new Error(mensajeDeError(data, `Error ${res.status} al consultar la API.`))
  }
  return data
}

/**
 * Descarga un archivo (PDF o Excel) generado por el backend.
 * Devuelve la URL temporal del objeto y el nombre sugerido del archivo.
 */
export const descargarArchivo = async (path, token, nombrePorDefecto = 'documento') => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    throw new Error('No se pudo generar el documento.')
  }

  const disposicion = res.headers.get('content-disposition') || ''
  const coincidencia = disposicion.match(/filename="?([^"]+)"?/)
  const nombre = coincidencia ? coincidencia[1] : nombrePorDefecto

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.URL.revokeObjectURL(url)
  return nombre
}

export default API_URL
