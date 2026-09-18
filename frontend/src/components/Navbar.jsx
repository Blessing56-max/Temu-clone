import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingBag, User2, Heart, LogOut, LayoutDashboard, Settings, Search, Package, TrendingUp, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './ui/Button'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'
import { cn } from '@/lib/utils'
import { logoutUser } from '@/features/auth/authSlice'

const QUICK_LINKS = [
  { to: '/products', label: 'Best Sellers' },
  { to: '/products?sort=new', label: 'New In' },
  { to: '/products?category=Fashion', label: 'Fashion' },
  { to: '/products?category=Electronics', label: 'Electronics' },
  { to: '/products?category=Home', label: 'Home' },
  { to: '/products?category=Beauty', label: 'Beauty' },
  { to: '/products?category=Sports', label: 'Sports' },
  { to: '/products?category=Groceries', label: 'Groceries' },
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
    e.preventDefault()
    if (searchInput.trim()) {
      navigate('/products?q=' + encodeURIComponent(searchInput.trim()))
      setSearchInput('')
    }
  }

  async function handleLogout() {
    await dispatch(logoutUser())
    setUserMenu(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-onLight/8 shadow-sm">
      <nav className="container-page flex items-center justify-between h-16 gap-4">
        {/* LEFT: Logo */}
        <Link to="/" className="flex flex-col items-start shrink-0 group leading-none" aria-label="Kora">
          <div className="relative flex items-start">
            <svg
              className="absolute -top-1.5 left-[52%] text-leaf transition-transform duration-300 group-hover:-translate-y-0.5"
              width="11"
              height="9"
              viewBox="0 0 20 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M1 15 L1 3 L5.5 8 L10 1 L14.5 8 L19 3 L19 15 Z" />
            </svg>
            <span className="font-display font-extrabold text-2xl tracking-[-0.04em] text-onLight">
              Kora
            </span>
          </div>
          <span className="text-[8px] font-medium text-onLight/40 tracking-[0.22em] uppercase mt-0.5">
            More for less
          </span>
        </Link>

        {/* MIDDLE-LEFT: Quick links (desktop only) */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs text-onLight/60 hover:text-leaf-dim rounded-full px-3 py-2 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* MIDDLE: BIG search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, brands and categories..."
              className="w-full h-11 pl-5 pr-14 rounded-full bg-onLight/[0.04] border-2 border-onLight/8 text-sm outline-none focus:border-leaf focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-9 rounded-full bg-leaf text-onDark hover:bg-leaf-dim transition-colors flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={16} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Mobile search icon */}
        <button
          onClick={() => navigate('/products')}
          className="md:hidden p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
          aria-label="Search"
        >
          <Search size={19} className="text-onLight/70" strokeWidth={1.75} />
        </button>

        {/* RIGHT: Account, wishlist, cart */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Account */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenu((o) => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-onLight/5 transition-colors"
              >
                <div className="size-8 rounded-full bg-leaf/15 flex items-center justify-center font-display font-semibold text-[11px] text-leaf-dim">
                  {initials}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-[11px] font-medium text-onLight truncate max-w-[80px]">
                    {user?.fullName?.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-onLight/45">Account</div>
                </div>
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
            <button
              onClick={() => navigate('/auth')}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full hover:bg-onLight/5 transition-colors"
            >
              <User2 size={19} className="text-onLight/70" strokeWidth={1.75} />
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-[11px] font-medium">Sign in / Register</div>
                <div className="text-[10px] text-onLight/45">Orders & Account</div>
              </div>
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors hidden sm:block"
            aria-label="Wishlist"
          >
            <Heart size={19} className="text-onLight/70" strokeWidth={1.75} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-coral text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag size={19} className="text-onLight/70" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-leaf text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <ThemeToggle />
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