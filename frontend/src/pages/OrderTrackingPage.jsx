import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Check, Clock, Truck, MapPin, Home, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { api, resolveImageUrl } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_META = {
  PENDING: { label: 'Order placed', icon: Clock, desc: 'We received your order' },
  PAID: { label: 'Payment confirmed', icon: Check, desc: 'We are preparing your items' },
  PACKED: { label: 'Packed', icon: Package, desc: 'Your items are packed and waiting for pickup' },
  SHIPPED: { label: 'Shipped', icon: Truck, desc: 'Your package is on the way' },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', icon: MapPin, desc: 'Arriving today' },
  DELIVERED: { label: 'Delivered', icon: Home, desc: 'Enjoy your purchase!' },
  CANCELLED: { label: 'Cancelled', icon: Clock, desc: 'This order was cancelled' },
}

const ALL_STEPS = ['PENDING', 'PAID', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [o, t] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get(`/orders/${id}/tracking`),
        ])
        setOrder(o)
        setTracking(t)
        setError(null)
      } catch (e) {
        console.error('Tracking load failed:', e)
        setError(e.message || 'Could not load this order')
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Loading order...</div>
      </div>
    )
  }

  if (error || !order || !tracking) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 max-w-md">
          <div className="bg-white border border-coral/30 rounded-2xl p-8 text-center">
            <div className="mx-auto size-14 rounded-full bg-coral/10 flex items-center justify-center mb-4">
              <AlertCircle size={22} className="text-coral" />
            </div>
            <h1 className="font-display text-xl font-semibold mb-2">Couldn't load order</h1>
            <p className="text-sm text-onLight/60 mb-2">
              {error || 'Order data was empty. You may not have permission to view this order.'}
            </p>
            <p className="text-xs text-onLight/40 mb-6">Order ID: {id}</p>
            <div className="flex flex-col gap-2">
              <Link
                to="/customer/dashboard"
                className="text-sm font-medium bg-ink text-onDark rounded-full px-5 py-2.5 hover:bg-canopy transition-colors"
              >
                Back to dashboard
              </Link>
              <button
                onClick={() => { setLoading(true); setError(null); window.location.reload() }}
                className="text-sm text-onLight/50 hover:text-onLight transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const historyMap = Object.fromEntries(tracking.timeline.map((h) => [h.status, h]))
  const currentIdx = ALL_STEPS.indexOf(tracking.currentStatus)

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12 max-w-3xl">
        <Link to="/customer/dashboard" className="text-xs text-onLight/40 hover:text-leaf-dim">
          &larr; Back to dashboard
        </Link>

        <div className="mt-6 mb-10">
          <div className="text-sm text-onLight/50">Order #{order.id}</div>
          <h1 className="font-display text-3xl font-semibold mt-1">
            {STATUS_META[tracking.currentStatus]?.label || tracking.currentStatus}
          </h1>
          {!tracking.delivered && (
            <p className="text-sm text-onLight/50 mt-2">
              Estimated delivery:{' '}
              {new Date(tracking.estimatedDelivery).toLocaleDateString('en-NG', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="bg-white border border-onLight/10 rounded-3xl p-6 md:p-8 mb-8">
          <div className="relative">
            {ALL_STEPS.map((step, i) => {
              const meta = STATUS_META[step]
              const done = i <= currentIdx
              const isCurrent = i === currentIdx
              const entry = historyMap[step]
              const Icon = meta.icon
              return (
                <div key={step} className="flex gap-4 relative">
                  {i < ALL_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'absolute left-[19px] top-10 w-0.5 h-12 transition-colors',
                        i < currentIdx ? 'bg-leaf' : 'bg-onLight/10',
                      )}
                    />
                  )}

                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'relative z-10 size-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                      done ? 'bg-leaf border-leaf text-white' : 'bg-paper border-onLight/15 text-onLight/30',
                      isCurrent && 'ring-4 ring-leaf/20',
                    )}
                  >
                    <Icon size={16} />
                  </motion.div>

                  <div className="pb-10 flex-1 min-w-0">
                    <div className={cn('font-medium text-sm', done ? 'text-onLight' : 'text-onLight/40')}>
                      {meta.label}
                    </div>
                    <div className="text-xs text-onLight/45 mt-0.5">
                      {entry ? (
                        <>
                          {new Date(entry.createdAt).toLocaleString('en-NG', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                          {entry.changedBy && <> &middot; {entry.changedBy}</>}
                        </>
                      ) : (
                        meta.desc
                      )}
                    </div>
                    {entry?.note && (
                      <div className="text-xs text-onLight/55 mt-1 italic">"{entry.note}"</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-onLight/10 rounded-3xl p-6 md:p-8 mb-8">
          <h2 className="font-display text-lg font-semibold mb-4">Items in this order</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-4 items-center">
                <div className="size-16 rounded-xl overflow-hidden bg-paper shrink-0">
                  {it.imageUrl && (
                    <img src={resolveImageUrl(it.imageUrl)} alt={it.productName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.productName}</div>
                  <div className="text-xs text-onLight/45 mt-0.5">
                    Qty {it.quantity} &middot; {it.sellerName}
                  </div>
                </div>
                <div className="text-sm font-medium">NGN {Number(it.lineTotal).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-onLight/10 mt-6 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>NGN {Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white border border-onLight/10 rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold mb-4">Delivery address</h2>
          <div className="text-sm text-onLight/70">
            <div className="font-medium text-onLight">{order.deliveryName}</div>
            <div>{order.deliveryPhone}</div>
            <div className="mt-1">{order.deliveryAddress}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}