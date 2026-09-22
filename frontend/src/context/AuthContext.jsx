import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import API_URL_BASE from '../utils/api'

const AuthContext = createContext(null)

const API_URL = `${API_URL_BASE}/auth`

// ─── Helpers para localStorage como fallback ───
const USERS_KEY = 'techpc_users'
const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}
const saveStoredUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users))

// Usuario administrador pre-cargado
const ADMIN_USER = {
  id: 0,
  nombre: 'Administrador',
  apellido: 'General',
  tipoDocumento: 'CC',
  numeroDocumento: '1234567890',
  direccion: 'Cra 15 # 45-12, Bogotá',
  telefono: '3001234567',
  correo: 'admin@techpc.com',
  contrasena: 'Admin123*',
  rol: 'administrador',
  rol_id: 1,
  estado: 'activo',
}

const seedAdmin = () => {
  const users = getStoredUsers()
  if (!users.some((u) => u.correo === ADMIN_USER.correo)) {
    users.unshift(ADMIN_USER)
    saveStoredUsers(users)
  }
}

// Detecta si un error es de red (backend no disponible)
const isNetworkError = (err) => {
  if (!err) return true
  if (err.name === 'TypeError') return true
  if (err.name === 'AbortError') return true
  if (err.name === 'TimeoutError') return true
  const msg = (err.message || '').toLowerCase()
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed') || msg.includes('econnrefused')) return true
  return false
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Usar ref para evitar stale closures en callbacks
  const backendAvailableRef = useRef(false)

  // Cargar sesión desde localStorage al montar
  useEffect(() => {
    seedAdmin()

    const storedToken = localStorage.getItem('techpc_token')
    const storedUser = localStorage.getItem('techpc_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

    // Verificar backend de forma asíncrona
    fetch(`${API_URL_BASE}/productos`, { signal: AbortSignal.timeout(3000) })
      .then((res) => {
        backendAvailableRef.current = res.ok
      })
      .catch(() => {
        backendAvailableRef.current = false
      })
  }, [])

  // ─── Login ───
  const login = useCallback(async (email, contrasena) => {
    // Intentar backend primero
    if (backendAvailableRef.current) {
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, contrasena }),
        })

        const data = await res.json()
        if (!res.ok) {
          // Error de credenciales del backend — sí se propaga
          throw new Error(data.message || 'Correo o contraseña incorrectos.')
        }

        localStorage.setItem('techpc_token', data.token)
        localStorage.setItem('techpc_user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        return data
      } catch (err) {
        // Si es error de red, marcar backend como no disponible y continuar con fallback
        if (isNetworkError(err)) {
          backendAvailableRef.current = false
        } else {
          // Error de credenciales real (401, 403, etc.) — propagar
          throw err
        }
      }
    }

    // ─── Fallback: login con localStorage ───
    const users = getStoredUsers()
    const found = users.find((u) => u.correo === email)
    if (!found) {
      throw new Error('Correo no registrado. Por favor, crea una cuenta primero.')
    }
    if (found.contrasena !== contrasena) {
      throw new Error('Contraseña incorrecta. Intenta de nuevo.')
    }

    const userData = {
      id: found.id,
      nombre: found.nombre,
      apellido: found.apellido,
      correo: found.correo,
      rol: found.rol || 'cliente',
      rol_id: found.rol_id || 3,
    }
    const fakeToken = `local_${found.id}_${Date.now()}`
    localStorage.setItem('techpc_token', fakeToken)
    localStorage.setItem('techpc_user', JSON.stringify(userData))
    setToken(fakeToken)
    setUser(userData)
    return { token: fakeToken, user: userData }
  }, [])

  // ─── Register ───
  const register = useCallback(async (formData) => {
    // Intentar backend primero
    if (backendAvailableRef.current) {
      try {
        const res = await fetch(`${API_URL_BASE}/usuarios/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await res.json()
        if (!res.ok) {
          // Error del backend (ej: correo duplicado) — sí se propaga
          throw new Error(data.message || 'Error al registrar usuario.')
        }
        return data
      } catch (err) {
        if (isNetworkError(err)) {
          backendAvailableRef.current = false
        } else {
          // Error de validación del backend — propagar
          throw err
        }
      }
    }

    // ─── Fallback: registro con localStorage ───
    const users = getStoredUsers()
    if (users.some((u) => u.correo === formData.correo)) {
      throw new Error('El correo ya está registrado.')
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1,
      nombre: formData.nombre,
      apellido: formData.apellido,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      direccion: formData.direccion,
      telefono: formData.telefono,
      correo: formData.correo,
      contrasena: formData.contrasena,
      rol: 'cliente',
      rol_id: 3,
    }

    users.push(newUser)
    saveStoredUsers(users)
    return {
      message: 'Usuario registrado exitosamente.',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        correo: newUser.correo,
        rol: 'cliente',
        rol_id: 3,
      },
    }
  }, [])

  // ─── Logout ───
  const logout = useCallback(() => {
    localStorage.removeItem('techpc_token')
    localStorage.removeItem('techpc_user')
    localStorage.removeItem('rememberUser')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  return context
}
