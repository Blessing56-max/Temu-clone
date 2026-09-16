import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import AuthLayout from '@/features/auth/AuthLayout'
import { verifyOtpSuccess } from '@/features/auth/authSlice'
import { getPostAuthRedirect } from '@/features/auth/postAuthRedirect'

export default function OTPVerification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pendingEmail = useSelector((s) => s.auth.pendingEmail)
  const user = useSelector((s) => s.auth.user)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const refs = useRef([])

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }
    // Any complete 6-digit code succeeds in this demo build
    dispatch(verifyOtpSuccess())
    navigate(getPostAuthRedirect(user))
  }

  return (
    <AuthLayout as={motion.form} onSubmit={handleSubmit} maxWidth="max-w-sm" className="text-center">
      <h1 className="font-display text-3xl font-semibold mb-2">Verify your email</h1>
      <p className="text-onLight/50 mb-8 text-sm">
        We sent a 6-digit code to {pendingEmail || 'your email'}.
      </p>
      <div className="flex justify-center gap-2 mb-4">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            maxLength={1}
            inputMode="numeric"
            className="w-11 h-12 text-center text-lg rounded-xl border border-onLight/15 bg-white focus:border-leaf focus:ring-1 focus:ring-leaf outline-none"
          />
        ))}
      </div>
      {error && <p className="text-xs text-coral mb-4">{error}</p>}
      <Button type="submit" size="lg" className="w-full">
        Verify
      </Button>
      <button type="button" className="mt-5 text-sm text-leaf hover:underline">
        Resend code
      </button>
    </AuthLayout>
  )
}
