import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, ArrowRight, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import ProductThumb from '@/components/ProductThumb'
import { cn } from '@/lib/utils'

/**
 * Reusable search box with:
 * - Live autocomplete (300ms debounce)
 * - Voice search via Web Speech API (falls back silently if unsupported)
 * - Keyboard navigation (ArrowUp/Down, Enter, Escape)
 * - Screen-reader friendly (role="combobox", aria-controls, aria-expanded)
 */
export default function SearchDropdown({
  className,
  placeholder = 'Search products, brands and categories...',
  autoFocus = false,
  onNavigate,
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)

  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Detect Web Speech API support once on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setVoiceSupported(!!SR)
  }, [])

  // Debounced fetch on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const id = setTimeout(async () => {
      try {
        const results = await api.get('/products/suggest?q=' + encodeURIComponent(query.trim()) + '&limit=6')
        setSuggestions(Array.isArray(results) ? results : [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(path) {
    setOpen(false)
    setQuery('')
    setCursor(-1)
    onNavigate?.()
    navigate(path)
  }

  function submitSearch(q) {
    if (!q.trim()) return
    go('/products?q=' + encodeURIComponent(q.trim()))
  }

  function handleKey(e) {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') submitSearch(query)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, suggestions.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor >= 0 && cursor < suggestions.length) {
        go('/products/' + suggestions[cursor].id)
      } else {
        submitSearch(query)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setCursor(-1)
      inputRef.current?.blur()
    }
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-NG'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript
      setQuery(text)
      setOpen(true)
      inputRef.current?.focus()
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(-1) }}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true) }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="w-full h-11 pl-5 pr-20 rounded-full bg-white dark:bg-onLight/[0.04] border-2 border-onLight/15 dark:border-onLight/8 text-sm text-onLight dark:text-onDark outline-none focus:border-leaf focus:ring-2 focus:ring-leaf/20 transition-all"
        />

        {/* Voice button */}
        {voiceSupported && (
          <button
            type="button"
            onClick={listening ? stopVoice : startVoice}
            aria-label={listening ? 'Stop voice search' : 'Search by voice'}
            title={listening ? 'Stop' : 'Search by voice'}
            className={cn(
              'absolute right-12 top-1/2 -translate-y-1/2 size-9 rounded-full flex items-center justify-center transition-colors',
              listening ? 'bg-coral text-white animate-pulse' : 'text-onLight/65 hover:bg-onLight/10',
            )}
          >
            <Mic size={16} />
          </button>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={() => submitSearch(query)}
          aria-label="Search"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-9 rounded-full bg-leaf text-onDark hover:bg-leaf-dim transition-colors flex items-center justify-center"
        >
          <Search size={16} strokeWidth={2.5} />
        </button>
      </div>

      <AnimatePresence>
        {open && (query.trim().length >= 2) && (
          <motion.div
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-onLight/10 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {loading && suggestions.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-onLight/65">
                <Loader2 size={14} className="animate-spin" /> Searching...
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="px-4 py-4 text-sm text-onLight/65">
                No matches for "{query}"
              </div>
            )}

            {suggestions.map((p, i) => (
              <button
                key={p.id}
                role="option"
                aria-selected={cursor === i}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go('/products/' + p.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  cursor === i ? 'bg-leaf/8' : 'hover:bg-onLight/[0.03]',
                )}
              >
                <div className="size-10 rounded-lg overflow-hidden bg-paper shrink-0">
                  <ProductThumb product={p} iconSize={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-onLight/60 truncate">
                    {p.categoryName || p.sellerName}
                  </div>
                </div>
                <div className="text-sm font-semibold text-leaf-dim shrink-0">
                  ₦{Number(p.discountPrice || p.price).toLocaleString()}
                </div>
              </button>
            ))}

            {suggestions.length > 0 && (
              <button
                role="option"
                aria-selected={cursor === suggestions.length}
                onMouseEnter={() => setCursor(suggestions.length)}
                onClick={() => submitSearch(query)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 border-t border-onLight/8 text-sm font-medium text-leaf-dim transition-colors',
                  cursor === suggestions.length ? 'bg-leaf/8' : 'hover:bg-leaf/5',
                )}
              >
                <span>See all results for "{query}"</span>
                <ArrowRight size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}