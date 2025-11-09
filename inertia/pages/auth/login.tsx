import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import AuthLayout from '~/layouts/auth_layout'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '~/components/logo'

const loginSchema = z.object({
  email: z
    .string()
    .email('Cet email est invalide, veuillez entrez un email valide (ex: example@hiretop.com)'),
  password: z.string().min(8, 'Le mot de passe doit contenir au minimum 8 caractères'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const { appName, flash } = usePage<any>().props
  const [showPassword, setShowPassword] = useState(false)
  const placeholderImageUrl = 'https://placehold.co/1200x675/f0f4f8/999?text=Image+Indisponible'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    router.post('/auth/login', data)
  }

  return (
    <>
      <Head title={`Connexion à votre compte ${appName}`} />
      <AuthLayout>
        <div className="grid h-full w-full lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-linear-to-b from-[#f9f9f9] to-[#fff8e6] rounded-l-4xl">
            <Link href="/">
              <Logo className="text-black" />
            </Link>{' '}
            <div className="flex flex-col items-center px-4 lg:px-12">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bonjour !</h1>
                <p className="text-sm text-gray-600">
                  Connectez-vous à votre compte {appName} avec votre email et mot de passe.
                </p>
              </div>

              <>
                {flash?.auth?.type === 'error' && (
                  <div className="bg-red-200 border-2 border-b-red-500 rounded-xl p-2">
                    <p className="mb-3 text-sm text-red-500">{flash.auth.message}</p>
                  </div>
                )}
                {flash?.auth?.type === 'success' && (
                  <div className="bg-green-200 border-2 border-green-500 rounded-xl p-2">
                    <p className="mb-3 text-sm text-green-600">{flash.auth.message}</p>
                  </div>
                )}
              </>

              <form
                method="POST"
                action="auth/login"
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-sm space-y-4"
              >
                {/* Champ Email */}
                <div>
                  <Label htmlFor="email" className="text-xs text-gray-500 pl-1">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@hiretop.com"
                    className="h-12 rounded-full bg-white px-5 text-base shadow-sm focus:ring-2 focus:ring-yellow-300"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Champ Mot de passe avec toggle */}
                <div>
                  <Label htmlFor="password" className="text-xs text-gray-500 pl-1">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="***********"
                      className="h-12 rounded-full bg-white px-5 pr-12 text-base shadow-sm focus:ring-2 focus:ring-yellow-300"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                      }
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-yellow-400 font-medium hover:bg-yellow-500 transition-colors"
                >
                  {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-11 rounded-full text-sm">
                    <FaGithub className="mr-1.5" /> GitHub
                  </Button>
                  <Button variant="outline" className="flex-1 h-11 rounded-full text-sm">
                    <FaGoogle className="mr-1.5" /> Google
                  </Button>
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-2 text-center text-xs text-gray-500 lg:flex-row lg:justify-between">
              <span>
                Pas de compte ?{' '}
                <Link
                  href="/auth/register-talent"
                  className="font-medium text-gray-700 underline hover:text-yellow-600"
                >
                  S’inscrire
                </Link>
              </span>
              <Link href="/terms" className="font-medium text-gray-700 underline">
                Termes & Conditions
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-3 relative">
            <div className="h-full inset-0 rounded-4xl p-4 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
                alt="Team collaboration"
                className="inset-0 h-full w-full object-cover"
                // Ajout d'un fallback en cas d'erreur de chargement de l'image
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.onerror = null
                  target.src = placeholderImageUrl
                }}
              />

              <div className="absolute inset-0 p-8 pointer-events-none">
                {/* ... (éléments visuels superposés : bouton, bulles d'info) ... */}
                <button className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 shadow-lg backdrop-blur-sm">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="absolute bottom-60 left-20 w-64 rounded-3xl bg-white/20 p-5 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-lg font-medium text-gray-800">{appName}</span>
                    <span className="w-2 h-2 block rounded-full bg-amber-400"></span>
                  </div>
                  <div className="text-sm text-white">
                    Les bonnes opportunite pour les bonnes personnes
                  </div>
                  <br />
                </div>

                <div className="absolute bottom-16 left-8 w-60 rounded-3xl bg-white p-5 shadow-xl">
                  <div className="flex flex-row justify-between items-center border-b mb-2 pb-2 text-xs text-gray-800">
                    <span>Geraldo</span>
                    <span className="w-2 h-2 block rounded-full bg-amber-400"></span>
                  </div>
                  <div className="mb-3 text-xs text-gray-800">
                    En tant que designer, l'imagination est au centre de tout. Grace a
                    <strong>{appName}</strong> j'ai pu integrer une entreprise ou j'exprime
                    librement ma passion
                  </div>
                  <div className="flex -space-x-2">
                    {['44', '32', '68'].map((id) => (
                      <img
                        key={id}
                        src={`https://randomuser.me/api/portraits/women/${id}.jpg`}
                        alt="Attendee"
                        className="h-10 w-10 rounded-full border-2 border-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = `https://placehold.co/40x40/ccc/fff?text=U${id}`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}
