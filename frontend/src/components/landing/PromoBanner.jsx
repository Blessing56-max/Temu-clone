import { Link } from 'react-router-dom'
import { Tag, ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function PromoBanner() {
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const user = useSelector((s) => s.auth.user)

  const greeting = isAuthed
    ? 'Welcome back, ' + (user?.fullName?.split(' ')[0] || 'friend')
    : 'Sign in to unlock'

  return (
    <div className="bg-amber/8 border-b border-amber/20">
      <div className="container-page py-2.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Tag size={14} className="text-amber" />
            <span className="font-bold text-amber text-sm">N50,000</span>
            <span className="text-amber font-semibold hidden sm:inline">in welcome coupons</span>
          </div>
          <span className="text-onLight/60 truncate hidden md:inline">
            {isAuthed
              ? 'Use code KORA10 at checkout for 10% off your first order'
              : 'New user exclusive — register to claim'}
          </span>
        </div>

        <Link
          to={isAuthed ? '/products' : '/register'}
          className="shrink-0 flex items-center gap-1.5 bg-amber text-white text-xs font-semibold rounded-full px-4 py-1.5 hover:bg-amber/90 transition-colors"
        >
          {isAuthed ? 'Shop now' : 'Sign in to start'}
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}