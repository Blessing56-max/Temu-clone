import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronDown, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: '3-5 business days for most orders. Sellers ship within 24 hours of receiving your order.',
  },
  {
    q: 'When is my payment released to the seller?',
    a: 'Your payment is held in escrow until you confirm delivery. If you never confirm, we auto-release after 7 days.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Register a seller account and complete KYC verification. Takes about 10 minutes.',
  },
  {
    q: 'What if the product is wrong?',
    a: 'Open a dispute from your order page. While the funds are still in escrow, we can hold the payout until it is resolved.',
  },
  {
    q: 'How do sellers get paid?',
    a: 'Once you confirm delivery, funds release automatically. Sellers withdraw to their verified bank account via Paystack.',
  },
]

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close help' : 'Open help'}
        title={open ? 'Close help' : 'Need help?'}
        className="fixed bottom-5 right-5 z-40 size-12 rounded-full bg-leaf text-onDark shadow-lg hover:bg-leaf-dim transition-colors flex items-center justify-center"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-20 right-5 z-40 w-[min(360px,calc(100vw-2rem))] bg-white border border-onLight/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-ink px-5 py-4">
              <div className="font-display font-semibold text-onDark text-sm">Need help?</div>
              <div className="text-xs text-onDark/60 mt-0.5">Answers to the most common questions</div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {FAQS.map((f, i) => (
                <div key={i} className="border-b border-onLight/5 last:border-0">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-onLight/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-onLight">{f.q}</span>
                    <ChevronDown
                      size={15}
                      className={'shrink-0 text-onLight/40 transition-transform ' + (expanded === i ? 'rotate-180' : '')}
                    />
                  </button>
                  {expanded === i && (
                    <div className="px-5 pb-4 text-xs text-onLight/60 leading-relaxed">{f.a}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 py-3 bg-paper border-t border-onLight/8 text-xs text-onLight/55 flex items-center gap-2">
              <Mail size={12} />
              Still stuck? Email <a href="mailto:help@kora.market" className="text-leaf-dim font-medium hover:underline">help@kora.market</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}