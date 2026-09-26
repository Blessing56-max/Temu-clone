import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { api } from '@/lib/api'

export default function AdminRentOverview() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/rent/sellers')
      .then((r) => setItems(Array.isArray(r) ? r : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-16 text-onLight/60">Loading sellers...</div>

  const locked = items.filter((i) => i.rentStatus === 'LOCKED').length
  const grace = items.filter((i) => i.rentStatus === 'GRACE').length

  return (
    <div>
      {(locked > 0 || grace > 0) && (
        <div className="mb-4 flex flex-wrap gap-3">
          {locked > 0 && (
            <div className="flex items-center gap-2 bg-coral/10 border border-coral/25 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="text-coral" />
              <span><strong>{locked}</strong> seller{locked > 1 ? 's' : ''} locked out</span>
            </div>
          )}
          {grace > 0 && (
            <div className="flex items-center gap-2 bg-amber/10 border border-amber/25 rounded-2xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="text-amber" />
              <span><strong>{grace}</strong> in grace period</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_160px_100px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/55 uppercase tracking-wide border-b border-onLight/8">
          <span>Seller</span><span>Rent status</span><span>Paid until</span><span className="text-right">Days</span>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-16 text-sm text-onLight/60">No sellers yet.</div>
        ) : items.map((s) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_160px_100px] gap-3 items-center px-5 py-3 border-b border-onLight/5 last:border-0">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{s.name}</div>
              <div className="text-xs text-onLight/55 truncate">{s.email}</div>
            </div>
            <div><StatusBadge status={s.rentStatus} /></div>
            <div className="text-xs text-onLight/70">
              {s.paidUntil ? new Date(s.paidUntil).toLocaleDateString() : '—'}
            </div>
            <div className={'text-right text-sm font-medium ' + (s.daysLeft < 0 ? 'text-coral' : '')}>
              {s.daysLeft > 0 ? s.daysLeft : s.daysLeft === 0 ? 'today' : '−' + Math.abs(s.daysLeft)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}