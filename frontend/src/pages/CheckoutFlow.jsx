import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShieldCheck, Lock, Loader2, AlertCircle } from 'lucide-react'
import PaystackPop from '@paystack/inline-js'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { api } from '@/lib/api'
import { fetchCart, checkoutApi } from '@/store/slices/catalogSlice'

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const user = useSelector((s) => s.auth.user)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    deliveryName: user?.fullName || '',
    deliveryPhone: user?.phone || '',
    deliveryAddress: '',
  })
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const [placedOrder, setPlacedOrder] = useState(null)
  // Keeps the order between attempts so a cancelled popup doesn't destroy progress
  const [pendingOrder, setPendingOrder] = useState(null)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const items = cart.items || []
  const cartEmpty = items.length === 0 && !pendingOrder

  async function launchPopup(order) {
    let init
    try {
      init = await api.post(`/orders/${order.id}/paystack/init`, {})
    } catch (e) {
      // The order may have been paid on a previous attempt that didn't reach
      // the success screen. Check its real status before giving up.
      try {
        const current = await api.get(`/orders/${order.id}`)
        if (current.status === 'PAID' || current.status === 'PACKED' ||
            current.status === 'SHIPPED' || current.status === 'DELIVERED') {
          setPlacedOrder(current)
          setPendingOrder(null)
          dispatch(fetchCart())
          setPlacing(false)
          return
        }
      } catch { /* fall through */ }
      setError(e.message || 'Could not start payment')
      setPlacing(false)
      return
    }

    const popup = new PaystackPop()
    popup.newTransaction({
      key: init.publicKey,
      email: user?.email,
      amount: Math.round(Number(order.total) * 100),
      reference: init.reference,
      onSuccess: async (transaction) => {
        try {
          await api.post(
            `/orders/${order.id}/paystack/verify?reference=${encodeURIComponent(transaction.reference)}`,
            {},
          )
          setPlacedOrder(order)
          setPendingOrder(null)
          dispatch(fetchCart())
        } catch (e) {
          setError(e.message || 'Payment verification failed')
        } finally {
          setPlacing(false)
        }
      },
      onCancel: () => {
        setPlacing(false)
        setError('Payment window closed. Your order is saved — click "Pay now" to try again.')
      },
    })
  }

  async function placeOrder() {
    setPlacing(true)
    setError(null)

    // If we already created the order in a previous attempt, skip creation
    if (pendingOrder) {
      await launchPopup(pendingOrder)
      return
    }

    const action = await dispatch(checkoutApi(form))
    if (!checkoutApi.fulfilled.match(action)) {
      setPlacing(false)
      setError(action.payload || 'Checkout failed')
      return
    }
    const order = action.payload
    setPendingOrder(order)
    await launchPopup(order)
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div id="main-content" className="container-page py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Payment confirmed</h1>
          <p className="text-onLight/65 mb-2">Order #{placedOrder.id}</p>
          <p className="text-onLight/65 mb-8 max-w-md">
            Funds are held in escrow until you confirm delivery.
          </p>
          <div className="flex gap-3">
            <Button size="lg" onClick={() => navigate(`/orders/${placedOrder.id}`)}>Track order</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/products')}>Keep shopping</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div id="main-content" className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
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
                <div className="bg-leaf/8 border border-leaf/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-xl bg-leaf/15 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-leaf-dim" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-onLight">Secure payment</p>
                      <p className="text-xs text-onLight/55">Powered by Paystack</p>
                    </div>
                  </div>
                  <p className="text-sm text-onLight/65 leading-relaxed">
                    Click <strong>Pay now</strong> and a secure Paystack window opens over this page.
                    Pay with card, bank transfer, or USSD.
                  </p>
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-leaf/20 text-xs text-onLight/55">
                    <Lock size={12} className="text-leaf" />
                    Card details are encrypted end-to-end and never touch Kora's servers.
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-4">Review</h2>

                {pendingOrder ? (
                  <div className="bg-amber/8 border border-amber/25 rounded-2xl p-4 mb-4">
                    <div className="text-sm font-medium text-amber">Order #{pendingOrder.id} created</div>
                    <div className="text-xs text-onLight/60 mt-1">
                      Click <strong>Pay now</strong> below to complete payment.
                    </div>
                  </div>
                ) : cartEmpty ? (
                  <div className="bg-coral/8 border border-coral/25 rounded-2xl p-4">
                    <div className="text-sm text-coral">Your cart is empty.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((c) => (
                      <div key={c.id} className="flex justify-between text-sm bg-white border border-onLight/10 rounded-lg p-3">
                        <span>{c.productName} × {c.quantity}</span>
                        <span>₦{Number(c.lineTotal).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-sm text-coral bg-coral/8 border border-coral/20 rounded-xl px-4 py-3 flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)} disabled={placing}>Back</Button> : <span />}
            <Button
              onClick={() => (step < 3 ? setStep(step + 1) : placeOrder())}
              disabled={placing || (step === 1 && (!form.deliveryName || !form.deliveryPhone || !form.deliveryAddress)) || (step === 3 && cartEmpty)}
            >
              {placing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> :
               step < 3 ? 'Continue' : (pendingOrder ? 'Pay now' : 'Place order & pay')}
            </Button>
          </div>
        </div>

        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Items</span><span>{cart.totalItems || pendingOrder?.items?.length || 0}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Subtotal</span><span>₦{Number(cart.subtotal || pendingOrder?.subtotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Delivery</span><span>₦1,500</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
            <span>Total</span><span>₦{Number(cart.subtotal ? Number(cart.subtotal) + 1500 : pendingOrder?.total || 0).toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}