import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, ShoppingCart, Package, Star, Eye, TrendingUp, ArrowRight } from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SellerDashboardPage() {
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/seller/dashboard'),
      api.get('/seller/orders'),
    ]).then(([d, o]) => {
      setData(d)
      setOrders(o)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const actionable = orders.filter((o) => ['PAID', 'PACKED'].includes(o.status))

  if (loading) {
    return (
      <SellerLayout>
        <div className="text-center py-20 text-onLight/50">Loading dashboard...</div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">
          Welcome back, {data?.storeName?.split(' ')[0]}
        </h1>
        <p className="text-sm text-onLight/50 mt-1">Here's how your store is doing.</p>
      </div>

      {/* Pending order alert */}
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
              <div className="text-xs text-onLight/55 mt-0.5">
                Pack and ship to keep buyers happy.
              </div>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat icon={DollarSign} label="Total revenue" value={`₦${Number(data?.totalRevenue || 0).toLocaleString()}`} tone="leaf" />
        <Stat icon={ShoppingCart} label="Orders" value={data?.totalOrders || 0} sub={`${data?.totalUnitsSold || 0} units sold`} tone="canopy" />
        <Stat icon={Package} label="Products" value={data?.totalProducts || 0} tone="amber" />
        <Stat icon={Star} label="Avg. rating" value={data?.averageRating ?? '—'} sub={`${data?.totalReviews || 0} reviews`} tone="emerald" />
      </div>

      {/* Top products + views */}
      <div className="grid md:grid-cols-2 gap-5">
        <Panel title="Top selling products" icon={TrendingUp}>
          {data.topSellingProducts.length === 0 ? (
            <p className="text-sm text-onLight/45">No sales yet.</p>
          ) : data.topSellingProducts.map((p) => (
            <div key={p.productId} className="flex justify-between items-center py-3 border-b border-onLight/5 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{p.productName}</div>
                <div className="text-xs text-onLight/45 mt-0.5">{p.unitsSold} sold</div>
              </div>
              <div className="text-sm font-medium shrink-0 ml-3">
                &#8358;{Number(p.revenue).toLocaleString()}
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Most viewed products" icon={Eye}>
          {data.topViewedProducts.length === 0 ? (
            <p className="text-sm text-onLight/45">No views yet.</p>
          ) : data.topViewedProducts.map((p) => (
            <div key={p.productId} className="flex justify-between items-center py-3 border-b border-onLight/5 last:border-0">
              <div className="text-sm font-medium truncate flex-1">{p.productName}</div>
              <div className="text-sm shrink-0 ml-3 flex items-center gap-1.5 text-onLight/60">
                <Eye size={13} /> {p.views}
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Monthly revenue" icon={DollarSign} className="md:col-span-2">
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-sm text-onLight/45">No revenue yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48 mt-2">
              {data.monthlyRevenue.map((m) => {
                const max = Math.max(...data.monthlyRevenue.map((x) => Number(x.revenue)), 1)
                const h = (Number(m.revenue) / max) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      &#8358;{Number(m.revenue).toLocaleString()}
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