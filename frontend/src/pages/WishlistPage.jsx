import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { fetchWishlist, removeWishlistItemApi } from '@/store/slices/catalogSlice'
import EmptyState from '@/components/ui/EmptyState'
import { api } from '@/lib/api'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wishlist = useSelector((s) => s.catalog.wishlist)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)

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
          <Button onClick={() => navigate('/login')}>Log in</Button>
        </div>
      </div>
    )
  }

  const items = wishlist.items || []

  async function moveToCart(item) {
    try {
      await api.post(`/wishlist/items/${item.id}/move-to-cart`, {})
      await dispatch(fetchWishlist())
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold mb-8">Your wishlist</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Save products you love and find them here later."
            actionLabel="Browse products"
            actionTo="/products"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-onLight/10 rounded-2xl overflow-hidden group"
              >
                <Link to={`/products/${it.productId}`} className="block aspect-square bg-paper overflow-hidden">
                  {it.imageUrl
                    ? <img src={it.imageUrl} alt={it.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full bg-onLight/5" />}
                </Link>
                <div className="p-4">
                  <Link to={`/products/${it.productId}`} className="font-medium text-sm hover:text-leaf-dim line-clamp-2">
                    {it.productName}
                  </Link>
                  <div className="text-sm font-semibold mt-2">
                    &#8358;{Number(it.discountPrice || it.price).toLocaleString()}
                    {it.discountPrice && (
                      <span className="text-xs text-onLight/35 line-through ml-2">
                        &#8358;{Number(it.price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => moveToCart(it)}
                      disabled={!it.inStock}
                      className="flex-1 text-xs font-medium bg-ink text-onDark rounded-full py-2 hover:bg-canopy transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={13} /> {it.inStock ? 'Move to cart' : 'Out of stock'}
                    </button>
                    <button
                      onClick={() => dispatch(removeWishlistItemApi(it.id))}
                      className="p-2 rounded-full border border-onLight/15 text-onLight/50 hover:text-coral hover:border-coral/40 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}