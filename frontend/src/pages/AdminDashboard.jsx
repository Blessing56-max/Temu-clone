import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Package, ShoppingCart, DollarSign, Star, Eye,
  ShieldBan, ShieldCheck, Crown, Search, Activity
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_COLORS = {
  CUSTOMER: 'bg-leaf/10 text-leaf-dim',
  SELLER: 'bg-canopy/12 text-canopy',
  ADMIN: 'bg-coral/12 text-coral',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [s, u, a] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?size=100'),
        api.get('/admin/audit-logs?size=50'),
      ])
      setStats(s)
      setUsers(u.content || [])
      setAuditLogs(a.content || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function toggleSuspend(userId) {
    try { await api.put(`/admin/users/${userId}/suspend`, {}); await load() }
    catch (e) { alert(e.message) }
  }

  async function changeRole(userId, role) {
    try { await api.put(`/admin/users/${userId}/role`, { role }); await load() }
    catch (e) { alert(e.message) }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Loading admin data...</div>
      </div>
    )
  }

  const filteredUsers = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold">Admin Console</h1>
          <p className="text-sm text-onLight/50 mt-1">Platform oversight and moderation</p>
        </div>

        {/* Stat grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Stat icon={Users} label="Total users" value={stats.totalUsers} sub={`${stats.totalCustomers} customers · ${stats.totalSellers} sellers`} tone="leaf" />
          <Stat icon={Package} label="Products" value={stats.totalProducts} sub={`${stats.activeProducts} active`} tone="canopy" />
          <Stat icon={ShoppingCart} label="Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending · ${stats.deliveredOrders} delivered`} tone="amber" />
          <Stat icon={DollarSign} label="Platform revenue" value={`₦${Number(stats.totalRevenue).toLocaleString()}`} sub={`${stats.totalReviews} reviews`} tone="emerald" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-onLight/10 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users' },
            { id: 'audit', label: 'Audit log' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id ? 'border-leaf text-leaf-dim' : 'border-transparent text-onLight/45',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="Recent audit activity">
              {auditLogs.slice(0, 8).map((a) => (
                <div key={a.id} className="flex justify-between text-sm py-2 border-b border-onLight/5 last:border-0">
                  <div className="min-w-0">
                    <div className="font-medium text-xs">{a.action.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-onLight/45 truncate">{a.actorEmail}</div>
                  </div>
                  <div className="text-[11px] text-onLight/35 shrink-0">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-onLight/45">No activity yet.</p>}
            </Panel>

            <Panel title="Platform pulse">
              <PulseRow icon={Users} label="Active users" value={stats.totalUsers - stats.totalAdmins} />
              <PulseRow icon={Eye} label="Product views" value={stats.totalProductViews} />
              <PulseRow icon={Star} label="Reviews" value={stats.totalReviews} />
              <PulseRow icon={Activity} label="Delivered orders" value={stats.deliveredOrders} />
            </Panel>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="relative mb-4 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-onLight/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf"
              />
            </div>
            <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_80px_90px_120px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/40 uppercase tracking-wide border-b border-onLight/8">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredUsers.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-[1fr_80px_90px_120px] gap-3 items-center px-5 py-3 border-b border-onLight/5 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.fullName}</div>
                    <div className="text-xs text-onLight/45 truncate">{u.email}</div>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.role === 'ADMIN'}
                    className={cn(
                      'text-[10px] font-semibold rounded-full px-2 py-1 border-0 outline-none cursor-pointer',
                      STATUS_COLORS[u.role],
                      u.role === 'ADMIN' && 'cursor-not-allowed',
                    )}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <span className={cn(
                    'text-[10px] font-semibold rounded-full px-2 py-1 text-center',
                    u.emailVerified ? 'bg-emerald/10 text-emerald' : 'bg-amber/10 text-amber',
                  )}>
                    {u.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => toggleSuspend(u.id)}
                      disabled={u.role === 'ADMIN'}
                      title={u.role === 'ADMIN' ? 'Cannot suspend admins' : 'Toggle status'}
                      className={cn(
                        'p-1.5 rounded-lg transition-colors',
                        u.role === 'ADMIN'
                          ? 'text-onLight/20 cursor-not-allowed'
                          : 'text-onLight/50 hover:bg-onLight/5 hover:text-leaf',
                      )}
                    >
                      <ShieldBan size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[180px_160px_1fr_130px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/40 uppercase tracking-wide border-b border-onLight/8">
              <span>Action</span>
              <span>Actor</span>
              <span>Details</span>
              <span>When</span>
            </div>
            {auditLogs.map((a) => (
              <div key={a.id} className="grid grid-cols-[180px_160px_1fr_130px] gap-3 items-center px-5 py-3 border-b border-onLight/5 last:border-0 text-sm">
                <span className="font-medium text-xs truncate">{a.action.replace(/_/g, ' ')}</span>
                <span className="text-xs text-onLight/50 truncate">{a.actorEmail || 'system'}</span>
                <span className="text-xs text-onLight/60 truncate">{a.metadata || `${a.targetType} #${a.targetId}`}</span>
                <span className="text-xs text-onLight/40">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-center py-12 text-sm text-onLight/45">No audit entries yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, sub, tone = 'leaf' }) {
  const tones = {
    leaf: 'bg-leaf/10 text-leaf-dim',
    canopy: 'bg-canopy/10 text-canopy',
    amber: 'bg-amber/10 text-amber',
    emerald: 'bg-emerald/10 text-emerald',
  }
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-5">
      <div className={cn('size-10 rounded-xl flex items-center justify-center mb-3', tones[tone])}>
        <Icon size={17} />
      </div>
      <div className="text-2xl font-display font-semibold">{value}</div>
      <div className="text-xs text-onLight/45 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-onLight/35 mt-1">{sub}</div>}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-6">
      <h3 className="font-display text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PulseRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-onLight/5 last:border-0">
      <div className="flex items-center gap-3">
        <Icon size={15} className="text-onLight/40" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-display font-semibold">{value}</span>
    </div>
  )
}