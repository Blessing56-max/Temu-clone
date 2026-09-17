const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const ACCESS_KEY = 'kora_access_token'
const REFRESH_KEY = 'kora_refresh_token'

let accessToken = localStorage.getItem(ACCESS_KEY)
let refreshToken = localStorage.getItem(REFRESH_KEY)

export function setTokens(data) {
  if (!data) return
  accessToken = data.accessToken
  refreshToken = data.refreshToken
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function getAccessToken() {
  return accessToken
}

async function tryRefresh() {
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    setTokens(await res.json())
    return true
  } catch { return false }
}

export async function apiFetch(path, options = {}, retry = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401 && retry && refreshToken) {
    if (await tryRefresh()) return apiFetch(path, options, false)
    clearTokens()
  }

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail || body.message || body.title || detail
    } catch {}
    throw new Error(detail)
  }

  if (res.status === 204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const api = {
  get: (p) => apiFetch(p),
  post: (p, b) => apiFetch(p, { method: 'POST', body: JSON.stringify(b || {}) }),
  put: (p, b) => apiFetch(p, { method: 'PUT', body: JSON.stringify(b || {}) }),
  delete: (p) => apiFetch(p, { method: 'DELETE' }),
}

// Resolve an image URL. Handles:
// - Full http(s) URLs → passed through
// - /uploads/xxx.jpg from our backend → prepend backend host
// - Cloudinary public IDs → build Cloudinary URL
const API_ORIGIN = API_URL.replace(/\/api$/, '')

export function resolveImageUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return API_ORIGIN + url
  return `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600/${url}`
}