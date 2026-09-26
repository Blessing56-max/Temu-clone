import { useEffect, useState } from 'react'
import { ShieldCheck, XCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function AdminKycQueue() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    try {
      const r = await api.get('/admin/kyc/queue?status=PENDING')
      setItems(Array.isArray(r) ? r : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function approve(id) {
    if (!confirm('Approve this seller? They will be able to list products and receive payouts.')) return
    setBusyId(id)
    try { await api.post('/admin/kyc/' + id + '/approve', {}); await load() }
    catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  async function reject(id) {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    setBusyId(id)
    try { await api.post('/admin/kyc/' + id + '/reject', { reason }); await load() }
    catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  if (loading) return <div className="text-center py-16 text-onLight/60">Loading KYC queue...</div>

  if (items.length === 0) {
    return (
      <div className="bg-white border border-onLight/10 rounded-2xl py-16 text-center">
        <ShieldCheck size={32} className="mx-auto text-leaf/40 mb-3" />
        <p className="text-sm text-onLight/60">No KYC submissions pending. All caught up.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((k, i) => (
        <div key={k.id || i} className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-onLight/8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber/15 flex items-center justify-center">
                <AlertCircle size={18} className="text-amber" />
              </div>
              <div>
                <div className="font-medium text-sm">{k.businessName || 'Unnamed business'}</div>
                <div className="text-xs text-onLight/55 mt-0.5">{k.accountName}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-amber/15 text-amber rounded-full px-2.5 py-1 uppercase tracking-wide">
              {k.status}
            </span>
          </div>

          <div className="p-5 grid md:grid-cols-2 gap-4">
            <Row label="Bank" value={k.bankName} />
            <Row label="Account (masked)" value={k.accountNumberMasked} />
            <Row label="Resolved name" value={k.accountName} />
            <Row label="Submitted" value={k.submittedAt ? new Date(k.submittedAt).toLocaleString() : '—'} />
          </div>

          <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-onLight/8 bg-paper/50">
            <Button size="sm" onClick={() => approve(k.id)} disabled={busyId === k.id}>
              <ShieldCheck size={14} /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => reject(k.id)} disabled={busyId === k.id}>
              <XCircle size={14} /> Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-onLight/55">{label}</div>
      <div className="text-sm mt-0.5">{value || '—'}</div>
    </div>
  )
}