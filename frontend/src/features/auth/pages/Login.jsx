import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import AuthLayout from '@/features/auth/AuthLayout'
import { loginUser, clearError } from '@/features/auth/authSlice'
import { getPostAuthRedirect } from '@/features/auth/postAuthRedirect'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect')
  const { loading, error } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch(clearError())
    const action = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(action)) {
      const target = redirect || getPostAuthRedirect(action.payload)
      navigate(target)
    }
  }

  return (
    <AuthLayout as={motion.form} onSubmit={handleSubmit} maxWidth="max-w-sm">
      <h1 className="font-display text-3xl font-semibold mb-8 text-center">Log in to Kora</h1>
      <div className="space-y-4">
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </Field>
      </div>
      {error && <p className="text-xs text-coral mt-4 text-center">{error}</p>}
      <Button type="submit" size="lg" className="w-full mt-8" loading={loading} disabled={loading}>
        Log in
      </Button>
      <p className="text-center text-sm text-onLight/50 mt-6">
        No account? <Link to={`/register${redirect ? '?redirect=' + encodeURIComponent(redirect) : ''}`} className="text-leaf hover:underline">Create one</Link>
      </p>
    </AuthLayout>
  )
}