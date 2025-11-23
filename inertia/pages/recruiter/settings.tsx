// resources/js/pages/recruiter/configuration/company.tsx

import React, { useEffect, useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Building2, CheckCircle } from 'lucide-react'

interface Company {
  id: number
  name: string
  country: string | null
  address: string | null
  description: string | null
  logoUrl?: string
}

interface Props {
  company: Company
}

export default function CompanySettings({ company }: Props) {
  // useForm avec les vraies données → Inertia sait quoi envoyer
  const { data, setData, post, processing, errors } = useForm({
    name: company.name,
    country: company.country || '',
    address: company.address || '',
    description: company.description || '',
    logo: null as File | null,
  })

  const [logoPreview, setLogoPreview] = useState(company.logoUrl || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('country', data.country)
    formData.append('address', data.address)
    formData.append('description', data.description)
    if (data.logo) {
      formData.append('logo', data.logo)
    }

    post('/recruiter/configuration/general', {
      forceFormData: true,
      onSuccess: () => {
        setData((prev) => ({ ...prev, logo: null }))
        setLogoPreview(URL.createObjectURL(data.logo!) || company.logoUrl!)
      },
    })
  }

  return (
    <RecruiterLayout>
      <Head title="Paramètres - Entreprise" />

      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Configuration de l'entreprise
          </h1>
          <p className="text-white/80 mt-2">Mettez à jour les informations de votre entreprise</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'entreprise</label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                  error={errors.name}
                />
              </div>

              {/* Pays + Adresse */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Pays</label>
                  <Input
                    value={data.country}
                    onChange={(e) => setData('country', e.target.value)}
                    placeholder="France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Adresse</label>
                  <Input
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="123 Rue de Paris"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={5}
                  placeholder="Parlez de votre entreprise..."
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium mb-2">Logo de l'entreprise</label>
                {logoPreview && (
                  <div className="mb-4">
                    <img
                      src={logoPreview}
                      alt="Logo actuel"
                      className="h-24 w-24 object-contain rounded-lg border bg-white p-2"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setData('logo', file)
                      setLogoPreview(URL.createObjectURL(file))
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full border border-green-700 bg-green-600 text-white hover:bg-transparent hover:text-green-700"
                disabled={processing}
              >
                {processing ? (
                  <>Enregistrement en cours...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mettre à jour l'entreprise
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  )
}
