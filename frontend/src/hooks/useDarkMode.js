import { useEffect, useState, useCallback } from 'react'

// Estado global compartido - todos los componentes usan el mismo estado
let globalDark = (() => {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})()

let listeners = new Set()

const notify = () => {
  listeners.forEach((fn) => fn(globalDark))
}

export default function useDarkMode() {
  const [dark, setDark] = useState(globalDark)

  useEffect(() => {
    // Suscribirse a cambios del estado global
    listeners.add(setDark)
    return () => listeners.delete(setDark)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const toggle = useCallback(() => {
    globalDark = !globalDark
    // Actualizar DOM inmediatamente
    const root = document.documentElement
    if (globalDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    // Notificar a todos los componentes suscritos
    notify()
  }, [])

  return { dark, toggle }
}
