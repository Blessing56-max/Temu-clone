import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Icon-only button with a hover tooltip. Judge feedback: text buttons were
 * confusing — icons alone are also confusing. Together they're unambiguous.
 * Tooltip renders as absolutely-positioned span with `role="tooltip"`.
 */
export default function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost',
  size = 'md',
  tooltipSide = 'bottom',
  className,
  ...props
}) {
  const [hover, setHover] = useState(false)

  const variants = {
    ghost: 'text-onLight/70 hover:bg-onLight/5 hover:text-onLight',
    leaf: 'bg-leaf text-onDark hover:bg-leaf-dim',
    outline: 'border border-onLight/20 text-onLight hover:border-onLight/40',
    danger: 'text-onLight/70 hover:bg-coral/10 hover:text-coral',
  }

  const sizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  }

  const sides = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={label}
        className={cn(
          'rounded-full flex items-center justify-center transition-colors',
          'focus-visible:outline-2 focus-visible:outline-leaf focus-visible:outline-offset-2',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 17} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {hover && label && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap bg-ink text-onDark text-[11px] font-medium px-2.5 py-1.5 rounded-lg pointer-events-none shadow-lg',
            sides[tooltipSide],
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}