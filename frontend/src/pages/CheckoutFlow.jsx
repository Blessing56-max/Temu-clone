import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { fetchCart, checkoutApi } from '@/store/slices/catalogSlice'

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const user = useSelector((s) => s.auth.user)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    deliveryName: user?.fullName || '',
    deliveryPhone: user?.phone || '',
    deliveryAddress: '',
  })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  const items = cart.items || []

  async function placeOrder() {
    setPlacing(true)
    setError(null)
    const action = await dispatch(checkoutApi(form))
    setPlacing(false)
    if (checkoutApi.fulfilled.match(action)) {
      setPlacedOrder(action.payload)
    } else {
      setError(action.payload || 'Checkout failed')
    }
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order placed</h1>
          <p className="text-onLight/50 mb-2">Order #{placedOrder.id}</p>
          <p className="text-onLight/50 mb-8">
            Estimated delivery: {new Date(placedOrder.estimatedDelivery).toLocaleDateString()}
          </p>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => navigate(`/orders/${placedOrder.id}`)}>
              Track order
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
              Keep shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="max-w-lg">
          <ProgressBar step={step} total={3} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Delivery details</h2>
                <Field label="Full name">
                  <Input value={form.deliveryName} onChange={(e) => setForm((f) => ({ ...f, deliveryName: e.target.value }))} placeholder="Ada Obi" />
                </Field>
                <Field label="Phone">
                  <Input value={form.deliveryPhone} onChange={(e) => setForm((f) => ({ ...f, deliveryPhone: e.target.value }))} placeholder="+234 800 000 0000" />
                </Field>
                <Field label="Address">
                  <Input value={form.deliveryAddress} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} placeholder="Street, city, state" />
                </Field>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Payment</h2>
                <div className="bg-leaf/8 border border-leaf/20 rounded-2xl p-6 text-sm text-onLight/70">
                  <p className="font-medium text-onLight mb-1">Mock payment</p>
                  <p>Payment is auto-confirmed for this demo. Card details aren't collected. Click "Place order" to simulate a successful payment.</p>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Review</h2>
                <div className="flex flex-col gap-2">
                  {items.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm bg-white border border-onLight/10 rounded-lg p-3">
                      <span>{c.productName} × {c.quantity}</span>
                      <span>&#8358;{Number(c.lineTotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {error && <p className="text-sm text-coral mt-4">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <span />}
            <Button
              onClick={() => (step < 3 ? setStep(step + 1) : placeOrder())}
              disabled={placing || (step === 1 && (!form.deliveryName || !form.deliveryPhone || !form.deliveryAddress))}
            >
              {placing ? 'Placing...' : step < 3 ? 'Continue' : 'Place order'}
            </Button>
          </div>
        </div>

        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Items</span><span>{cart.totalItems}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Subtotal</span><span>&#8358;{Number(cart.subtotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Delivery</span><span>&#8358;1,500</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
            <span>Total</span><span>&#8358;{(Number(cart.subtotal || 0) + 1500).toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}