import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Package, Star, Eye, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SellerDashboardPage() {
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/seller/dashboard'),
      api.get('/seller/orders').catch(() => []),
    ])
      .then(([d, o]) => {
        setData(d || {})
        setOrders(Array.isArray(o) ? o : [])
      })
      .catch((e) => setError(e.message || 'Could not load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <div className="h-10 w-64 bg-onLight/5 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-white border border-onLight/10 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white border border-onLight/10 rounded-2xl animate-pulse" />
        </div>
      </SellerLayout>
    )
  }

  if (error) {
    return (
      <SellerLayout>
        <div className="max-w-lg bg-white border border-coral/25 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={20} className="text-coral" />
            <h1 className="font-display text-lg font-semibold">Dashboard couldn't load</h1>
          </div>
          <p className="text-sm text-onLight/60 mb-4">{error}</p>
          <p className="text-xs text-onLight/45">This usually means the backend isn't running or you're not signed in as a seller.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-sm font-medium bg-ink text-onDark rounded-full px-5 py-2.5 hover:bg-canopy transition-colors"
          >
            Retry
          </button>
        </div>
      </SellerLayout>
    )
  }

  const d = data || {}
  const topSelling = Array.isArray(d.topSellingProducts) ? d.topSellingProducts : []
  const topViewed = Array.isArray(d.topViewedProducts) ? d.topViewedProducts : []
  const monthly = Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : []
  const actionable = (orders || []).filter((o) => ['PAID', 'PACKED'].includes(o.status))
  const firstName = (d.storeName || 'Seller').split(' ')[0]

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Welcome back, {firstName}</h1>
        <p className="text-sm text-onLight/50 mt-1">Here's how your store is doing.</p>
      </div>

      {actionable.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-leaf/8 border border-leaf/25 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-leaf/20 flex items-center justify-center">
              <ShoppingCart size={18} className="text-leaf-dim" />
            </div>
            <div>
              <div className="font-medium">
                {actionable.length} order{actionable.length !== 1 ? 's' : ''} need action
              </div>
              <div className="text-xs text-onLight/55 mt-0.5">Pack and ship to keep buyers happy.</div>
            </div>
          </div>
          <Link
            to="/vendor/orders"
            className="text-xs font-medium bg-leaf text-onDark rounded-full px-4 py-2.5 hover:bg-leaf-dim transition-colors flex items-center gap-1.5"
          >
            View orders <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat icon={DollarSign} label="Total revenue" value={`₦${Number(d.totalRevenue || 0).toLocaleString()}`} tone="leaf" />
        <Stat icon={ShoppingCart} label="Orders" value={d.totalOrders || 0} sub={`${d.totalUnitsSold || 0} units sold`} tone="canopy" />
        <Stat icon={Package} label="Products" value={d.totalProducts || 0} tone="amber" />
        <Stat icon={Star} label="Avg. rating" value={d.averageRating ?? '—'} sub={`${d.totalReviews || 0} reviews`} tone="emerald" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Panel title="Top selling products" icon={TrendingUp}>
          {topSelling.length === 0 ? (
            <p className="text-sm text-onLight/45">No sales yet.</p>
          ) : topSelling.map((p) => (
            <div key={p.productId} className="flex justify-between items-center py-3 border-b border-onLight/5 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{p.productName}</div>
                <div className="text-xs text-onLight/45 mt-0.5">{p.unitsSold} sold</div>
              </div>
              <div className="text-sm font-medium shrink-0 ml-3">₦{Number(p.revenue).toLocaleString()}</div>
            </div>
          ))}
        </Panel>

        <Panel title="Most viewed products" icon={Eye}>
          {topViewed.length === 0 ? (
            <p className="text-sm text-onLight/45">No views yet.</p>
          ) : topViewed.map((p) => (
            <div key={p.productId} className="flex justify-between items-center py-3 border-b border-onLight/5 last:border-0">
              <div className="text-sm font-medium truncate flex-1">{p.productName}</div>
              <div className="text-sm shrink-0 ml-3 flex items-center gap-1.5 text-onLight/60">
                <Eye size={13} /> {p.views}
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Monthly revenue" icon={DollarSign} className="md:col-span-2">
          {monthly.length === 0 ? (
            <p className="text-sm text-onLight/45">No revenue yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48 mt-2">
              {monthly.map((m) => {
                const max = Math.max(...monthly.map((x) => Number(x.revenue)), 1)
                const h = (Number(m.revenue) / max) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      ₦{Number(m.revenue).toLocaleString()}
                    </div>
                    <div className="w-full relative bg-leaf/15 rounded-t-lg overflow-hidden" style={{ height: `${h}%`, minHeight: 6 }}>
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
    </SellerLayout>
  )
}

function Stat({ icon: Icon, label, value, sub, tone = 'leaf' }) {
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
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-onLight/45 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-onLight/35 mt-1">{sub}</div>}
    </div>
  )
}

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={cn('bg-white border border-onLight/10 rounded-2xl p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={15} className="text-leaf-dim" />}
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}