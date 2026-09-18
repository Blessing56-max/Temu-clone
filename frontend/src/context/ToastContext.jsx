import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((arr) => [...arr, { id, ...toast }])
    setTimeout(() => {
      setToasts((arr) => arr.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const isError = t.type === 'error'
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={
                  'pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl border bg-white/95 backdrop-blur-md ' +
                  (isError ? 'border-coral/40' : 'border-leaf/40')
                }
              >
                <div
                  className={
                    'size-8 rounded-full flex items-center justify-center shrink-0 ' +
                    (isError ? 'bg-coral/15 text-coral' : 'bg-leaf/15 text-leaf-dim')
                  }
                >
                  {isError ? <AlertCircle size={16} /> : <Check size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-onLight">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-onLight/60 mt-0.5 line-clamp-2">{t.description}</div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 text-onLight/40 hover:text-onLight transition-colors mt-0.5"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}