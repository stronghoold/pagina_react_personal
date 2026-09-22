import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartDrawerContext = createContext(null)

export const CartDrawerProvider = ({ children }) => {
  const [open, setOpen] = useState(false)

  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])

  const value = useMemo(() => ({ open, openDrawer, closeDrawer }), [open, openDrawer, closeDrawer])

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  )
}

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext)
  if (!context) throw new Error('useCartDrawer debe usarse dentro de un CartDrawerProvider.')
  return context
}
