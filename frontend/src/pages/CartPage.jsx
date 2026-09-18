import { useEffect } from 'react'
import { resolveImageUrl } from '@/lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { fetchCart, updateCartItemApi, removeCartItemApi } from '@/store/slices/catalogSlice'
import EmptyState from '@/components/ui/EmptyState'

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center">
          <ShoppingBag size={40} className="mx-auto text-onLight/20 mb-4" />
          <p className="text-onLight/60 mb-6">Log in to view your cart.</p>
          <Button onClick={() => navigate('/login')}>Log in</Button>
        </div>
      </div>
    )
  }

  const items = cart.items || []
  const empty = items.length === 0

  function changeQty(item, delta) {
    const next = item.quantity + delta
    if (next < 1) return
    dispatch(updateCartItemApi({ itemId: item.id, quantity: next }))
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14">
        <h1 className="font-display text-3xl font-semibold mb-8">Your cart</h1>

        {empty ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add some products and they'll show up here."
            actionLabel="Browse products"
            actionTo="/products"
          />
        ) : (
          <div className="grid md:grid-cols-[1fr_340px] gap-12">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 bg-white border border-onLight/10 rounded-2xl p-4"
                >
                  <Link to={`/products/${item.productId}`} className="size-24 rounded-xl overflow-hidden shrink-0 bg-paper">
                    {item.imageUrl
                      ? <img src={resolveImageUrl(item.imageUrl)} alt={item.productName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-onLight/5" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productId}`} className="font-medium hover:text-leaf-dim block truncate">
                      {item.productName}
                    </Link>
                    <div className="text-sm text-onLight/50 mt-1">
                      &#8358;{Number(item.discountPrice || item.price).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 border border-onLight/15 rounded-full px-2 py-1">
                        <button onClick={() => changeQty(item, -1)} className="p-1 hover:text-leaf">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => changeQty(item, 1)} className="p-1 hover:text-leaf">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch(removeCartItemApi(item.id))}
                        className="p-2 text-onLight/40 hover:text-coral transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium self-start">
                    &#8358;{Number(item.lineTotal).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>

            <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit sticky top-24">
              <h3 className="font-semibold text-sm mb-4">Order summary</h3>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Items</span><span>{cart.totalItems}</span>
              </div>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Subtotal</span><span>&#8358;{Number(cart.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-onLight/60 mb-2">
                <span>Delivery</span><span>&#8358;1,500</span>
              </div>
              <div className="flex justify-between font-semibold pt-4 mt-3 border-t border-onLight/10 text-base">
                <span>Total</span>
                <span>&#8358;{(Number(cart.subtotal) + 1500).toLocaleString()}</span>
              </div>
              <Button
                size="lg"
                className="w-full mt-6"
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout
              </Button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}