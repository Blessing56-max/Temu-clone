import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingBag, Store, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Field, Input, PasswordInput } from '@/components/ui/Input'
import AuthLayout from '@/features/auth/AuthLayout'
import { registerUser, clearError } from '@/features/auth/authSlice'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  {
    id: 'CUSTOMER',
    icon: ShoppingBag,
    title: 'I want to buy',
    desc: 'Browse, wishlist, and order from verified sellers.',
  },
  {
    id: 'SELLER',
    icon: Store,
    title: 'I want to sell',
    desc: 'Open a store, list products, and get paid. KYC required.',
  },
]

export default function RegistrationForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const presetRole = (params.get('role') || '').toUpperCase()
  const { loading, error } = useSelector((s) => s.auth)

  const [role, setRole] = useState(
    presetRole === 'SELLER' ? 'SELLER' : 'CUSTOMER',
  )
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch(clearError())
    const action = await dispatch(registerUser({ ...form, role }))
    if (registerUser.fulfilled.match(action)) {
      if (redirect) {
        navigate(redirect)
      } else if (role === 'SELLER') {
        navigate('/vendor/kyc')
      } else {
        navigate('/customer/dashboard')
      }
    }
  }

  return (
    <AuthLayout
      as={motion.form}
      onSubmit={handleSubmit}
      maxWidth="max-w-lg"
      className="bg-white border border-onLight/10 rounded-3xl p-8 md:p-10"
    >
      <h1 className="font-display text-3xl font-semibold mb-1">Create your Kora account</h1>
      <p className="text-onLight/65 mb-6 text-sm">
        Pick one role. You can browse and wishlist as a seller, but buying and selling stay separate.
      </p>

      {/* Role picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {ROLE_OPTIONS.map((opt) => {
          const selected = role === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              className={cn(
                'relative text-left p-4 rounded-2xl border-2 transition-colors',
                selected
                  ? 'border-leaf bg-leaf/5'
                  : 'border-onLight/10 bg-white hover:border-onLight/25',
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 size-5 rounded-full bg-leaf flex items-center justify-center">
                  <Check size={12} className="text-onDark" strokeWidth={3} />
                </span>
              )}
              <opt.icon
                size={22}
                className={selected ? 'text-leaf-dim' : 'text-onLight/60'}
                strokeWidth={1.75}
              />
              <div className="font-semibold text-sm mt-3">{opt.title}</div>
              <div className="text-xs text-onLight/55 mt-1 leading-relaxed">{opt.desc}</div>
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        <Field label="Full name">
          <Input
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Ada Obi"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="ada@email.com"
            required
          />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <PasswordInput value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" minLength={8} required />
        </Field>
        <Field label="Phone (optional)">
          <Input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+234 800 000 0000"
          />
        </Field>
      </div>

      {error && <p className="text-xs text-coral mt-4">{error}</p>}

      <Button type="submit" size="lg" className="w-full mt-8" loading={loading} disabled={loading}>
        Create {role === 'SELLER' ? 'seller' : 'buyer'} account
      </Button>

      {role === 'SELLER' && (
        <p className="text-xs text-onLight/60 mt-4 text-center">
          After signing up, you'll verify your identity (KYC) before listing products.
        </p>
      )}

      <p className="text-center text-sm text-onLight/65 mt-6">
        Already have an account?{' '}
        <Link
          to={`/login${redirect ? '?redirect=' + encodeURIComponent(redirect) : ''}`}
          className="text-leaf hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}