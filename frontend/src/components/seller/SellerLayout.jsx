import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Menu, X, ShieldCheck, AlertCircle, ArrowRight, Wallet, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendor/orders', label: 'Orders', icon: ShoppingCart, badge: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/vendor/wallet', label: 'Wallet', icon: Wallet },
  { to: '/vendor/kyc', label: 'KYC Verification', icon: ShieldCheck },
]

export default function SellerLayout({ children }) {
  const user = useSelector((s) => s.auth.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [pending, setPending] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const kycVerified = user?.kycStatus === 'VERIFIED'
  const kycPending  = user?.kycStatus === 'PENDING'
  const [rent, setRent] = useState(null)

  useEffect(() => {
    if (user?.role !== 'SELLER') return
    api.get('/seller/rent/status').then(setRent).catch(() => {})
  }, [user])

  useEffect(() => {
    if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') return
    const fetchPending = () => {
      api.get('/seller/pending-count').then((r) => setPending(r.pending || 0)).catch(() => {})
    }
    fetchPending()
    const id = setInterval(fetchPending, 30000)
    return () => clearInterval(id)
  }, [user])

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="mx-auto size-14 rounded-full bg-leaf/10 flex items-center justify-center mb-5">
            <Package size={22} className="text-leaf-dim" />
          </div>
          <h1 className="font-display text-xl font-semibold mb-2">Seller access required</h1>
          <p className="text-sm text-onLight/55 mb-6">
            You need to be a seller to access this area.
          </p>
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 bg-leaf text-onDark text-sm font-medium rounded-full px-5 py-2.5 hover:bg-leaf-dim transition-colors"
          >
            Become a seller
          </Link>
        </div>
      </div>
    )
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <Link to="/" className="flex items-center gap-2 px-5 py-5 border-b border-onLight/8">
        <span className="size-2.5 rounded-full bg-leaf" />
        <span className="font-display font-semibold text-xl tracking-tight text-onLight">Kora</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-leaf-dim bg-leaf/10 rounded-full px-2 py-0.5 ml-1">
          Seller
        </span>
      </Link>

      <div className="px-5 py-4 border-b border-onLight/8">
        <div className="text-xs text-onLight/60 uppercase tracking-wide">Store</div>
        <div className="font-medium text-sm mt-1 truncate">{user.fullName}</div>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-leaf/10 text-leaf-dim font-medium'
                  : 'text-onLight/60 hover:bg-onLight/5 hover:text-onLight',
              )}
            >
              <item.icon size={16} strokeWidth={active ? 2.25 : 1.75} />
              <span className="flex-1">{item.label}</span>
              {item.badge && pending > 0 && (
                <span className="text-[10px] font-semibold bg-coral text-white rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {pending > 9 ? '9+' : pending}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-onLight/8">
        <Link
          to="/vendor/products/new"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 bg-leaf text-onDark text-sm font-medium rounded-xl px-4 py-3 hover:bg-leaf-dim transition-colors justify-center"
        >
          <Plus size={15} /> New product
        </Link>
        <button
          onClick={() => navigate('/')}
          className="w-full text-xs text-onLight/65 hover:text-onLight mt-3 py-2 transition-colors"
        >
          ← Back to storefront
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-onLight/8 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-onLight/8 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-leaf" />
          <span className="font-display font-semibold">Kora</span>
          <span className="text-[10px] font-semibold text-leaf-dim bg-leaf/10 rounded-full px-2 py-0.5">Seller</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button onClick={() => setMobileOpen(true)} className="p-2">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Desktop top-right notifications overlay */}
      <div className="hidden md:block fixed top-4 right-6 z-30">
        <NotificationBell />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-onLight/40 z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-onLight/65"
              >
                <X size={18} />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
                {user?.role === 'SELLER' && rent && (rent.status === 'GRACE' || rent.status === 'LOCKED' || (rent.daysLeft <= 5 && rent.daysLeft >= 0)) && (
          <div className="max-w-6xl mx-auto px-5 md:px-10 pt-5 md:pt-8">
            <div className={cn(
              'flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 border',
              rent.status === 'LOCKED' ? 'bg-coral/10 border-coral/30' : 'bg-amber/10 border-amber/30',
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  'size-10 rounded-full flex items-center justify-center shrink-0',
                  rent.status === 'LOCKED' ? 'bg-coral/20' : 'bg-amber/20',
                )}>
                  <AlertCircle size={18} className={rent.status === 'LOCKED' ? 'text-coral' : 'text-amber'} />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {rent.status === 'LOCKED'
                      ? 'Store locked — rent unpaid'
                      : rent.status === 'GRACE'
                        ? 'Rent overdue — grace period'
                        : `${rent.daysLeft} day${rent.daysLeft === 1 ? '' : 's'} until rent is due`}
                  </div>
                  <div className="text-xs text-onLight/60 mt-0.5">
                    {rent.status === 'LOCKED'
                      ? 'Your products are hidden. Pay rent to reactivate your store.'
                      : `Monthly rent: ₦${Number(rent.monthlyAmount).toLocaleString()}`}
                  </div>
                </div>
              </div>
              <Link
                to="/vendor/wallet"
                className={cn(
                  'text-xs font-medium text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0',
                  rent.status === 'LOCKED' ? 'bg-coral' : 'bg-amber',
                )}
              >
                Pay rent <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
        {user?.role === 'SELLER' && !kycVerified && (
          <div className="max-w-6xl mx-auto px-5 md:px-10 pt-5 md:pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-amber/10 border border-amber/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-amber" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {kycPending ? 'KYC pending review' : 'Finish KYC verification'}
                  </div>
                  <div className="text-xs text-onLight/60 mt-0.5">
                    {kycPending
                      ? 'An admin is reviewing your submission. You will be notified once approved.'
                      : 'You cannot list products or receive payouts until your identity is verified.'}
                  </div>
                </div>
              </div>
              {!kycPending && (
                <Link
                  to="/vendor/kyc"
                  className="text-xs font-medium bg-amber text-white rounded-full px-4 py-2.5 hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  Verify now <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto p-5 md:p-10">{children}</div>
      </main>
    </div>
  )
}