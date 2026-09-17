import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, Check, MapPin, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import EmptyState from '@/components/ui/EmptyState'
import { api, resolveImageUrl } from '@/lib/api'
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

const FILTERS = [
  { id: 'transit', label: 'In transit', statuses: ['SHIPPED', 'OUT_FOR_DELIVERY'] },
  { id: 'delivered', label: 'Delivered', statuses: ['DELIVERED'] },
  { id: 'all', label: 'All orders', statuses: null },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('transit')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  async function load() {
    try {
      const r = await api.get('/orders?size=100')
      setOrders(r.content || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(orderId, status) {
    setBusy(orderId)
    try {
      await api.put('/orders/' + orderId + '/status', { status, note: null })
      await load()
    } catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  const filterDef = FILTERS.find(f => f.id === filter)
  const shown = filterDef.statuses
    ? orders.filter(o => filterDef.statuses.includes(o.status))
    : orders

  const counts = {
    transit: orders.filter(o => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    all: orders.length,
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10 max-w-5xl">
        <Link to="/admin" className="text-xs text-onLight/40 hover:text-leaf-dim">
          &larr; Back to admin console
        </Link>
        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl font-semibold">Order fulfillment</h1>
          <p className="text-sm text-onLight/50 mt-1">
            Move shipped orders through delivery. Buyers get notified automatically.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'text-xs font-medium rounded-full px-4 py-2 transition-colors flex items-center gap-2',
                filter === f.id ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10',
              )}
            >
              {f.label}
              {counts[f.id] > 0 && (
                <span className={cn(
                  'text-[10px] rounded-full px-1.5 min-w-[18px] h-[16px] flex items-center justify-center',
                  filter === f.id ? 'bg-white/20' : 'bg-onLight/10',
                )}>
                  {counts[f.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-onLight/50">Loading orders...</div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Package}
            title={filter === 'transit' ? 'No orders in transit' : 'No orders here'}
            description={filter === 'transit' ? 'Orders marked shipped by sellers appear here.' : 'Nothing to show.'}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {shown.map(o => (
              <OrderCard key={o.id} order={o} onAction={updateStatus} busy={busy === o.id} />
            ))}
          </div>
        )}
      </div>
    </div>
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
          <div className="space-y-3">
            {order.items.map(it => (
              <div key={it.id} className="flex gap-3 items-center">
                <div className="size-14 rounded-xl overflow-hidden bg-paper shrink-0">
                  {it.imageUrl && <img src={resolveImageUrl(it.imageUrl)} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{it.productName}</div>
                  <div className="text-xs text-onLight/45 mt-0.5">
                    &#8358;{Number(it.unitPrice).toLocaleString()} &times; {it.quantity} &middot; Sold by {it.sellerName}
                  </div>
                </div>
                <div className="text-sm font-medium shrink-0">
                  &#8358;{Number(it.lineTotal).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

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

        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-onLight/8">
          {order.status === 'SHIPPED' && (
            <ActionButton
              icon={Truck}
              label="Mark out for delivery"
              onClick={() => onAction(order.id, 'OUT_FOR_DELIVERY')}
              variant="canopy"
              busy={busy}
            />
          )}
          {order.status === 'OUT_FOR_DELIVERY' && (
            <ActionButton
              icon={Check}
              label="Mark delivered"
              onClick={() => onAction(order.id, 'DELIVERED')}
              variant="emerald"
              busy={busy}
            />
          )}
          {order.status === 'DELIVERED' && (
            <div className="text-xs text-emerald flex items-center gap-1.5">
              <Check size={13} /> Delivered
            </div>
          )}
          {order.status === 'CANCELLED' && (
            <div className="text-xs text-coral flex items-center gap-1.5">
              Order was cancelled
            </div>
          )}
          {['PENDING', 'PAID', 'PACKED'].includes(order.status) && (
            <div className="text-xs text-onLight/50 flex items-center gap-1.5">
              Waiting on seller to mark shipped
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, variant, busy }) {
  const styles = {
    canopy: 'bg-canopy text-white hover:opacity-90',
    emerald: 'bg-emerald text-white hover:opacity-90',
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