import { useEffect, useState } from 'react'
import { Check, Truck, Package, ShoppingCart, Clock, MapPin } from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import EmptyState from '@/components/ui/EmptyState'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_COLORS = {
  PENDING: 'bg-amber/15 text-amber',
  PAID: 'bg-leaf/15 text-leaf-dim',
  PACKED: 'bg-leaf/25 text-leaf-dim',
  SHIPPED: 'bg-canopy/15 text-canopy',
  OUT_FOR_DELIVERY: 'bg-canopy/25 text-canopy',
  DELIVERED: 'bg-emerald/15 text-emerald',
  CANCELLED: 'bg-coral/15 text-coral',
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('action')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  async function load() {
    try {
      const r = await api.get('/seller/orders')
      setOrders(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(orderId, status, note) {
    setBusy(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status, note: note || null })
      await load()
    } catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  const actionable = orders.filter((o) => ['PAID', 'PACKED'].includes(o.status))
  const inTransit = orders.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status))
  const done = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status))

  const lists = { action: actionable, transit: inTransit, done }
  const shown = lists[filter] || []

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-onLight/50 mt-1">
          Update status so buyers see where their package is.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'action', label: 'Need action', count: actionable.length },
          { id: 'transit', label: 'In transit', count: inTransit.length },
          { id: 'done', label: 'Completed', count: done.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              'text-xs font-medium rounded-full px-4 py-2 transition-colors flex items-center gap-2',
              filter === t.id ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10',
            )}
          >
            {t.label}
            {t.count > 0 && (
              <span className={cn(
                'text-[10px] rounded-full px-1.5 min-w-[18px] h-[16px] flex items-center justify-center',
                filter === t.id ? 'bg-white/20' : 'bg-onLight/10',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-onLight/50">Loading orders...</div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={filter === 'action' ? Check : ShoppingCart}
          title={filter === 'action' ? 'All caught up' : 'No orders here'}
          description={filter === 'action' ? 'No orders are waiting on you.' : 'Orders will appear here.'}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} onAction={updateStatus} busy={busy === o.id} />
          ))}
        </div>
      )}
    </SellerLayout>
  )
}

function OrderCard({ order, onAction, busy }) {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-onLight/8">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold">Order #{order.id}</span>
          <span className={cn('text-[10px] font-semibold rounded-full px-2.5 py-1 uppercase tracking-wide', STATUS_COLORS[order.status])}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-xs text-onLight/45">
          {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="p-5">
        <div className="grid md:grid-cols-[1fr_220px] gap-5">
          {/* Items */}
          <div className="space-y-3">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center">
                <div className="size-14 rounded-xl overflow-hidden bg-paper shrink-0">
                  {it.imageUrl && <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.productName}</div>
                  <div className="text-xs text-onLight/45 mt-0.5">
                    &#8358;{Number(it.unitPrice).toLocaleString()} × {it.quantity}
                  </div>
                </div>
                <div className="text-sm font-medium shrink-0">
                  &#8358;{Number(it.lineTotal).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="bg-paper rounded-xl p-4 text-xs">
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={13} className="text-leaf mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-onLight">{order.deliveryName}</div>
                <div className="text-onLight/50 mt-0.5">{order.deliveryPhone}</div>
                <div className="text-onLight/50 mt-1 leading-relaxed">{order.deliveryAddress}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-onLight/8">
              <Clock size={12} className="text-onLight/40" />
              <span className="text-onLight/50">
                Est. {new Date(order.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-onLight/8">
          {order.status === 'PAID' && (
            <ActionButton
              icon={Package}
              label="Mark as packed"
              onClick={() => onAction(order.id, 'PACKED', 'Packed by seller, ready for pickup')}
              variant="leaf"
              busy={busy}
            />
          )}
          {order.status === 'PACKED' && (
            <ActionButton
              icon={Truck}
              label="Mark as shipped"
              onClick={() => onAction(order.id, 'SHIPPED', 'Handed to courier for delivery')}
              variant="canopy"
              busy={busy}
            />
          )}
          {['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status) && (
            <div className="text-xs text-onLight/50 flex items-center gap-1.5">
              <Truck size={13} className="text-canopy" />
              Package in transit — admin will mark delivered
            </div>
          )}
          {order.status === 'DELIVERED' && (
            <div className="text-xs text-emerald flex items-center gap-1.5">
              <Check size={13} /> Delivered · buyer can now review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, variant, busy }) {
  const styles = {
    leaf: 'bg-leaf text-onDark hover:bg-leaf-dim',
    canopy: 'bg-canopy text-white hover:opacity-90',
  }
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        'text-xs font-medium rounded-full px-4 py-2.5 transition-colors flex items-center gap-2 disabled:opacity-50',
        styles[variant],
      )}
    >
      <Icon size={13} /> {busy ? 'Updating...' : label}
    </button>
  )
}