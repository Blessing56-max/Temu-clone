export function getPostAuthRedirect(user) {
  if (!user) return '/login'
  if (user.role === 'ADMIN') return '/admin'
  if (user.role === 'SELLER') return '/vendor/dashboard'
  return '/customer/dashboard'
}