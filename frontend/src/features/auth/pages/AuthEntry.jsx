import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import AuthLayout from '@/features/auth/AuthLayout'

export default function AuthEntry() {
  const navigate = useNavigate()
  return (
    <AuthLayout className="text-center">
      <h1 className="font-display text-4xl font-semibold mb-3">Welcome to Kora</h1>
      <p className="text-onLight/60 mb-10">
        One account — whether you're here to shop or to sell.
      </p>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={() => navigate('/register')} className="w-full">
          Create an account
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full">
          Log in
        </Button>
      </div>
    </AuthLayout>
  )
}