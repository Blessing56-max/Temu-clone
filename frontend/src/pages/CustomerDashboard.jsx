import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import TrustBar from '@/components/TrustBar'
import FlashSaleBanner from '@/components/FlashSaleBanner'
import HeroIntro from '@/components/HeroIntro'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import Button from '@/components/ui/Button'
import { fetchProducts, fetchMyOrders, addToCartApi } from '@/store/slices/catalogSlice'

const STATUS_COLORS = {
  PENDING: 'bg-amber/15 text-amber',
  PAID: 'bg-leaf/15 text-leaf-dim',
  PACKED: 'bg-leaf/15 text-leaf-dim',
  SHIPPED: 'bg-canopy/12 text-canopy',
  OUT_FOR_DELIVERY: 'bg-canopy/15 text-canopy',
  DELIVERED: 'bg-emerald/15 text-emerald',
  CANCELLED: 'bg-coral/15 text-coral',
}

export default function CustomerDashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const products = useSelector((s) => s.catalog.products)
  const orders = useSelector((s) => s.catalog.orders)

  useEffect(() => {
    dispatch(fetchProducts({ size: 12 }))
    dispatch(fetchMyOrders())
  }, [dispatch])

  const firstName = user?.fullName?.split(' ')[0]

  function add(p) {
    dispatch(addToCartApi({ productId: p.id, quantity: 1 }))
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="container-page py-16 md:py-20">
          <HeroIntro>
            <span className="text-sm font-medium text-leaf-dim uppercase tracking-wide">For you</span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2 leading-tight">
              {firstName ? `Welcome back, ${firstName}` : 'Discover products you\u2019ll love'}
            </h1>
            <p className="text-onLight/55 mt-4 max-w-md">
              Hand-picked products from verified sellers on Kora.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/products">
                <Button size="lg" variant="primary">Browse all products</Button>
              </Link>
            </div>
          </HeroIntro>
        </div>
      </section>

      <TrustBar />

      {/* Recent orders */}
      {orders.length > 0 && (
        <section className="bg-paper py-16">
          <div className="container-page">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">Your recent orders</h2>
            </div>
            <div className="flex flex-col gap-3 max-w-3xl">
              {orders.slice(0, 5).map((o) => (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="flex justify-between items-center bg-white border border-onLight/10 rounded-xl p-4 hover:border-leaf/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-12 rounded-xl overflow-hidden bg-paper shrink-0">
                      {o.items[0]?.imageUrl && (
                        <img src={o.items[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        Order #{o.id} · {o.items.length} item{o.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-onLight/45 mt-0.5">
                        &#8358;{Number(o.total).toLocaleString()} · {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium rounded-full px-3 py-1.5 ${STATUS_COLORS[o.status] || 'bg-onLight/10'}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="bg-white py-20 border-t border-onLight/8">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl font-semibold">Fresh picks</h2>
            <Link to="/products" className="text-sm text-leaf-dim hover:underline hidden sm:block">
              View all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                className="bg-white border border-onLight/10 rounded-2xl overflow-hidden group"
              >
                <Link to={`/products/${p.id}`} className="block aspect-square overflow-hidden">
                  <ProductThumb product={p} />
                </Link>
                <div className="p-4">
                  <Link to={`/products/${p.id}`} className="font-medium text-sm hover:text-leaf-dim line-clamp-2">
                    {p.name}
                  </Link>
                  <div className="text-xs text-onLight/45 mt-0.5">{p.sellerName}</div>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <PriceTag product={p} />
                    <button
                      onClick={() => add(p)}
                      className="shrink-0 text-xs font-medium bg-ink text-onDark rounded-full px-3 py-1.5 hover:bg-canopy transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FlashSaleBanner />
    </div>
  )
}