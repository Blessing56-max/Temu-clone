import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function PaymentCallback() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reference = params.get('reference') || params.get('trxref')
  const [state, setState] = useState({ loading: true, error: null, order: null })

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, error: 'No payment reference received from Paystack', order: null })
      return
    }
    api.post('/orders/' + id + '/paystack/verify?reference=' + encodeURIComponent(reference), {})
      .then((order) => setState({ loading: false, error: null, order }))
      .catch((e) => setState({ loading: false, error: e.message || 'Verification failed', order: null }))
  }, [id, reference])

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-24 max-w-md mx-auto text-center">
        {state.loading && (
          <>
            <Loader2 size={40} className="mx-auto text-leaf animate-spin mb-6" />
            <h1 className="font-display text-2xl font-semibold mb-2">Verifying payment...</h1>
            <p className="text-sm text-onLight/55">Confirming with Paystack. Hold on a moment.</p>
          </>
        )}

        {!state.loading && state.error && (
          <>
            <div className="mx-auto size-16 rounded-full bg-coral/10 flex items-center justify-center mb-6">
              <AlertCircle size={28} className="text-coral" />
            </div>
            <h1 className="font-display text-2xl font-semibold mb-2">Payment not confirmed</h1>
            <p className="text-sm text-onLight/60 mb-8">{state.error}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/orders/' + id)}>View order</Button>
              <Button variant="outline" onClick={() => navigate('/cart')}>Back to cart</Button>
            </div>
          </>
        )}

        {!state.loading && state.order && (
          <>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
            >
              <Check size={28} className="text-emerald" />
            </motion.div>
            <h1 className="font-display text-3xl font-semibold mb-2">Payment confirmed</h1>
            <p className="text-sm text-onLight/55 mb-2">Order #{state.order.id}</p>
            <p className="text-sm text-onLight/55 mb-8">
              Funds are held in escrow until you confirm delivery.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/orders/' + state.order.id)}>Track order</Button>
              <Button variant="outline" onClick={() => navigate('/products')}>Keep shopping</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}