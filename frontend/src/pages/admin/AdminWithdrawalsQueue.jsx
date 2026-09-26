import { useEffect, useState } from 'react'
import { Wallet, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/StatusBadge'
import { api } from '@/lib/api'

export default function AdminWithdrawalsQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('PENDING')

  async function load() {
    try {
      const r = await api.get('/admin/withdrawals?status=' + filter)
      setItems(Array.isArray(r) ? r : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  async function approve(id) {
    if (!confirm('Approve this payout? Paystack Transfer will fire immediately.')) return
    setBusyId(id)
    try { await api.post('/admin/withdrawals/' + id + '/approve', {}); await load() }
    catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  async function reject(id) {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    setBusyId(id)
    try { await api.post('/admin/withdrawals/' + id + '/reject', { reason }); await load() }
    catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  const FILTERS = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'text-xs font-medium rounded-full px-3.5 py-2 transition-colors ' +
              (filter === f ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10')}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-onLight/60">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-onLight/10 rounded-2xl py-16 text-center">
          <Wallet size={32} className="mx-auto text-leaf/40 mb-3" />
          <p className="text-sm text-onLight/60">No {filter.toLowerCase()} withdrawals.</p>
        </div>
      ) : (
        <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_140px_200px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/55 uppercase tracking-wide border-b border-onLight/8">
            <span>Seller</span><span>Amount</span><span>Status</span><span className="text-right">Actions</span>
          </div>
          {items.map((w) => (
            <div key={w.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_200px] gap-3 items-center px-5 py-4 border-b border-onLight/5 last:border-0">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{w.sellerName}</div>
                <div className="text-xs text-onLight/55 truncate">{w.sellerEmail}</div>
                {w.failureReason && (
                  <div className="text-xs text-coral mt-1">{w.failureReason}</div>
                )}
              </div>
              <div className="font-semibold">₦{Number(w.amount).toLocaleString()}</div>
              <div><StatusBadge status={w.status} /></div>
              <div className="flex gap-2 md:justify-end">
                {w.status === 'PENDING' && (
                  <>
                    <Button size="sm" onClick={() => approve(w.id)} disabled={busyId === w.id}>
                      <Check size={13} /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(w.id)} disabled={busyId === w.id}>
                      <X size={13} /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}