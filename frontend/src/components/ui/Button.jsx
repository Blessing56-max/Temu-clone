import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-leaf text-onDark hover:bg-leaf-dim',
  dark: 'bg-ink text-onDark hover:bg-black',
  outline: 'border border-onLight/20 text-onLight hover:border-onLight/40',
  outlineDark: 'border border-onDark/25 text-onDark hover:border-onDark/50',
  ghost: 'text-onLight hover:bg-onLight/5',
  danger: 'bg-coral text-white hover:bg-coral/90',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  sm: 'h-9 px-4 text-xs',
}

const MotionSlot = { button: motion.button, a: motion.a, div: motion.div }

export default function Button({
  as = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  disabled,
  ...props
}) {
  const Comp = MotionSlot[as] || motion.button
  const isDisabled = disabled || loading
  return (
    <Comp
      whileHover={isDisabled ? {} : { y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200',
        isDisabled && 'opacity-50 pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </Comp>
  )
}