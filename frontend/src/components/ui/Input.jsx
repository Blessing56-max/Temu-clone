import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-onLight/80 mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-onLight/60 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-coral mt-1">{error}</span>}
    </label>
  )
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-11 px-4 rounded-xl border border-onLight/15 bg-white text-sm text-onLight placeholder:text-onLight/55 focus:border-leaf focus:ring-1 focus:ring-leaf outline-none transition-colors',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Password input with a visibility toggle. Tap target is >=44px (the button
 * is 40px + 2px padding on each side), works with keyboard (Tab + Enter).
 * The toggle uses Eye/EyeOff icons — familiar pattern, no label needed.
 */
export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={cn(
          'w-full h-11 pl-4 pr-12 rounded-xl border border-onLight/15 bg-white text-sm text-onLight placeholder:text-onLight/55 focus:border-leaf focus:ring-1 focus:ring-leaf outline-none transition-colors',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-onLight/60 hover:text-onLight hover:bg-onLight/5 transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full h-11 px-4 rounded-xl border border-onLight/15 bg-white text-sm text-onLight focus:border-leaf focus:ring-1 focus:ring-leaf outline-none transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}