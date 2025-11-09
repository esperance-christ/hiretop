import { Head, router } from '@inertiajs/react'
import { Mail, RefreshCcw } from 'lucide-react'
import Header from '~/components/header'
import { Button } from '~/components/ui/button'
import AuthLayout from '~/layouts/auth_layout'

export default function Success() {
  const handleResend = () => {
    router.post('/auth/resend-verification')
  }

  return (
    <AuthLayout>
      <Head title="Vérifiez votre email" />
      <Header />
      <div className="max-w-md mx-auto text-center py-12">
        <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h1>
        <p className="text-gray-600 mt-2">
          Nous vous avons envoyé un email de vérification. Cliquez sur le lien pour activer votre
          compte.
        </p>
        <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
          Pas reçu ?{' '}
          <Button variant="link" onClick={handleResend} className="flex items-center gap-1">
            <RefreshCcw className="w-4 h-4" />
            Renvoyer
          </Button>
        </p>
      </div>
    </AuthLayout>
  )
}
