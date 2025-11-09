// resources/js/Pages/Profile/Complete.tsx
import { Head, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { Progress } from '~/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { CheckCircle2, Circle } from 'lucide-react'

interface PageProps {
  talent: any
  completion: number
  errors: Record<string, string>
  [key: string]: any
}

export default function CompleteProfile() {
  const { user: talent, completion: initialCompletion, errors } = usePage<PageProps>().props
  const [step, setStep] = useState(1)
  const [completion, setCompletion] = useState(initialCompletion)

  const steps = [
    { id: 1, name: 'Informations' },
    { id: 2, name: 'Compétences' },
    { id: 3, name: 'Éducation' },
    { id: 4, name: 'Expériences' },
  ]

  console.log(usePage().props)

  const [formData, setFormData] = useState({
    firstname:  talent.firstname || '',
    lastname:  talent.lastname || '',
    cv: null as File | null,
  })

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
      setCompletion((prev) => Math.min(prev + 25, 100))
    } else {
      submit()
    }
  }

  const submit = () => {
    const data = new FormData()
    data.append('firstname', formData.firstname)
    data.append('lastname', formData.lastname)
    if (formData.cv) data.append('cv', formData.cv)

    router.put('profile.complete.update', data, {
      forceFormData: true,
      // onSuccess: () => {
      //   router.visit('jobs.index')
      // },
      // onError: (err) => {
      //   console.error('Erreurs de validation:', err)
      // },
    })
  }

  const skip = () => {
    router.get('/dashboard')
  }

  return (
    <>
      <Head title="Complétez votre profil" />
      <div className="min-h-screen bg-linear-to-br from-yellow-50 to-blue-50 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Avatar className="w-28 h-28 mx-auto mb-4 ring-4 ring-blue-100">
              <AvatarImage src={talent?.profile || '/avatar-placeholder.jpg'} />
              <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                {completion}%
              </AvatarFallback>
            </Avatar>
            <Progress value={completion} className="w-48 mx-auto mb-4 h-3" />
            <h1 className="text-3xl font-bold text-gray-900">Complétez votre profil</h1>
            <p className="text-gray-600 mt-2">Plus votre profil est complet, plus vous avez de chances !</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step >= s.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      s.id
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{s.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > s.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="phone">Nom</Label>
                  <Input
                    id="firstname"
                    type="tel"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  />
                  {errors?.firstname && <p className="text-red-600 text-sm mt-1">{errors?.firstname}</p>}
                </div>

                <div>
                  <Label htmlFor="bio">Prenom</Label>
                  <Textarea
                    id="lastname"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    placeholder="Parlez de vous, vos passions, vos objectifs..."
                    className="resize-none h-32"
                  />
                  {errors?.lastname && <p className="text-red-600 text-sm mt-1">{errors?.lastname}</p>}
                </div>

                <div>
                  <Label htmlFor="cv">Ajoutez votre CV</Label>
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFormData({ ...formData, cv: e.target.files?.[0] || null })}
                  />
                  {/* {talent.cv_url && (
                    <a href={talent.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                      Voir le CV actuel
                    </a>
                  )} */}
                </div>
              </div>
            )}

            {[2, 3, 4].includes(step) && (
              <div>
                <Label>{steps[step - 1].name}</Label>
                <p className="text-sm text-gray-600 mb-4">
                  {step === 2 && 'Ajoutez vos compétences techniques'}
                  {step === 3 && 'Ajoutez vos diplômes'}
                  {step === 4 && 'Ajoutez vos expériences professionnelles'}
                </p>
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription>
                    Cette fonctionnalité sera disponible prochainement.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={skip}>
                Sauter
              </Button>
              <Button type="submit">
                {step < 4 ? 'Suivant' : 'Terminer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
