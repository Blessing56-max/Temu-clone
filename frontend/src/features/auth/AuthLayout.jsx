import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'

/**
 * Shared wrapper for every auth screen (AuthEntry, Login, RegistrationForm,
 * OTPVerification). Previously each page repeated the same
 * `<div className="min-h-screen bg-paper"><Navbar />...<motion.div initial=.../>`
 * boilerplate — now it lives in one place.
 *
 * `as` lets a page render a <form> instead of a <div> for the animated
 * wrapper (Login, RegistrationForm, OTPVerification all submit forms).
 */
export default function AuthLayout({
  children,
  maxWidth = 'max-w-md',
  as: Wrapper = motion.div,
  onSubmit,
  className = '',
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 md:py-24 flex justify-center">
        <Wrapper
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full ${maxWidth} ${className}`}
        >
          {children}
        </Wrapper>
      </div>
    </div>
  )
}
