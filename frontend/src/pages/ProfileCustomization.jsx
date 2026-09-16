import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { LogOut, User, Mail, Phone, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { logoutUser } from '@/features/auth/authSlice'
import { api } from '@/lib/api'

export default function ProfileCustomization() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!isAuthed) { navigate('/login'); return }
    api.get('/auth/me').catch(() => navigate('/login'))
    if (user?.role === 'SELLER') {
      api.get('/seller/dashboard').then(setStats).catch(() => {})
    }
  }, [isAuthed, navigate, user?.role])

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate('/')
  }

  if (!isAuthed) return null

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-5 mb-10">
            <div className="size-20 rounded-full bg-leaf/15 flex items-center justify-center font-display font-semibold text-2xl text-leaf-dim">
              {user?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">{user?.fullName}</h1>
              <div className="text-sm text-onLight/50 mt-0.5">{user?.email}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-leaf-dim mt-1">{user?.role}</div>
            </div>
          </div>

          <div className="bg-white border border-onLight/10 rounded-2xl divide-y divide-onLight/8">
            <Row icon={User} label="Full name" value={user?.fullName} />
            <Row icon={Mail} label="Email" value={user?.email} />
            <Row icon={Phone} label="Phone" value={user?.phone || '—'} />
            <Row
              icon={Shield}
              label="Verification"
              value={user?.emailVerified ? 'Verified' : 'Not verified'}
            />
          </div>

          {stats && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold mb-3">Seller summary</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Revenue" value={`₦${Number(stats.totalRevenue || 0).toLocaleString()}`} />
                <StatBox label="Orders" value={stats.totalOrders} />
                <StatBox label="Products" value={stats.totalProducts} />
                <StatBox label="Rating" value={stats.averageRating ?? '—'} />
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-onLight/10">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut size={15} /> Log out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="size-10 rounded-xl bg-onLight/5 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-onLight/55" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-onLight/45 uppercase tracking-wide">{label}</div>
        <div className="text-sm mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-4">
      <div className="text-xs text-onLight/45">{label}</div>
      <div className="font-display text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}