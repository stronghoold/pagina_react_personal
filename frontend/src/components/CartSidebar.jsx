import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import CheckoutModal from './CheckoutModal'

const CartSidebar = ({ open, onClose }) => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, formatPrice } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Bloquear scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Overlay oscuro con blur */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel lateral derecho */}
      <aside className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col overflow-hidden rounded-l-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:max-w-md">
        {/* ── Encabezado con gradiente ── */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 px-6 py-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-white">Mi Carrito</h2>
                <p className="text-xs text-primary-100">
                  {items.length === 0
                    ? 'Sin productos'
                    : `${items.reduce((s, i) => s + i.quantity, 0)} producto${items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Lista de productos ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
                </svg>
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Tu carrito está vacío
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Agrega productos desde el catálogo
              </p>
              <button
                onClick={onClose}
                className="mt-5 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-primary-300 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-primary-700"
                >
                  {/* Imagen */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white dark:bg-slate-700">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-400">
                        {item.category}
                      </p>
                      <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>

                      {/* Precio */}
                      <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">
                        {formatPrice(Number(String(item.price).replace(/[^0-9]/g, '')) * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Pie del carrito ── */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.073A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
              </svg>
              Proceder al pago
            </button>

            <button
              onClick={clearCart}
              className="mt-2 w-full rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>

      {/* Procedimiento de compra: registra la venta en la base de datos */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          onClose()
        }}
      />
    </>
  )
}

export default CartSidebar
