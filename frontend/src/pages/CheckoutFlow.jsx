import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShieldCheck, Lock, Loader2, AlertCircle, CreditCard } from 'lucide-react'
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
  const [pendingOrder, setPendingOrder] = useState(null)

  // PCI Card State
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [chargeState, setChargeState] = useState('idle') // idle, pin, otp, processing
  const [pin, setPin] = useState('')
  const [otp, setOtp] = useState('')
  const [reference, setReference] = useState(null)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const items = cart.items || []
  const cartEmpty = items.length === 0 && !pendingOrder

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }
  function formatExpiry(val) {
    return val.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim().slice(0, 5)
  }

  function isCardValid() {
    const num = card.number.replace(/\s/g, '');
    if (num.length < 15 || num.length > 16) return false;
    if (card.expiry.length < 5) return false;
    if (card.cvv.length < 3) return false;
    return true;
  }

  function isCardValid() {
    const num = card.number.replace(/\s/g, '');
    if (num.length < 15 || num.length > 16) return false;
    if (card.expiry.length < 5) return false;
    if (card.cvv.length < 3) return false;
    return true;
  }

  async function handlePay() {
    setError(null)
    setPlacing(true)

    let order = pendingOrder
    if (!order) {
      const action = await dispatch(checkoutApi(form))
      if (!checkoutApi.fulfilled.match(action)) {
        setPlacing(false)
        setError(action.payload || 'Checkout failed')
        return
      }
      order = action.payload
      setPendingOrder(order)
    }

    const [month, year] = card.expiry.split('/')
    const payload = {
      number: card.number.replace(/\s/g, ''),
      cvv: card.cvv,
      expiry_month: month,
      expiry_year: '20' + year,
      pin: chargeState === 'pin' ? pin : null,
      otp: chargeState === 'otp' ? otp : null,
      reference: reference
    }

    try {
      const res = await api.post(`/orders/${order.id}/charge-card`, payload)
      setReference(res.reference)
      
      if (res.status === 'send_pin') {
        setChargeState('pin')
      } else if (res.status === 'send_otp') {
        setChargeState('otp')
      } else if (res.status === 'success') {
        setPlacedOrder(order)
        setPendingOrder(null)
        dispatch(fetchCart())
      } else {
        const errorMessages = {
          'expired_card': 'Your card has expired. Please use a different card.',
          'invalid_pin': 'Incorrect PIN. Please try again.',
          'cvv_verification_failed': 'The CVV you entered is incorrect.',
          'insufficient_funds': 'Insufficient funds. Please try another card.',
          'transaction_declined': 'Your bank declined this transaction. Contact your bank or try another card.',
          'suspected_fraud': 'This transaction was flagged by your bank. Please contact your bank.',
        }
        setError(errorMessages[res.gatewayResponse] || res.displayText || 'Payment failed. Please try again.')
      }
    } catch (e) {
      // If backend says "not awaiting payment", it might already be paid!
      if (e.message.includes('not awaiting payment') || e.message.includes('already been paid')) {
         try {
           const current = await api.get(`/orders/${order.id}`)
           if (current.status === 'PAID' || current.status === 'PACKED' || current.status === 'SHIPPED' || current.status === 'DELIVERED') {
             setPlacedOrder(current)
             setPendingOrder(null)
             dispatch(fetchCart())
             setPlacing(false)
             return
           }
         } catch (err) { /* ignore */ }
      }
      setError(e.message || 'Card charge failed')
    } finally {
      setPlacing(false)
    }
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6">
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Payment confirmed</h1>
          <p className="text-onLight/50 mb-2">Order #{placedOrder.id}</p>
          <p className="text-onLight/50 mb-8">Funds are held in escrow until you confirm delivery.</p>
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
      <div className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="max-w-lg">
          <ProgressBar step={step} total={3} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Delivery details</h2>
                <Field label="Full name"><Input value={form.deliveryName} onChange={(e) => setForm((f) => ({ ...f, deliveryName: e.target.value }))} placeholder="Ada Obi" /></Field>
                <Field label="Phone"><Input value={form.deliveryPhone} onChange={(e) => setForm((f) => ({ ...f, deliveryPhone: e.target.value }))} placeholder="+234 800 000 0000" /></Field>
                <Field label="Address"><Input value={form.deliveryAddress} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} placeholder="Street, city, state" /></Field>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8">
                <h2 className="font-display text-2xl font-semibold mb-6">Card Payment</h2>
                
                {chargeState === 'idle' || chargeState === 'processing' ? (
                  <div className="space-y-4">
                    <Field label="Card Number">
                      <Input value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} placeholder="0000 0000 0000 0000" maxLength={19} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry (MM/YY)">
                        <Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" maxLength={5} />
                      </Field>
                      <Field label="CVV">
                        <Input type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0,3) })} placeholder="123" maxLength={3} />
                      </Field>
                    </div>
                  </div>
                ) : chargeState === 'pin' ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-onLight/70">Enter the 4-digit PIN for your card</p>
                    <Input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="0000" maxLength={4} className="text-center text-2xl tracking-widest h-14" />
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-onLight/70">Enter the OTP sent to your phone</p>
                    <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))} placeholder="123456" maxLength={6} className="text-center text-2xl tracking-widest h-14" />
                  </div>
                )}

                <div className="mt-8 bg-leaf/8 border border-leaf/20 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-leaf shrink-0" />
                  <p className="text-xs text-onLight/70">Your card is charged securely via Paystack Direct Charge API.</p>
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
                      <span>₦{Number(c.lineTotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {error && <div className="mt-4 text-sm text-coral bg-coral/8 p-3 rounded-xl flex gap-2"><AlertCircle size={16}/> {error}</div>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)} disabled={placing || chargeState !== 'idle'}>Back</Button> : <span />}
            
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && (!form.deliveryName || !form.deliveryPhone || !form.deliveryAddress)}>
                Continue
              </Button>
            ) : (
              <Button onClick={handlePay} disabled={placing || (chargeState === 'idle' && !isCardValid()) || (chargeState === 'pin' && pin.length < 4) || (chargeState === 'otp' && otp.length < 6)}>
                {placing ? <><Loader2 size={16} className="animate-spin" /> Processing</> : chargeState === 'pin' ? 'Submit PIN' : chargeState === 'otp' ? 'Submit OTP' : 'Pay Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2"><span>Items</span><span>{cart.totalItems || pendingOrder?.items?.length || 0}</span></div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2"><span>Subtotal</span><span>₦{Number(cart.subtotal || pendingOrder?.subtotal || 0).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2"><span>Delivery</span><span>₦1,500</span></div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10"><span>Total</span><span>₦{Number(cart.subtotal ? Number(cart.subtotal) + 1500 : pendingOrder?.total || 0).toLocaleString()}</span></div>
        </aside>
      </div>
    </div>
  )
}