import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Package, ShoppingCart, DollarSign, Star, Eye,
  ShieldBan, ShieldCheck, Search, Activity, Truck, AlertCircle,
  ArrowRight, Crown, UserCheck
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'

const ROLE_STYLES = {
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
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

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
      setError(null)
    } catch (e) {
      setError(e.message || 'Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggleSuspend(user) {
    const action = user.emailVerified === undefined ? 'suspend' : 'this user'
    if (!confirm(`Suspend or unsuspend ${user.fullName} (${user.email})?`)) return
    setBusyId(user.id)
    try {
      await api.put('/admin/users/' + user.id + '/suspend', {})
      await load()
    } catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  async function changeRole(user, newRole) {
    if (user.role === newRole) return
    if (!confirm(`Change ${user.fullName}'s role from ${user.role} to ${newRole}?`)) return
    setBusyId(user.id)
    try {
      await api.put('/admin/users/' + user.id + '/role', { role: newRole })
      await load()
    } catch (e) { alert(e.message) }
    finally { setBusyId(null) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-10">
          <div className="h-10 w-64 bg-onLight/5 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-white border border-onLight/10 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-white border border-onLight/10 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-10 max-w-lg">
          <div className="bg-white border border-coral/25 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={20} className="text-coral" />
              <h1 className="font-display text-lg font-semibold">Couldn't load admin data</h1>
            </div>
            <p className="text-sm text-onLight/60">{error}</p>
            <button
              onClick={load}
              className="mt-6 text-sm font-medium bg-ink text-onDark rounded-full px-5 py-2.5 hover:bg-canopy transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-8 md:py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Admin Console</h1>
          <p className="text-sm text-onLight/50 mt-1">Platform oversight and moderation</p>
        </div>

        {/* Quick actions */}
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium bg-canopy text-white rounded-full px-5 py-3 hover:opacity-90 transition-opacity"
        >
          <Truck size={15} /> Manage order fulfillment
          <ArrowRight size={13} className="ml-1" />
        </Link>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          <Stat icon={Users} label="Total users" value={stats?.totalUsers || 0}
                sub={`${stats?.totalCustomers || 0}c / ${stats?.totalSellers || 0}s / ${stats?.totalAdmins || 0}a`}
                tone="leaf" />
          <Stat icon={Package} label="Products" value={stats?.totalProducts || 0}
                sub={`${stats?.activeProducts || 0} active`} tone="canopy" />
          <Stat icon={ShoppingCart} label="Orders" value={stats?.totalOrders || 0}
                sub={`${stats?.pendingOrders || 0}p / ${stats?.deliveredOrders || 0}d`} tone="amber" />
          <Stat icon={DollarSign} label="Revenue"
                value={`NGN ${Number(stats?.totalRevenue || 0).toLocaleString()}`}
                sub={`${stats?.totalReviews || 0} reviews`} tone="emerald" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-onLight/10 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users', badge: stats?.totalUsers },
            { id: 'audit', label: 'Audit log' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors flex items-center gap-2',
                tab === t.id ? 'border-leaf text-leaf-dim' : 'border-transparent text-onLight/45 hover:text-onLight',
              )}
            >
              {t.label}
              {t.badge && (
                <span className="text-[10px] rounded-full px-1.5 min-w-[20px] h-[18px] flex items-center justify-center bg-onLight/5">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-5">
            <Panel title="Recent activity">
              {auditLogs.slice(0, 8).map((a) => (
                <div key={a.id} className="flex justify-between gap-3 py-2.5 border-b border-onLight/5 last:border-0">
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{a.action.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-onLight/45 truncate mt-0.5">{a.actorEmail || 'system'}</div>
                  </div>
                  <div className="text-[10px] text-onLight/35 shrink-0">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-onLight/45">No activity yet.</p>}
            </Panel>

            <Panel title="Platform pulse">
              <PulseRow icon={Users} label="Non-admin users" value={(stats?.totalUsers || 0) - (stats?.totalAdmins || 0)} />
              <PulseRow icon={Eye} label="Product views" value={stats?.totalProductViews || 0} />
              <PulseRow icon={Star} label="Reviews posted" value={stats?.totalReviews || 0} />
              <PulseRow icon={Activity} label="Active products" value={stats?.activeProducts || 0} />
              <PulseRow icon={ShoppingCart} label="Delivered orders" value={stats?.deliveredOrders || 0} />
            </Panel>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-onLight/35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf"
                />
              </div>
              <div className="flex gap-1">
                {['ALL', 'CUSTOMER', 'SELLER', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={cn(
                      'text-xs font-medium rounded-full px-3.5 py-2 transition-colors',
                      roleFilter === r ? 'bg-ink text-onDark' : 'bg-onLight/5 text-onLight/60 hover:bg-onLight/10',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white border border-onLight/10 rounded-2xl py-16 text-center">
                <p className="text-sm text-onLight/45">No users match your filters.</p>
              </div>
            ) : (
              <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/40 uppercase tracking-wide border-b border-onLight/8">
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
                    className={cn(
                      'grid grid-cols-1 md:grid-cols-[1fr_120px_100px_140px] gap-3 md:gap-3 items-center px-5 py-4 border-b border-onLight/5 last:border-0',
                      busyId === u.id && 'opacity-60',
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="size-9 rounded-full bg-leaf/15 flex items-center justify-center font-display font-semibold text-xs text-leaf-dim shrink-0">
                          {(u.fullName || 'U').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate flex items-center gap-1.5">
                            {u.fullName}
                            {u.role === 'ADMIN' && <Crown size={12} className="text-coral" />}
                            {u.role === 'SELLER' && <ShieldCheck size={12} className="text-canopy" />}
                          </div>
                          <div className="text-xs text-onLight/45 truncate">{u.email}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        disabled={u.role === 'ADMIN' || busyId === u.id}
                        className={cn(
                          'text-[10px] font-semibold rounded-full px-2 py-1 border-0 outline-none cursor-pointer w-full md:w-auto',
                          ROLE_STYLES[u.role],
                          u.role === 'ADMIN' && 'cursor-not-allowed',
                        )}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <span className={cn(
                      'text-[10px] font-semibold rounded-full px-2 py-1 text-center w-fit',
                      u.emailVerified ? 'bg-emerald/10 text-emerald' : 'bg-amber/10 text-amber',
                    )}>
                      {u.emailVerified ? 'Verified' : 'Unverified'}
                    </span>

                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleSuspend(u)}
                        disabled={u.role === 'ADMIN' || busyId === u.id}
                        title={u.role === 'ADMIN' ? 'Cannot suspend admins' : 'Suspend / unsuspend'}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          u.role === 'ADMIN'
                            ? 'text-onLight/20 cursor-not-allowed'
                            : 'text-onLight/50 hover:bg-coral/10 hover:text-coral',
                        )}
                      >
                        <ShieldBan size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'audit' && (
          <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
            <div className="hidden md:grid grid-cols-[180px_180px_1fr_140px] gap-3 px-5 py-3 text-[11px] font-medium text-onLight/40 uppercase tracking-wide border-b border-onLight/8">
              <span>Action</span>
              <span>Actor</span>
              <span>Details</span>
              <span>When</span>
            </div>
            {auditLogs.length === 0 ? (
              <div className="text-center py-16 text-sm text-onLight/45">No audit entries yet.</div>
            ) : (
              auditLogs.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-1 md:grid-cols-[180px_180px_1fr_140px] gap-2 md:gap-3 items-center px-5 py-3 border-b border-onLight/5 last:border-0 text-sm"
                >
                  <span className={cn(
                    'font-medium text-xs truncate w-fit rounded-full px-2 py-0.5',
                    a.action.includes('SUSPEND') && 'bg-coral/10 text-coral',
                    a.action.includes('ACTIVAT') && 'bg-emerald/10 text-emerald',
                    a.action.includes('ROLE') && 'bg-amber/10 text-amber',
                    a.action.includes('WELCOME') && 'bg-leaf/10 text-leaf-dim',
                    !a.action.match(/SUSPEND|ACTIVAT|ROLE|WELCOME/) && 'text-onLight/70',
                  )}>
                    {a.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-onLight/50 truncate">{a.actorEmail || 'system'}</span>
                  <span className="text-xs text-onLight/60 truncate">{a.metadata || `${a.targetType} #${a.targetId}`}</span>
                  <span className="text-xs text-onLight/40">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))
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
    <div className="bg-white border border-onLight/10 rounded-2xl p-4 md:p-5">
      <div className={cn('size-9 md:size-10 rounded-xl flex items-center justify-center mb-3', tones[tone])}>
        <Icon size={16} />
      </div>
      <div className="font-display text-xl md:text-2xl font-semibold leading-tight">{value}</div>
      <div className="text-xs text-onLight/45 mt-1">{label}</div>
      {sub && <div className="text-[10px] text-onLight/35 mt-1 truncate">{sub}</div>}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="bg-white border border-onLight/10 rounded-2xl p-5 md:p-6">
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