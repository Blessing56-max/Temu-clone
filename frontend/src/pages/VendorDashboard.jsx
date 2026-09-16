import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, DollarSign, ShoppingCart, Eye, Star, Check, Truck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_COLORS = {
  PENDING: 'bg-amber/15 text-amber',
  PAID: 'bg-leaf/15 text-leaf-dim',
  PACKED: 'bg-leaf/20 text-leaf-dim',
  SHIPPED: 'bg-canopy/15 text-canopy',
  OUT_FOR_DELIVERY: 'bg-canopy/20 text-canopy',
  DELIVERED: 'bg-emerald/15 text-emerald',
  CANCELLED: 'bg-coral/15 text-coral',
}

export default function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [d, o] = await Promise.all([
        api.get('/seller/dashboard'),
        api.get('/seller/orders'),
      ])
      setDashboard(d)
      setOrders(o)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status, note: null })
      await load()
    } catch (e) { alert(e.message) }
  }

  const actionable = orders.filter((o) => ['PAID', 'PACKED'].includes(o.status))
  const history = orders.filter((o) => !['PAID', 'PACKED'].includes(o.status))

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold">
            {dashboard?.storeName || 'Your shop'}
          </h1>
          <p className="text-sm text-onLight/50 mt-1">Seller dashboard</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={DollarSign} label="Revenue" value={`₦${Number(dashboard?.totalRevenue || 0).toLocaleString()}`} tone="leaf" />
          <StatCard icon={ShoppingCart} label="Orders" value={dashboard?.totalOrders || 0} tone="canopy" />
          <StatCard icon={Package} label="Products" value={dashboard?.totalProducts || 0} tone="amber" />
          <StatCard icon={Star} label="Avg. rating" value={dashboard?.averageRating ?? '—'} tone="emerald" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-onLight/10 mb-6">
          {['orders', 'analytics'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                tab === t ? 'border-leaf text-leaf-dim' : 'border-transparent text-onLight/45',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            {actionable.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-lg font-semibold mb-3">
                  Orders to fulfil · {actionable.length}
                </h2>
                <div className="flex flex-col gap-3">
                  {actionable.map((o) => (
                    <OrderRow key={o.id} order={o} onAction={updateStatus} highlight />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-display text-lg font-semibold mb-3">Order history</h2>
              {history.length === 0 ? (
                <p className="text-sm text-onLight/45">No completed orders yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((o) => (
                    <OrderRow key={o.id} order={o} onAction={updateStatus} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'analytics' && dashboard && (
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Top selling products">
              {dashboard.topSellingProducts.length === 0 ? (
                <p className="text-sm text-onLight/45">No sales yet.</p>
              ) : (
                dashboard.topSellingProducts.map((p) => (
                  <div key={p.productId} className="flex justify-between text-sm py-2 border-b border-onLight/5 last:border-0">
                    <span className="truncate mr-3">{p.productName}</span>
                    <span className="text-onLight/50 shrink-0">{p.unitsSold} sold · ₦{Number(p.revenue).toLocaleString()}</span>
                  </div>
                ))
              )}
            </Panel>

            <Panel title="Most viewed products">
              {dashboard.topViewedProducts.length === 0 ? (
                <p className="text-sm text-onLight/45">No views yet.</p>
              ) : (
                dashboard.topViewedProducts.map((p) => (
                  <div key={p.productId} className="flex justify-between text-sm py-2 border-b border-onLight/5 last:border-0">
                    <span className="truncate mr-3">{p.productName}</span>
                    <span className="text-onLight/50 shrink-0 flex items-center gap-1">
                      <Eye size={12} /> {p.views}
                    </span>
                  </div>
                ))
              )}
            </Panel>

            <Panel title="Monthly revenue" className="md:col-span-2">
              {dashboard.monthlyRevenue.length === 0 ? (
                <p className="text-sm text-onLight/45">No revenue yet.</p>
              ) : (
                <div className="flex items-end gap-3 h-40">
                  {dashboard.monthlyRevenue.map((m) => {
                    const max = Math.max(...dashboard.monthlyRevenue.map((x) => Number(x.revenue)))
                    const h = max > 0 ? (Number(m.revenue) / max) * 100 : 0
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-leaf/20 rounded-t-lg relative" style={{ height: `${h}%`, minHeight: '4px' }}>
                          <div className="absolute inset-0 bg-leaf rounded-t-lg" />
                        </div>
                        <div className="text-[10px] text-onLight/45">{m.month}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone = 'leaf' }) {
  const tones = {
    leaf: 'bg-leaf/10 text-leaf-dim',
    canopy: 'bg-canopy/10 text-canopy',
    amber: 'bg-amber/10 text-amber',
    emerald: 'bg-emerald/10 text-emerald',
  }
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-5">
      <div className={cn('size-10 rounded-xl flex items-center justify-center mb-3', tones[tone])}>
        <Icon size={17} />
      </div>
      <div className="text-2xl font-display font-semibold">{value}</div>
      <div className="text-xs text-onLight/45 mt-1">{label}</div>
    </div>
  )
}

function Panel({ title, children, className = '' }) {
  return (
    <div className={cn('bg-white border border-onLight/10 rounded-2xl p-6', className)}>
      <h3 className="font-display text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function OrderRow({ order, onAction, highlight }) {
  return (
    <div className={cn(
      'bg-white border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3',
      highlight ? 'border-leaf/40' : 'border-onLight/10',
    )}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">Order #{order.id}</span>
          <span className={cn('text-[10px] font-medium rounded-full px-2 py-0.5', STATUS_COLORS[order.status])}>
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-xs text-onLight/50 truncate">
          {order.items.map((i) => `${i.productName} × ${i.quantity}`).join(' · ')}
        </div>
        <div className="text-xs text-onLight/40 mt-1">
          {order.deliveryName} · {order.deliveryPhone} · {order.deliveryAddress}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {order.status === 'PAID' && (
          <button
            onClick={() => onAction(order.id, 'PACKED')}
            className="text-xs font-medium bg-leaf text-white rounded-full px-4 py-2 hover:bg-leaf-dim transition-colors flex items-center gap-1.5"
          >
            <Check size={13} /> Mark packed
          </button>
        )}
        {order.status === 'PACKED' && (
          <button
            onClick={() => onAction(order.id, 'SHIPPED')}
            className="text-xs font-medium bg-canopy text-white rounded-full px-4 py-2 hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Truck size={13} /> Mark shipped
          </button>
        )}
      </div>
    </div>
  )
}