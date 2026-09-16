import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendor/orders', label: 'Orders', icon: ShoppingCart, badge: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function SellerLayout({ children }) {
  const user = useSelector((s) => s.auth.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [pending, setPending] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

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
        <div className="text-xs text-onLight/45 uppercase tracking-wide">Store</div>
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
          className="w-full text-xs text-onLight/50 hover:text-onLight mt-3 py-2 transition-colors"
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
                className="absolute top-4 right-4 p-2 text-onLight/50"
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
        <div className="max-w-6xl mx-auto p-5 md:p-10">{children}</div>
      </main>
    </div>
  )
}