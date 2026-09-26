import { Check, Clock, Truck, XCircle, Package, CircleDot, Home, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Colorblind-safe status indicator.
 * Every status has an icon + text + color — so even if you can't distinguish
 * amber from emerald, the icon and label tell you what's happening.
 */
const STATUS_MAP = {
  // Order statuses
  PENDING:           { icon: Clock,        label: 'Pending',           cls: 'bg-amber/15 text-amber' },
  PAID:              { icon: Check,        label: 'Paid',              cls: 'bg-leaf/15 text-leaf-dim' },
  PACKED:            { icon: Package,      label: 'Packed',            cls: 'bg-leaf/25 text-leaf-dim' },
  SHIPPED:           { icon: Truck,        label: 'Shipped',           cls: 'bg-canopy/15 text-canopy' },
  OUT_FOR_DELIVERY:  { icon: Truck,        label: 'Out for delivery',  cls: 'bg-canopy/25 text-canopy' },
  DELIVERED:         { icon: Home,         label: 'Delivered',         cls: 'bg-emerald/15 text-emerald' },
  CANCELLED:         { icon: XCircle,      label: 'Cancelled',         cls: 'bg-coral/15 text-coral' },

  // Escrow statuses
  HELD:              { icon: Clock,        label: 'In escrow',         cls: 'bg-amber/15 text-amber' },
  RELEASED:          { icon: Check,        label: 'Released',          cls: 'bg-emerald/15 text-emerald' },
  REFUNDED:          { icon: XCircle,      label: 'Refunded',          cls: 'bg-canopy/15 text-canopy' },
  DISPUTED:          { icon: Zap,          label: 'Disputed',          cls: 'bg-coral/15 text-coral' },

  // Withdrawal statuses
  PROCESSING:        { icon: Clock,        label: 'Processing',        cls: 'bg-canopy/15 text-canopy' },
  COMPLETED:         { icon: Check,        label: 'Completed',         cls: 'bg-emerald/15 text-emerald' },
  FAILED:            { icon: XCircle,      label: 'Failed',            cls: 'bg-coral/15 text-coral' },

  // KYC statuses
  UNVERIFIED:        { icon: CircleDot,    label: 'Unverified',        cls: 'bg-onLight/10 text-onLight/60' },
  VERIFIED:          { icon: Check,        label: 'Verified',          cls: 'bg-emerald/15 text-emerald' },
  REJECTED:          { icon: XCircle,      label: 'Rejected',          cls: 'bg-coral/15 text-coral' },

  // Rent statuses
  TRIAL:             { icon: Clock,        label: 'Trial',             cls: 'bg-leaf/15 text-leaf-dim' },
  ACTIVE:            { icon: Check,        label: 'Active',            cls: 'bg-emerald/15 text-emerald' },
  GRACE:             { icon: Clock,        label: 'Grace period',      cls: 'bg-amber/15 text-amber' },
  LOCKED:            { icon: XCircle,      label: 'Locked',            cls: 'bg-coral/15 text-coral' },
}

export default function StatusBadge({ status, showIcon = true, size = 'sm', className }) {
  const meta = STATUS_MAP[status] || { icon: CircleDot, label: status, cls: 'bg-onLight/10 text-onLight/60' }
  const Icon = meta.icon

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-1.5',
  }

  return (
    <span
      role="status"
      aria-label={`Status: ${meta.label}`}
      className={cn(
        'inline-flex items-center font-semibold rounded-full uppercase tracking-wide whitespace-nowrap',
        meta.cls,
        sizes[size],
        className,
      )}
    >
      {showIcon && <Icon size={size === 'xs' ? 10 : 12} strokeWidth={2.5} aria-hidden="true" />}
      {meta.label}
    </span>
  )
}