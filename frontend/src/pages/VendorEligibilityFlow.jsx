import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { UploadCloud, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import { submitVendorEligibility } from '@/features/auth/authSlice'

const categories = ['Fashion & Accessories', 'Electronics', 'Home & Living', 'Beauty', 'Food & Groceries']
const ranges = ['1–10 SKUs', '10–50 SKUs', '50–100 SKUs', '100+ SKUs']

export default function VendorEligibilityFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    businessCategory: categories[0],
    expectedProductRange: ranges[0],
    idDoc: null,
    businessDoc: null,
  })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    dispatch(
      submitVendorEligibility({
        businessName: form.businessName,
        businessCategory: form.businessCategory,
        expectedProductRange: form.expectedProductRange,
        documentUrls: [form.idDoc?.name, form.businessDoc?.name].filter(Boolean),
      }),
    )
    setSubmitted(true)
  }

  if (submitted || user?.vendorVerificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 flex flex-col items-center text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-amber/15 flex items-center justify-center mb-8"
          >
            <Clock size={30} className="text-amber" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-3">Your application is under review</h1>
          <p className="text-onLight/55 max-w-md mb-10">
            Typically within a few hours. You can log in and look around your dashboard while you
            wait — listing products and payouts unlock once you're verified.
          </p>
          <Button size="lg" onClick={() => navigate('/vendor/dashboard')}>
            Go to my dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 flex justify-center">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white border border-onLight/10 rounded-3xl p-8 md:p-10"
        >
          <h1 className="font-display text-3xl font-semibold mb-1">Vendor eligibility</h1>
          <p className="text-onLight/50 mb-8 text-sm">
            A few details about your business, plus identity documents for verification.
          </p>

          <div className="space-y-5">
            <Field label="Business name">
              <Input
                required
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Business category">
                <Select value={form.businessCategory} onChange={(e) => update('businessCategory', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Expected product range">
                <Select value={form.expectedProductRange} onChange={(e) => update('expectedProductRange', e.target.value)}>
                  {ranges.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <FileDrop label="Identity document" required onFile={(f) => update('idDoc', f)} file={form.idDoc} />
            <FileDrop
              label="Business registration (optional)"
              onFile={(f) => update('businessDoc', f)}
              file={form.businessDoc}
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-8">
            Submit application
          </Button>
        </motion.form>
      </div>
    </div>
  )
}

function FileDrop({ label, required, onFile, file }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-onLight/80 mb-1.5">
        {label} {required && <span className="text-coral">*</span>}
      </span>
      <div className="flex items-center gap-3 border-2 border-dashed border-onLight/15 rounded-xl px-4 py-5 cursor-pointer hover:border-leaf/50 transition-colors">
        <UploadCloud size={20} className="text-onLight/40 shrink-0" />
        <span className="text-sm text-onLight/50 truncate">
          {file ? file.name : 'Click to upload, or drag a file here'}
        </span>
        <input
          type="file"
          required={required}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </div>
    </label>
  )
}
