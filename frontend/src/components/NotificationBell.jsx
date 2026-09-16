import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { useSelector } from 'react-redux'

export default function NotificationBell() {
  const isAuthed = useSelector((s) => s.auth.isAuthenticated)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)
  const navigate = useNavigate()

  async function load() {
    if (!isAuthed) return
    try {
      const [list, count] = await Promise.all([
        api.get('/notifications?size=8'),
        api.get('/notifications/unread-count'),
      ])
      setItems(list.content || [])
      setUnread(count.unread || 0)
    } catch {}
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [isAuthed])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!isAuthed) return null

  async function markRead(id) {
    try {
      await api.put(`/notifications/${id}/read`, {})
      setItems((arr) => arr.map((n) => n.id === id ? { ...n, read: true } : n))
      setUnread((u) => Math.max(0, u - 1))
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-full hover:bg-onLight/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={19} className="text-onLight/70" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-coral text-white text-[10px] leading-none min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-semibold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-white border border-onLight/10 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-onLight/8 flex items-center justify-between">
              <span className="font-display font-semibold text-sm">Notifications</span>
              {unread > 0 && <span className="text-xs text-leaf-dim">{unread} new</span>}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-12 text-sm text-onLight/45">All caught up.</div>
              ) : items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markRead(n.id)
                    if (n.link) navigate(n.link)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-onLight/[0.03] border-b border-onLight/5 last:border-0 transition-colors ${!n.read ? 'bg-leaf/[0.04]' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && <span className="size-2 rounded-full bg-leaf mt-1.5 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-xs text-onLight/55 mt-0.5 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-onLight/35 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}