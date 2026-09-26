import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, MapPin, Check, AlertCircle, Loader2, ShieldCheck,
  CreditCard, Building2, IdCard, ArrowRight, ArrowLeft, X, Clock
} from 'lucide-react'
import SellerLayout from '@/components/seller/SellerLayout'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { getKycStatus, listBanks, resolveAccount, submitKyc, uploadKycImage } from '@/features/seller/kycApi'
import { cn } from '@/lib/utils'

const ID_TYPES = [
  { value: 'NIN', label: 'National ID (NIN)' },
  { value: 'PASSPORT', label: 'International Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's Licence" },
  { value: 'VOTERS_CARD', label: "Voter's Card" },
]

export default function KycPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [banks, setBanks] = useState([])
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    idType: 'NIN',
    idNumber: '',
    idDocumentUrl: '',
    selfieUrl: '',
    businessName: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: null,
    longitude: null,
    bankName: '',
    bankCode: '',
    accountNumber: '',
  })

  const [resolved, setResolved] = useState(null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    getKycStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function loadBanksIfNeeded() {
    if (banks.length > 0) return
    try {
      const list = await listBanks()
      setBanks(list || [])
    } catch (e) {
      setError('Could not load bank list. Check backend + Paystack key.')
    }
  }

  async function handleResolve() {
    if (!form.accountNumber || !form.bankCode) return
    setResolving(true)
    setResolved(null)
    try {
      const r = await resolveAccount(form.accountNumber, form.bankCode)
      setResolved(r)
    } catch (e) {
      setError(e.message || 'Could not resolve account')
    } finally {
      setResolving(false)
    }
  }

  function useGps() {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('latitude', pos.coords.latitude)
        update('longitude', pos.coords.longitude)
      },
      () => setError('Could not get your location. Enable location access.'),
    )
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        idType: form.idType,
        idNumber: form.idNumber,
        idDocumentUrl: form.idDocumentUrl,
        selfieUrl: form.selfieUrl,
        businessName: form.businessName,
        businessAddress: form.businessAddress,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        latitude: form.latitude,
        longitude: form.longitude,
        bankName: form.bankName,
        bankCode: form.bankCode,
        accountNumber: form.accountNumber,
      }
      const result = await submitKyc(payload)
      setStatus(result)
    } catch (e) {
      setError(e.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const stepValid =
    (step === 1 && form.idType && form.idNumber && form.idDocumentUrl && form.selfieUrl) ||
    (step === 2 && form.businessName && form.businessAddress && form.city && form.state && form.zipCode && form.latitude && form.longitude) ||
    (step === 3 && form.bankName && form.bankCode && form.accountNumber && resolved) ||
    step === 4

  if (loading) {
    return (
      <SellerLayout>
        <div className="text-center py-20 text-onLight/65">Loading KYC status...</div>
      </SellerLayout>
    )
  }

  // Already verified or pending — show status card
  if (status && status.status !== 'UNVERIFIED' && status.status !== 'REJECTED') {
    return (
      <SellerLayout>
        <StatusCard status={status} onEdit={() => setStatus({ ...status, status: 'UNVERIFIED' })} />
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold">Verify your identity</h1>
          <p className="text-sm text-onLight/65 mt-1">
            Required before you can list products and receive payouts.
          </p>
        </div>

        {status?.status === 'REJECTED' && status.rejectionReason && (
          <div className="mb-6 bg-coral/8 border border-coral/25 rounded-2xl p-4 flex gap-3">
            <AlertCircle size={18} className="text-coral shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-coral">Previous submission rejected</div>
              <div className="text-xs text-onLight/60 mt-1">{status.rejectionReason}</div>
            </div>
          </div>
        )}

        <ProgressBar step={step} total={4} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="mt-8 space-y-5">
              <StepHeading icon={IdCard} title="Identity" body="Upload a government ID and a selfie holding it." />

              <Field label="ID type">
                <Select value={form.idType} onChange={(e) => update('idType', e.target.value)}>
                  {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </Field>

              <Field label="ID number">
                <Input value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="e.g. 12345678901" />
              </Field>

              <ImageUpload label="ID document photo" value={form.idDocumentUrl} onChange={(url) => update('idDocumentUrl', url)} onError={setError} />
              <ImageUpload label="Selfie holding your ID" value={form.selfieUrl} onChange={(url) => update('selfieUrl', url)} onError={setError} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="mt-8 space-y-5">
              <StepHeading icon={Building2} title="Business details" body="Where do you operate from?" />

              <Field label="Business name">
                <Input value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="e.g. Nathan Tech Ventures" />
              </Field>

              <Field label="Business address">
                <textarea
                  value={form.businessAddress}
                  onChange={(e) => update('businessAddress', e.target.value)}
                  rows={3}
                  placeholder="Street, area, landmark"
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf resize-y"
                />
              </Field>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="City">
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Lagos" />
                </Field>
                <Field label="State">
                  <Input value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="Lagos" />
                </Field>
                <Field label="Zip / Postal">
                  <Input value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} placeholder="100001" />
                </Field>
              </div>

              <div>
                <label className="block text-sm font-medium text-onLight/80 mb-2">GPS location</label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={useGps}
                    className="flex items-center gap-2 text-sm font-medium bg-leaf/10 text-leaf-dim rounded-full px-4 py-2.5 hover:bg-leaf/20 transition-colors"
                  >
                    <MapPin size={14} /> Use my current location
                  </button>
                  {form.latitude && form.longitude && (
                    <span className="text-xs text-onLight/55 flex items-center gap-1.5">
                      <Check size={12} className="text-emerald" />
                      {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-onLight/60 mt-2">
                  We use this to verify your business address is legitimate.
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="mt-8 space-y-5" onAnimationStart={loadBanksIfNeeded}>
              <StepHeading icon={CreditCard} title="Bank account" body="We'll verify this with Paystack. It must be in your name." />

              <Field label="Bank">
                <Select value={form.bankCode} onChange={(e) => {
                  const b = banks.find((x) => x.code === e.target.value)
                  update('bankCode', e.target.value)
                  update('bankName', b?.name || '')
                  setResolved(null)
                }}>
                  <option value="">{banks.length === 0 ? 'Loading banks...' : 'Select your bank'}</option>
                  {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </Select>
              </Field>

              <Field label="Account number" hint="10 digits, NUBAN">
                <Input
                  value={form.accountNumber}
                  onChange={(e) => { update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10)); setResolved(null) }}
                  placeholder="0123456789"
                  inputMode="numeric"
                  maxLength={10}
                />
              </Field>

              <button
                type="button"
                onClick={handleResolve}
                disabled={form.accountNumber.length !== 10 || !form.bankCode || resolving}
                className="text-sm font-medium bg-ink text-onDark rounded-full px-5 py-2.5 hover:bg-canopy transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {resolving ? <><Loader2 size={14} className="animate-spin" /> Resolving...</> : 'Verify account name'}
              </button>

              {resolved && (
                <div className={cn(
                  'rounded-2xl p-4 border flex gap-3',
                  resolved.matchesSellerName
                    ? 'bg-leaf/8 border-leaf/25'
                    : 'bg-amber/8 border-amber/25',
                )}>
                  {resolved.matchesSellerName ? (
                    <ShieldCheck size={18} className="text-leaf-dim shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-amber shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={cn('text-sm font-medium', resolved.matchesSellerName ? 'text-leaf-dim' : 'text-amber')}>
                      {resolved.matchesSellerName ? 'Name matches your profile' : 'Name does not match'}
                    </div>
                    <div className="text-xs text-onLight/65 mt-1">
                      Paystack says this account belongs to <strong>{resolved.accountName}</strong>.
                      Your profile name is <strong>{resolved.expectedSellerName}</strong>.
                      {!resolved.matchesSellerName && ' An admin will review your submission.'}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="mt-8 space-y-4">
              <StepHeading icon={ShieldCheck} title="Review & submit" body="Confirm everything looks right." />

              <ReviewRow label="ID type" value={ID_TYPES.find((t) => t.value === form.idType)?.label} />
              <ReviewRow label="ID number" value={form.idNumber} />
              <ReviewRow label="Business" value={form.businessName} />
              <ReviewRow label="Address" value={`${form.businessAddress}, ${form.city}, ${form.state} ${form.zipCode}`} />
              <ReviewRow label="GPS" value={`${form.latitude?.toFixed(4)}, ${form.longitude?.toFixed(4)}`} />
              <ReviewRow label="Bank" value={`${form.bankName} · ${form.accountNumber}`} />
              <ReviewRow label="Account name" value={resolved?.accountName} highlight />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-6 flex gap-3 bg-coral/8 border border-coral/25 rounded-2xl p-4">
            <AlertCircle size={16} className="text-coral shrink-0 mt-0.5" />
            <div className="text-sm text-coral">{error}</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-onLight/10">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
              <ArrowLeft size={15} /> Back
            </Button>
          ) : <span />}

          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!stepValid}>
              Continue <ArrowRight size={15} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
              Submit for verification
            </Button>
          )}
        </div>
      </div>
    </SellerLayout>
  )
}

function StepHeading({ icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <div className="size-10 rounded-xl bg-leaf/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-leaf-dim" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="text-xs text-onLight/55 mt-0.5">{body}</p>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className={cn(
      'flex justify-between gap-4 py-3 px-4 rounded-xl',
      highlight ? 'bg-leaf/8 border border-leaf/20' : 'bg-white border border-onLight/10',
    )}>
      <span className="text-xs text-onLight/60 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-right min-w-0 break-words">{value || '—'}</span>
    </div>
  )
}

function ImageUpload({ label, value, onChange, onError }) {
  const ref = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(f) {
    if (!f) return
    setUploading(true)
    try {
      const url = await uploadKycImage(f)
      onChange(url)
    } catch (e) {
      onError?.(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-onLight/80 mb-2">{label}</label>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative">
          <img src={value} alt="" className="w-full max-h-48 object-cover rounded-2xl border border-onLight/10" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 size-8 rounded-full bg-coral text-white flex items-center justify-center hover:bg-coral/90"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-onLight/20 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-leaf hover:bg-leaf/5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={22} className="text-leaf animate-spin" /><span className="text-sm text-onLight/60">Uploading...</span></>
          ) : (
            <>
              <div className="size-11 rounded-full bg-leaf/10 flex items-center justify-center">
                <Upload size={18} className="text-leaf-dim" />
              </div>
              <span className="text-sm font-medium">Click to upload</span>
              <span className="text-xs text-onLight/60">JPG, PNG, or WEBP. Max 5 MB.</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

function StatusCard({ status, onEdit }) {
  const isVerified = status.status === 'VERIFIED'
  const isPending = status.status === 'PENDING'

  return (
    <div className="max-w-lg mx-auto text-center py-10">
      <motion.div
        animate={isPending ? { scale: [1, 1.06, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className={cn(
          'mx-auto size-20 rounded-full flex items-center justify-center mb-6',
          isVerified ? 'bg-leaf/15' : 'bg-amber/15',
        )}
      >
        {isVerified
          ? <ShieldCheck size={32} className="text-leaf-dim" />
          : <Clock size={30} className="text-amber" />}
      </motion.div>

      <h1 className="font-display text-2xl font-semibold mb-2">
        {isVerified ? 'You are verified' : 'Verification in progress'}
      </h1>
      <p className="text-sm text-onLight/60 max-w-sm mx-auto mb-8">
        {isVerified
          ? 'Your KYC has been approved. You can now list products and receive payouts directly to your bank account.'
          : 'Your documents are with our team. We typically review within a few hours. You will be notified once done.'}
      </p>

      <div className="bg-white border border-onLight/10 rounded-2xl p-5 text-left space-y-3">
        <ReviewRow label="Status" value={status.status} />
        <ReviewRow label="Business" value={status.businessName} />
        <ReviewRow label="Bank" value={status.bankName} />
        <ReviewRow label="Account" value={status.accountNumberMasked} />
        <ReviewRow label="Account name" value={status.accountName} />
      </div>

      {status.rejectionReason && (
        <div className="mt-5 text-sm text-coral bg-coral/8 border border-coral/20 rounded-2xl p-4">
          {status.rejectionReason}
        </div>
      )}
    </div>
  )
}