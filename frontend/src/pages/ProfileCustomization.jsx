import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { LogOut, User, Mail, Phone, Shield, Edit3, Check, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { logoutUser, loadCurrentUser } from '@/features/auth/authSlice'
import { api } from '@/lib/api'

export default function ProfileCustomization() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const [changingPw, setChangingPw] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!isAuthed) { navigate('/login'); return }
    if (user) setForm({ fullName: user.fullName || '', phone: user.phone || '' })
  }, [isAuthed, navigate, user])

  async function saveProfile() {
    setSaving(true)
    try {
      await api.put('/auth/me', form)
      await dispatch(loadCurrentUser())
      setEditing(false)
      setMsg('Profile updated')
      setTimeout(() => setMsg(null), 2000)
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  async function changePassword() {
    setPwSaving(true)
    try {
      await api.post('/auth/change-password', pwForm)
      setPwForm({ currentPassword: '', newPassword: '' })
      setChangingPw(false)
      setMsg('Password changed. Please log in again.')
      setTimeout(() => {
        dispatch(logoutUser())
        navigate('/login')
      }, 1500)
    } catch (e) { setMsg(e.message) }
    finally { setPwSaving(false) }
  }

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
            <div className="flex-1">
              <h1 className="font-display text-2xl font-semibold">{user?.fullName}</h1>
              <div className="text-sm text-onLight/50 mt-0.5">{user?.email}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-leaf-dim mt-1">{user?.role}</div>
            </div>
          </div>

          {msg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 text-sm px-4 py-3 rounded-xl ${msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('failed') ? 'bg-coral/10 text-coral border border-coral/20' : 'bg-leaf/10 text-leaf-dim border border-leaf/20'}`}
            >
              {msg}
            </motion.div>
          )}

          <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-onLight/8">
              <span className="font-display text-sm font-semibold">Profile</span>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-leaf-dim flex items-center gap-1 hover:underline">
                  <Edit3 size={12} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(false); setForm({ fullName: user.fullName, phone: user.phone || '' }) }} className="text-xs text-onLight/50 flex items-center gap-1">
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={saveProfile} disabled={saving} className="text-xs font-medium text-leaf-dim flex items-center gap-1">
                    <Check size={12} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="divide-y divide-onLight/8">
              {editing ? (
                <>
                  <div className="p-5">
                    <Field label="Full name"><Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} /></Field>
                  </div>
                  <div className="p-5">
                    <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" /></Field>
                  </div>
                </>
              ) : (
                <>
                  <Row icon={User} label="Full name" value={user?.fullName} />
                  <Row icon={Mail} label="Email" value={user?.email} />
                  <Row icon={Phone} label="Phone" value={user?.phone || '—'} />
                </>
              )}
              <Row icon={Shield} label="Verification" value={user?.emailVerified ? 'Verified' : 'Not verified'} />
            </div>
          </div>

          {/* Password */}
          <div className="bg-white border border-onLight/10 rounded-2xl overflow-hidden mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-onLight/8">
              <span className="font-display text-sm font-semibold">Password</span>
              {!changingPw ? (
                <button onClick={() => setChangingPw(true)} className="text-xs font-medium text-leaf-dim flex items-center gap-1 hover:underline">
                  <Edit3 size={12} /> Change
                </button>
              ) : (
                <button onClick={() => setChangingPw(false)} className="text-xs text-onLight/50 flex items-center gap-1">
                  <X size={12} /> Cancel
                </button>
              )}
            </div>
            {changingPw && (
              <div className="p-5 space-y-4">
                <Field label="Current password">
                  <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
                </Field>
                <Field label="New password" hint="At least 8 characters">
                  <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} minLength={8} />
                </Field>
                <Button onClick={changePassword} loading={pwSaving} disabled={pwSaving}>
                  Update password
                </Button>
              </div>
            )}
          </div>

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