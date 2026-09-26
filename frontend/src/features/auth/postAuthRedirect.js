const SEEN_QUIZ_KEY = 'kora_seen_onboarding_quiz'

export function getPostAuthRedirect(user) {
  if (!user) return '/login'
  if (user.role === 'ADMIN') return '/admin'

  if (user.role === 'SELLER') {
    if (user.kycStatus !== 'VERIFIED' && user.kycStatus !== 'PENDING') return '/vendor/kyc'
    return '/vendor/dashboard'
  }

  // First-time buyers get the interests quiz once
  const seen = localStorage.getItem(SEEN_QUIZ_KEY + '_' + user.id)
  if (!seen) {
    localStorage.setItem(SEEN_QUIZ_KEY + '_' + user.id, '1')
    return '/onboarding/quiz'
  }

  return '/customer/dashboard'
}