import React, { useState } from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Building2, Users, Lock, CheckCircle } from 'lucide-react'

export default function Settings() {
  const { company, members } = usePage<PageProps>().props

  const [activeTab, setActiveTab] = useState('company')

  const companyForm = useForm({
    name: company?.name || '',
    country: company?.country || '',
    address: company?.address || '',
    description: company?.description || '',
    logo: null as File | null,
  })

  const memberForm = useForm({
    firstname: '',
    lastname: '',
    email: '',
  })

  const passwordForm = useForm({
    password: '',
    password_confirmation: '',
  })

  const steps = [
    { id: 'company', label: 'Entreprise', icon: Building2, completed: !!company },
    { id: 'members', label: 'Équipe', icon: Users, completed: members.length > 1 },
    { id: 'password', label: 'Sécurité', icon: Lock, completed: true },
  ]

  return (
    <RecruiterLayout>
      <Head title="Configuration de votre espace" />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Configuration</h1>
          <p className="text-white/80 mt-2">Finalisez votre espace recruteur en quelques étapes</p>
        </div>

        <div className="flex justify-center items-center gap-8 flex-wrap">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-4 ${step.completed ? 'bg-green-500 border-green-500' : 'border-white/30'}`}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <step.icon className="w-6 h-6 text-white/70" />
                )}
              </div>
              <span className="text-white font-medium hidden sm:block">{step.label}</span>
              {i < steps.length - 1 && <div className="w-24 h-1 bg-white/30" />}
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company">Informations entreprise</TabsTrigger>
            <TabsTrigger value="members">Membres de l'équipe</TabsTrigger>
            <TabsTrigger value="password">Mot de passe</TabsTrigger>
          </TabsList>

          {/* ÉTAPE 1 : Entreprise */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    companyForm.post('/recruiter/configuration/company')
                  }}
                >
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom de l'entreprise</label>
                      <Input {...companyForm} name="name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Localisation (Pays)</label>
                      <Input {...companyForm} name="country" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Adresse</label>
                      <Input {...companyForm} name="address" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea {...companyForm} name="description" rows={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => companyForm.setData('logo', e.target.files?.[0] || null)}
                      />
                    </div>
                    <Button type="submit" className="w-full mt-6">
                      Mettre à jour
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ÉTAPE 2 : Membres */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un collaborateur</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    memberForm.post('/recruiter/configuration/members', {
                      onSuccess: () => memberForm.reset(),
                    })
                  }}
                >
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Prénom</label>
                      <Input {...memberForm} name="firstname" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom</label>
                      <Input {...memberForm} name="lastname" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input type="email" {...memberForm} name="email" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Inviter ce collaborateur
                  </Button>
                </form>

                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Membres actuels ({members.length})</h3>
                  <div className="space-y-3">
                    {members.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {m.firstname[0]}
                              {m.lastname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {m.firstname} {m.lastname}
                            </p>
                            <p className="text-sm text-gray-500">{m.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Recruteur</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ÉTAPE 3 : Mot de passe */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Changer votre mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    passwordForm.put('/recruiter/configuration/password')
                  }}
                >
                  <div className="space-y-4 max-w-md">
                    <Input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      {...passwordForm}
                      name="password"
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      {...passwordForm}
                      name="password_confirmation"
                      required
                    />
                    <Button type="submit" className="w-full">
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  )
}
