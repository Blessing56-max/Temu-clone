import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Store, TrendingUp, Truck, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { loadCurrentUser } from '@/features/auth/authSlice'

const PERKS = [
  { icon: Store, title: 'Your own storefront', body: 'A dedicated page for your products with your branding.' },
  { icon: TrendingUp, title: 'Real-time analytics', body: 'See views, sales, revenue, and top-performing products.' },
  { icon: Truck, title: 'Order management', body: 'Pack and ship with a click. Buyers see live tracking.' },
  { icon: ShieldCheck, title: 'Verified sellers only', body: 'Every seller is ID-checked. Trust works both ways.' },
]

export default function BecomeSellerPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const alreadySeller = user?.role === 'SELLER'

  async function handleBecome() {
    setError(null)

    if (!isAuthed) {
      navigate('/login?redirect=/sell')
      return
    }

    if (alreadySeller) {
      navigate('/vendor/dashboard')
      return
    }

    setLoading(true)
    try {
      await api.post('/seller/become', {})
      await dispatch(loadCurrentUser())
      navigate('/vendor/dashboard')
    } catch (e) {
      setError(e.message || 'Could not open your store. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 market-dots" aria-hidden="true" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-leaf/15 blur-[100px]" />

        <div className="container-page relative z-10 py-20 md:py-28 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-leaf-dim bg-leaf/10 border border-leaf/20 rounded-full px-3 py-1.5 mb-6">
              <Store size={13} /> Sell on Kora
            </span>

            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Turn what you make
              <br />
              <span className="text-leaf-dim">into what you earn.</span>
            </h1>

            <p className="mt-6 text-lg text-onLight/60 max-w-xl">
              Kora is built for independent makers and small businesses. No listing fees.
              No algorithmic gatekeeping. Just your products in front of buyers looking for them.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" onClick={handleBecome} loading={loading} disabled={loading}>
                {alreadySeller ? 'Go to seller dashboard' : isAuthed ? 'Open my store' : 'Get started'}
                <ArrowRight size={15} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
                Browse as buyer
              </Button>
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 bg-coral/8 border border-coral/25 rounded-2xl p-4 max-w-lg">
                <AlertCircle size={18} className="text-coral mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-coral">Couldn't open store</div>
                  <div className="text-xs text-onLight/60 mt-1">{error}</div>
                </div>
              </div>
            )}

            {!isAuthed && !error && (
              <p className="text-xs text-onLight/45 mt-4">
                You'll be asked to log in or create an account first.
              </p>
            )}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 mt-16">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="bg-white border border-onLight/10 rounded-2xl p-6 flex gap-4"
              >
                <div className="size-11 rounded-xl bg-leaf/10 flex items-center justify-center shrink-0">
                  <p.icon size={19} className="text-leaf-dim" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-sm text-onLight/55 leading-relaxed">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold mb-8">How it works</h2>
            <div className="space-y-5">
              {[
                { n: 1, title: 'Create your account', body: 'One account works for buying and selling.' },
                { n: 2, title: 'Open your store', body: 'Click "Open my store" — takes 2 seconds.' },
                { n: 3, title: 'Add your products', body: 'Upload photos, set prices, choose categories.' },
                { n: 4, title: 'Get your first order', body: 'We notify you instantly. Pack, ship, done.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 items-start">
                  <div className="size-9 rounded-full bg-leaf text-onDark font-display font-semibold text-sm flex items-center justify-center shrink-0">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-onLight/55 mt-0.5">{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}