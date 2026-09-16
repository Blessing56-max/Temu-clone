import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Eye, DollarSign, Star } from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import { api } from '@/lib/api'

export default function SellerAnalyticsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/seller/dashboard').then(setData).catch(console.error)
  }, [])

  if (!data) {
    return (
      <SellerLayout>
        <div className="text-center py-20 text-onLight/50">Loading analytics...</div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-onLight/50 mt-1">Sales performance and customer interest.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Tile icon={DollarSign} label="Revenue" value={`₦${Number(data.totalRevenue).toLocaleString()}`} />
        <Tile icon={TrendingUp} label="Units sold" value={data.totalUnitsSold} />
        <Tile icon={Eye} label="Avg. views/product" value={
          data.totalProducts > 0
            ? Math.round(data.topViewedProducts.reduce((a, p) => a + p.views, 0) / data.totalProducts)
            : 0
        } />
        <Tile icon={Star} label="Avg. rating" value={data.averageRating ?? '—'} />
      </div>

      <div className="bg-white border border-onLight/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={15} className="text-leaf-dim" />
          <h3 className="font-display text-sm font-semibold">Revenue by month</h3>
        </div>
        {data.monthlyRevenue.length === 0 ? (
          <p className="text-sm text-onLight/45">No revenue data yet.</p>
        ) : (
          <div className="flex items-end gap-4 h-64">
            {data.monthlyRevenue.map((m) => {
              const max = Math.max(...data.monthlyRevenue.map((x) => Number(x.revenue)), 1)
              const h = (Number(m.revenue) / max) * 100
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    &#8358;{Number(m.revenue).toLocaleString()}
                  </div>
                  <div className="w-full relative bg-leaf/15 rounded-t-xl" style={{ height: `${h}%`, minHeight: 8 }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-leaf to-leaf/70 rounded-t-xl" />
                  </div>
                  <div className="text-xs text-onLight/45">{m.month}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-onLight/10 rounded-2xl p-6">
          <h3 className="font-display text-sm font-semibold mb-4">Top selling</h3>
          {data.topSellingProducts.map((p, i) => (
            <div key={p.productId} className="flex items-center gap-3 py-3 border-b border-onLight/5 last:border-0">
              <span className="size-7 rounded-full bg-leaf/10 text-leaf-dim text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 text-sm truncate">{p.productName}</span>
              <span className="text-xs text-onLight/50 shrink-0">{p.unitsSold} sold</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-onLight/10 rounded-2xl p-6">
          <h3 className="font-display text-sm font-semibold mb-4">Most viewed</h3>
          {data.topViewedProducts.map((p, i) => (
            <div key={p.productId} className="flex items-center gap-3 py-3 border-b border-onLight/5 last:border-0">
              <span className="size-7 rounded-full bg-canopy/10 text-canopy text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 text-sm truncate">{p.productName}</span>
              <span className="text-xs text-onLight/50 shrink-0 flex items-center gap-1">
                <Eye size={11} /> {p.views}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SellerLayout>
  )
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-5">
      <Icon size={17} className="text-leaf-dim mb-3" />
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs text-onLight/45 mt-1">{label}</div>
    </div>
  )
}