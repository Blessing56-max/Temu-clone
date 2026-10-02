import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Store, TrendingUp, Truck, ShieldCheck, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'

const PERKS = [
  { icon: Store, title: 'Your own storefront', body: 'A dedicated page for your products with your branding.' },
  { icon: TrendingUp, title: 'Real-time analytics', body: 'See views, sales, revenue, and top-performing products.' },
  { icon: Truck, title: 'Order management', body: 'Pack and ship with a click. Buyers see live tracking.' },
  { icon: ShieldCheck, title: 'Verified sellers only', body: 'Every seller is ID-checked. Trust works both ways.' },
]

export default function BecomeSellerPage() {
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const alreadySeller = user?.role === 'SELLER'
  const isBuyer = isAuthed && user?.role === 'CUSTOMER'

  function handleBecome() {
    if (alreadySeller) {
      // Already a seller — go to KYC or dashboard depending on status
      navigate(user.kycStatus === 'VERIFIED' ? '/vendor/dashboard' : '/vendor/kyc')
      return
    }
    // Buyer OR logged out — one account = one role. Must register a separate seller account.
    navigate('/register?role=SELLER')
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
              Turn what you make<br />
              <span className="text-leaf-dim">into what you earn.</span>
            </h1>

            <p className="mt-6 text-lg text-onLight/60 max-w-xl">
              Kora is built for independent makers and small businesses. One account = one role.
              Register a seller account, verify your identity, and start listing.
            </p>

            {isBuyer && (
              <div className="mt-6 bg-amber/10 border border-amber/25 rounded-2xl p-4 max-w-lg">
                <div className="text-sm font-medium text-amber">You're signed in as a buyer</div>
                <div className="text-xs text-onLight/65 mt-1">
                  Buyer and seller roles are separate on Kora. Click below to register a seller account.
                </div>
              </div>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" onClick={handleBecome}>
                {alreadySeller ? (user.kycStatus === 'VERIFIED' ? 'Go to dashboard' : 'Continue KYC') : 'Become a seller'}
                <ArrowRight size={15} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
                Browse as buyer
              </Button>
            </div>

            {!isAuthed && (
              <p className="text-xs text-onLight/60 mt-4">
                You'll create a fresh seller account. Existing buyer accounts can't be upgraded.
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
        </div>
      </section>
      <Footer />
    </div>
  )
}