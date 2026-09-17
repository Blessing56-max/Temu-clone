import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Trash2, Package, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { fetchWishlist, removeWishlistItemApi } from '@/store/slices/catalogSlice'
import { api } from '@/lib/api'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wishlist = useSelector((s) => s.catalog.wishlist)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [moving, setMoving] = useState(null)
  const [moved, setMoved] = useState([])

  useEffect(() => {
    dispatch(fetchWishlist())
  }, [dispatch])

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center">
          <Heart size={40} className="mx-auto text-onLight/20 mb-4" />
          <p className="text-onLight/60 mb-6">Log in to view your wishlist.</p>
          <Button onClick={() => navigate('/login?redirect=/wishlist')}>Log in</Button>
        </div>
      </div>
    )
  }

  const items = wishlist.items || []

  async function moveToCart(item) {
    setMoving(item.id)
    try {
      await api.post(`/wishlist/items/${item.id}/move-to-cart`, {})
      setMoved((arr) => [...arr, item.id])
      await dispatch(fetchWishlist())
      setTimeout(() => setMoved((arr) => arr.filter((x) => x !== item.id)), 3000)
    } catch (e) {
      alert(e.message)
    } finally {
      setMoving(null)
    }
  }

  async function removeItem(item) {
    try {
      await dispatch(removeWishlistItemApi(item.id))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold">Your wishlist</h1>
            <p className="text-sm text-onLight/50 mt-1">
              {items.length === 0
                ? 'Nothing saved yet'
                : `${items.length} item${items.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          {items.length > 0 && (
            <Link to="/products" className="text-sm font-medium text-leaf-dim hover:underline">
              Continue shopping →
            </Link>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love and find them here later."
            actionLabel="Browse products"
            actionTo="/products"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {items.map((it, i) => {
                const onSale = it.discountPrice && Number(it.discountPrice) < Number(it.price)
                const justMoved = moved.includes(it.id)
                return (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white border border-onLight/10 rounded-2xl overflow-hidden group flex flex-col"
                  >
                    <div className="relative">
                      <Link to={`/products/${it.productId}`} className="block aspect-square bg-paper overflow-hidden">
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt={it.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-onLight/5">
                            <Package size={32} className="text-onLight/20" />
                          </div>
                        )}
                      </Link>

                      {/* Stock badge */}
                      {!it.inStock && (
                        <div className="absolute top-3 left-3 bg-coral text-white text-[10px] font-semibold rounded-full px-2.5 py-1 uppercase tracking-wide">
                          Out of stock
                        </div>
                      )}
                      {it.inStock && onSale && (
                        <div className="absolute top-3 left-3 bg-leaf text-onDark text-[10px] font-semibold rounded-full px-2.5 py-1 uppercase tracking-wide">
                          On sale
                        </div>
                      )}

                      {/* Remove button top-right */}
                      <button
                        onClick={() => removeItem(it)}
                        aria-label="Remove from wishlist"
                        className="absolute top-3 right-3 size-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-onLight/50 hover:text-coral hover:bg-coral/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <Link
                        to={`/products/${it.productId}`}
                        className="font-medium text-sm hover:text-leaf-dim line-clamp-2 leading-snug"
                      >
                        {it.productName}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="font-semibold text-base">
                          ₦{Number(it.discountPrice || it.price).toLocaleString()}
                        </span>
                        {onSale && (
                          <span className="text-xs text-onLight/35 line-through">
                            ₦{Number(it.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto pt-4">
                        <button
                          onClick={() => moveToCart(it)}
                          disabled={!it.inStock || moving === it.id || justMoved}
                          className={`flex-1 text-xs font-medium rounded-full py-2.5 transition-colors flex items-center justify-center gap-1.5 ${
                            justMoved
                              ? 'bg-leaf text-onDark'
                              : 'bg-ink text-onDark hover:bg-canopy'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {justMoved ? (
                            <><Check size={13} /> Added to cart</>
                          ) : moving === it.id ? (
                            'Moving...'
                          ) : !it.inStock ? (
                            'Out of stock'
                          ) : (
                            <><ShoppingBag size={13} /> Move to cart</>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}