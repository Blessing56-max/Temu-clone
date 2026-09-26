import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Lock, TrendingUp, Clock, ArrowDownToLine,
  AlertCircle, ShieldCheck, Info, X, Loader2, Check
} from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`

const STATUS_STYLES = {
  PENDING:    'bg-amber/10 text-amber',
  PROCESSING: 'bg-canopy/10 text-canopy',
  COMPLETED:  'bg-emerald/10 text-emerald',
  FAILED:     'bg-coral/10 text-coral',
}

export default function SellerWalletPage() {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rent, setRent] = useState(null)
  const [payingRent, setPayingRent] = useState(false)

  const load = useCallback(async () => {
    try {
      const [w, h] = await Promise.all([
        api.get('/seller/wallet'),
        api.get('/seller/wallet/withdrawals?size=20').catch(() => []),
      ])
      api.get('/seller/rent/status').then(setRent).catch(() => {})
      setData(w)
      setHistory(Array.isArray(h) ? h : [])
      setError(null)
    } catch (e) {
      setError(e.message || 'Could not load wallet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <SellerLayout>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white border border-onLight/10 rounded-2xl animate-pulse" />
          ))}
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
            <h1 className="font-display text-lg font-semibold">Wallet couldn't load</h1>
          </div>
          <p className="text-sm text-onLight/60">{error}</p>
        </div>
      </SellerLayout>
    )
  }

  const d = data || {}
    async function payRent() {
    setPayingRent(true)
    try {
      await api.post('/seller/rent/pay', {})
      await load()
      await api.get('/seller/rent/status').then(setRent).catch(() => {})
    } catch (e) {
      alert(e.message || 'Rent payment failed')
    } finally {
      setPayingRent(false)
    }
  }
  const canWithdraw = Number(d.availableBalance) >= Number(d.minimumWithdrawal)

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Wallet</h1>
        <p className="text-sm text-onLight/65 mt-1">
          Funds are released to you when buyers confirm delivery. Kora keeps {d.commissionPercent || 15}% commission per sale.
        </p>
      </div>

      {/* Balance grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tile icon={Wallet} tone="leaf" label="Available to withdraw" value={fmt(d.availableBalance)} highlight />
        <Tile icon={Lock} tone="amber" label="In escrow (held)" value={fmt(d.pendingEscrow)} />
        <Tile icon={TrendingUp} tone="emerald" label="Total earned (lifetime)" value={fmt(d.totalEarned)} />
        <Tile icon={Clock} tone="canopy" label="Pending withdrawals" value={fmt(d.pendingWithdrawals)} />
      </div>

            {/* Rent status card */}
      {rent && (
        <div className={cn(
          'rounded-3xl p-6 md:p-8 mb-8 border',
          rent.status === 'LOCKED' ? 'bg-coral/8 border-coral/25' :
          rent.status === 'GRACE' ? 'bg-amber/8 border-amber/25' :
          'bg-white border-onLight/10',
        )}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1 min-w-[260px]">
              <h2 className="font-display text-lg font-semibold mb-1">Store rent</h2>
              <p className="text-sm text-onLight/55 leading-relaxed max-w-md">
                ₦{Number(rent.monthlyAmount).toLocaleString()}/month.
                {rent.status === 'TRIAL' && ' You are on the 30-day free trial.'}
                {rent.status === 'ACTIVE' && ` Next due: ${new Date(rent.paidUntil).toLocaleDateString()}.`}
                {rent.status === 'GRACE' && ` Overdue by ${Math.abs(rent.daysLeft)} day(s). Grace ends soon.`}
                {rent.status === 'LOCKED' && ' Your store is locked until rent is paid.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-w-[180px]">
              {rent.status === 'TRIAL' && (
                <div className="text-xs font-medium text-leaf-dim bg-leaf/10 rounded-full px-4 py-2.5 text-center">
                  Trial · {rent.daysLeft} days left
                </div>
              )}
              {rent.status === 'ACTIVE' && rent.daysLeft <= 5 && (
                <button
                  onClick={payRent}
                  disabled={payingRent}
                  className="text-sm font-medium bg-amber text-white rounded-full px-5 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {payingRent ? 'Processing...' : 'Pay next month'}
                </button>
              )}
              {(rent.status === 'GRACE' || rent.status === 'LOCKED') && (
                <button
                  onClick={payRent}
                  disabled={payingRent}
                  className="text-sm font-medium bg-coral text-white rounded-full px-5 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {payingRent ? 'Processing...' : 'Pay rent now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
{/* Withdraw CTA card */}
      <div className="bg-white border border-onLight/10 rounded-3xl p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-[260px]">
            <h2 className="font-display text-lg font-semibold mb-2">Withdraw to your bank</h2>
            <p className="text-sm text-onLight/55 leading-relaxed max-w-md">
              Minimum withdrawal is {fmt(d.minimumWithdrawal)}. Payouts go via Paystack to your verified bank account, typically within a few hours.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-onLight/55">
              <ShieldCheck size={14} className="text-leaf" />
              Your bank account was verified during KYC.
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <button
              onClick={() => setShowModal(true)}
              disabled={!canWithdraw}
              className={cn(
                'flex items-center justify-center gap-2 text-sm font-medium rounded-full px-6 py-3 transition-colors',
                canWithdraw
                  ? 'bg-leaf text-onDark hover:bg-leaf-dim'
                  : 'bg-onLight/8 text-onLight/55 cursor-not-allowed',
              )}
            >
              <ArrowDownToLine size={15} />
              {canWithdraw ? 'Request withdrawal' : `Min ${fmt(d.minimumWithdrawal)}`}
            </button>
            {!canWithdraw && Number(d.availableBalance) > 0 && (
              <p className="text-[11px] text-onLight/60 text-center">
                {fmt(Number(d.minimumWithdrawal) - Number(d.availableBalance))} more to unlock
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-onLight/8 flex items-start gap-2.5 text-xs text-onLight/65">
          <Info size={14} className="shrink-0 mt-0.5 text-onLight/60" />
          <p>
            Withdrawal requests go to an admin queue. Once approved, Paystack Transfer dispatches the funds and you get a notification.
          </p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white border border-onLight/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-onLight/8">
          <h2 className="font-display text-sm font-semibold">Withdrawal history</h2>
        </div>

        {history.length === 0 ? (
          <div className="py-16 text-center text-sm text-onLight/60">
            No withdrawals yet.
          </div>
        ) : (
          <div className="divide-y divide-onLight/5">
            {history.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'size-10 rounded-xl flex items-center justify-center shrink-0',
                    w.status === 'COMPLETED' ? 'bg-emerald/10 text-emerald' :
                    w.status === 'FAILED' ? 'bg-coral/10 text-coral' :
                    'bg-amber/10 text-amber',
                  )}>
                    {w.status === 'COMPLETED' ? <Check size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{fmt(w.amount)}</div>
                    <div className="text-xs text-onLight/60 mt-0.5">
                      {new Date(w.requestedAt).toLocaleString('en-NG', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                      {w.paystackReference && <> · Ref {w.paystackReference.slice(0, 14)}…</>}
                    </div>
                    {w.failureReason && (
                      <div className="text-xs text-coral mt-1">{w.failureReason}</div>
                    )}
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] font-semibold rounded-full px-2.5 py-1 uppercase tracking-wide shrink-0',
                  STATUS_STYLES[w.status],
                )}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <WithdrawModal
            available={Number(d.availableBalance)}
            minimum={Number(d.minimumWithdrawal)}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); load() }}
          />
        )}
      </AnimatePresence>
    </SellerLayout>
  )
}

function Tile({ icon: Icon, tone, label, value, highlight }) {
  const tones = {
    leaf: 'bg-leaf/10 text-leaf-dim',
    amber: 'bg-amber/10 text-amber',
    emerald: 'bg-emerald/10 text-emerald',
    canopy: 'bg-canopy/10 text-canopy',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white border rounded-2xl p-5',
        highlight ? 'border-leaf/40 shadow-sm' : 'border-onLight/10',
      )}
    >
      <div className={cn('size-10 rounded-xl flex items-center justify-center mb-3', tones[tone])}>
        <Icon size={17} />
      </div>
      <div className="font-display text-2xl font-semibold leading-tight">{value}</div>
      <div className="text-xs text-onLight/60 mt-1">{label}</div>
    </motion.div>
  )
}

function WithdrawModal({ available, minimum, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const numeric = Number(amount)
  const valid = numeric >= minimum && numeric <= available

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (!valid) {
      setError(numeric < minimum
        ? `Minimum withdrawal is ₦${minimum.toLocaleString()}`
        : 'Amount exceeds available balance')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/seller/wallet/withdraw', { amount: numeric })
      onSuccess()
    } catch (e) {
      setError(e.message || 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-onLight/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-semibold">Request withdrawal</h2>
            <p className="text-xs text-onLight/65 mt-1">
              Available: <strong className="text-onLight">{fmt(available)}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-onLight/5">
            <X size={18} />
          </button>
        </div>

        <Field label="Amount (NGN)" hint={`Minimum ₦${minimum.toLocaleString()}`}>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(minimum)}
            min={minimum}
            max={available}
            step="100"
            required
            autoFocus
          />
        </Field>

        <div className="flex gap-2 mt-3 flex-wrap">
          <button type="button" onClick={() => setAmount(String(available))}
            className="text-xs font-medium bg-onLight/5 rounded-full px-3 py-1.5 hover:bg-onLight/10">
            Use all ({fmt(available)})
          </button>
          <button type="button" onClick={() => setAmount(String(minimum))}
            className="text-xs font-medium bg-onLight/5 rounded-full px-3 py-1.5 hover:bg-onLight/10">
            Minimum
          </button>
        </div>

        {error && (
          <div className="mt-4 text-xs text-coral bg-coral/8 border border-coral/20 rounded-xl px-4 py-2.5 flex items-start gap-2">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-5 border-t border-onLight/8">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || submitting} className="flex-1">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Request payout'}
          </Button>
        </div>

        <p className="text-[11px] text-onLight/60 mt-4 text-center">
          Payouts are dispatched after admin approval via Paystack.
        </p>
      </motion.form>
    </motion.div>
  )
}