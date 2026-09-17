import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import AuthLayout from '@/features/auth/AuthLayout'
import { registerUser, clearError } from '@/features/auth/authSlice'
import { getPostAuthRedirect } from '@/features/auth/postAuthRedirect'

export default function RegistrationForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const { loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch(clearError())
    const action = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(action)) {
      const target = redirect || getPostAuthRedirect(action.payload)
      navigate(target)
    }
  }

  return (
    <AuthLayout as={motion.form} onSubmit={handleSubmit} maxWidth="max-w-md" className="bg-white border border-onLight/10 rounded-3xl p-8 md:p-10">
      <h1 className="font-display text-3xl font-semibold mb-1">Create your Kora account</h1>
      <p className="text-onLight/50 mb-8 text-sm">Shop, sell, or both — one account.</p>
      <div className="space-y-4">
        <Field label="Full name">
          <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Ada Obi" required />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="ada@email.com" required />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" minLength={8} required />
        </Field>
        <Field label="Phone (optional)">
          <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
        </Field>
      </div>
      {error && <p className="text-xs text-coral mt-4">{error}</p>}
      <Button type="submit" size="lg" className="w-full mt-8" loading={loading} disabled={loading}>
        Create account
      </Button>
      <p className="text-center text-sm text-onLight/50 mt-6">
        Already have an account? <Link to={`/login${redirect ? '?redirect=' + encodeURIComponent(redirect) : ''}`} className="text-leaf hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  )
}