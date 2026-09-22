import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CartContext = createContext(null)

// Parsea "$2.899.000" a 2899000 (número)
const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr
  return Number(String(priceStr).replace(/[^0-9]/g, '')) || 0
}

// Formatea un número a formato colombiano: "$2.899.000"
const formatPrice = (num) => {
  return '$' + num.toLocaleString('es-CO')
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])

  // Agregar producto al carrito (si ya existe, suma cantidad)
  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }, [])

  // Remover producto del carrito
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  // Cambiar cantidad de un producto
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [])

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Total de artículos
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  // Total precio
  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + parsePrice(item.price) * item.quantity,
        0
      ),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      parsePrice,
      formatPrice,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider.')
  return context
}
