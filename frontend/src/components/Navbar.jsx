import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBag, User2, Heart, LogOut, LayoutDashboard, Settings, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { cn } from '@/lib/utils'
import { logoutUser } from '@/features/auth/authSlice'
import { fetchCart, fetchWishlist } from '@/store/slices/catalogSlice'

const navLinks = [
  { to: '/products', label: 'Browse' },
  { to: '/sell', label: 'Sell on Kora' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const cartCount = useSelector((s) => s.catalog.cart.totalItems || 0)
  const wishlistCount = useSelector((s) => s.catalog.wishlist.totalItems || 0)
  const navigate = useNavigate()
  const [userMenu, setUserMenu] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const dashboardRoute =
    user?.role === 'ADMIN' ? '/admin' :
    user?.role === 'SELLER' ? '/vendor/dashboard' :
    '/customer/dashboard'

  function handleSearch(e) {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchInput.trim())}`)
      setSearchInput('')
    }
  }

  async function handleLogout() {
    await dispatch(logoutUser())
    setUserMenu(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-onLight/8">
      <nav className="container-page flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0 group" aria-label="Kora">
          <span className="relative flex items-center justify-center">
            <span className="size-2.5 rounded-full bg-leaf transition-transform duration-300 group-hover:scale-125" />
            <span className="absolute size-2.5 rounded-full bg-leaf/40 animate-ping opacity-60 group-hover:opacity-100" />
          </span>
          <span className="font-display font-semibold text-xl tracking-tight text-onLight">Kora</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-onLight/35" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-4 rounded-full bg-onLight/[0.04] border border-onLight/10 text-sm outline-none focus:border-leaf focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm text-onLight/60 hover:text-leaf-dim hover:bg-leaf/8 rounded-full px-3.5 py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => navigate('/wishlist')} className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors hidden sm:block" aria-label="Wishlist">
            <Heart size={19} className="text-onLight/70" strokeWidth={1.75} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-coral text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>
          <NotificationBell />
          <button onClick={() => navigate('/cart')} className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors" aria-label="Cart">
            <ShoppingBag size={19} className="text-onLight/70" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-leaf text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setUserMenu((o) => !o)}
                className="size-9 rounded-full bg-leaf/15 flex items-center justify-center font-display font-semibold text-xs text-leaf-dim hover:bg-leaf/25 transition-colors"
              >
                {initials}
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white border border-onLight/10 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-onLight/8">
                      <div className="text-sm font-medium truncate">{user?.fullName}</div>
                      <div className="text-xs text-onLight/45 truncate mt-0.5">{user?.email}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-leaf-dim mt-1">{user?.role}</div>
                    </div>
                    <div className="py-1">
                      <MenuLink to={dashboardRoute} icon={LayoutDashboard} onClick={() => setUserMenu(false)}>Dashboard</MenuLink>
                      <MenuLink to="/profile" icon={Settings} onClick={() => setUserMenu(false)}>Profile</MenuLink>
                      <MenuLink to="/wishlist" icon={Heart} onClick={() => setUserMenu(false)}>Wishlist</MenuLink>
                    </div>
                    <div className="border-t border-onLight/8 py-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-coral hover:bg-coral/5 transition-colors">
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button size="md" variant="primary" onClick={() => navigate('/auth')} className={cn('ml-1.5')}>
              Get Started
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-sm text-onLight/70 hover:bg-onLight/5 hover:text-onLight transition-colors">
      <Icon size={15} /> {children}
    </Link>
  )
}