import { api } from '@/lib/api'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '')

export async function getKycStatus() {
  return api.get('/seller/kyc/status')
}

export async function listBanks() {
  return api.get('/seller/kyc/banks')
}

export async function resolveAccount(accountNumber, bankCode) {
  return api.post('/seller/kyc/resolve-account', { accountNumber, bankCode })
}

export async function submitKyc(payload) {
  return api.post('/seller/kyc/submit', payload)
}

/**
 * Uploads an image file (ID doc, selfie) via the existing product-image
 * endpoint and returns the served URL path (/uploads/xxx.jpg).
 */
export async function uploadKycImage(file) {
  const fd = new FormData()
  fd.append('file', file)
  const token = localStorage.getItem('kora_access_token')
  const res = await fetch(API_BASE + '/api/uploads/product-image', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: fd,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || body.message || 'Upload failed')
  }
  const data = await res.json()
  return data.url
}