import React from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { AlertCircle } from 'lucide-react'
import RichTextEditor from '~/components/rich-text-editor'

interface Skill {
  id: number
  name: string
}

interface JobOffer {
  id: number
  title: string
  description: string
  location: string | null
  onRemote: 'ON-SITE' | 'HYBRID' | 'REMOTE'
  contractType: 'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP'
  salaryMin: number | null
  salaryMax: number | null
  isUrgent: boolean
  skills: Skill[]
}

function SearchableMultiSelect({
  options,
  values,
  onValueChange,
  placeholder = 'Sélectionner...',
}: {
  options: { label: string; value: number }[]
  values: number[]
  onValueChange: (vals: number[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = (value: number) => {
    if (values.includes(value)) {
      onValueChange(values.filter((v) => v !== value))
    } else {
      onValueChange([...values, value])
    }
  }

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full p-2 border rounded text-left"
      >
        {values.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {values.map((v) => {
              const opt = options.find((o) => o.value === v)
              return (
                <span
                  key={v}
                  className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
                >
                  {opt?.label ?? v}
                </span>
              )
            })}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-64 overflow-auto p-2">
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            {filtered.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500 p-2">Aucun résultat</div>
            )}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1 border rounded"
              onClick={() => {
                setQuery('')
                onValueChange([])
              }}
            >
              Tout désélectionner
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => setOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const InputError = ({ message }: { message?: string }) => {
  return message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null
}

export default function CreateJobOffer() {
  const { skills, flash } = usePage<PageProps>().props

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    location: '',
    onRemote: 'ON-SITE',
    contractType: 'CDI',
    salaryMin: '',
    salaryMax: '',
    isUrgent: false,
    expireAt: '',
    skillIds: [] as number[],
  })

  const skillOptions = skills.map((s: any) => ({
    label: s.name,
    value: s.id,
  }))

  const getOnRemoteLabel = (value: JobOffer['onRemote']) => {
    return value === 'ON-SITE'
      ? 'Sur site uniquement'
      : value === 'HYBRID'
        ? 'Hybride'
        : value === 'REMOTE'
          ? '100% Remote'
          : 'Non spécifié'
  }

  const getContractLabel = (value: JobOffer['contractType']) => {
    const map = { CDI: 'CDI', CDD: 'CDD', FREELANCE: 'Freelance / Mission', INTERNSHIP: 'Stage' }
    return map[value] || 'Inconnu'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/recruiter/posts')
  }

  return (
    <RecruiterLayout>
      <Head title="Publier une offre" />

      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Publier une nouvelle offre d'emploi</h1>

        {flash?.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {flash.success.message}
          </div>
        )}

        {flash?.errors && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {flash.errors.message || 'Veuillez corriger les erreurs ci-dessous'}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-screen flex flex-col justify-center space-y-8"
        >
          <Card className="w-full md:min-w-2xl max-w-svw">
            <CardHeader>
              <CardTitle>Informations principales</CardTitle>
              <CardDescription>Remplissez les détails de l'offre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Titre de l'offre *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Ex: Développeur Fullstack React/Node.js"
                  className="mt-2"
                />
                <InputError message={errors.title} />
              </div>

              <div>
                <Label>Description détaillée *</Label>
                <div className="mt-2 border rounded-xl overflow-hidden">
                  <RichTextEditor
                    editable
                    value={data.description}
                    onChange={(html) => setData('description', html)}
                  />
                </div>
                <InputError message={errors.description} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Lieu de travail</Label>
                  <Input
                    id="location"
                    value={data.location}
                    onChange={(e) => setData('location', e.target.value)}
                    placeholder="Paris, France ou Remote"
                    className="mt-2"
                  />
                  <InputError message={errors.location} />
                </div>

                <div>
                  <Label>Télétravail</Label>
                  <Select value={data.onRemote} onValueChange={(v) => setData('onRemote', v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON-SITE">Sur site uniquement</SelectItem>
                      <SelectItem value="HYBRID">Hybride</SelectItem>
                      <SelectItem value="REMOTE">100% Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.onRemote} />
                </div>
              </div>

              <div>
                <Label>Type de contrat *</Label>
                <Select value={data.contractType} onValueChange={(v) => setData('contractType', v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Sélectionner le type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="FREELANCE">Freelance / Mission</SelectItem>
                    <SelectItem value="INTERNSHIP">Stage</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.contractType} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Salaire minimum (optionnel)</Label>
                  <Input
                    type="number"
                    value={data.salaryMin}
                    onChange={(e) => setData('salaryMin', e.target.value)}
                    placeholder="40000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Salaire maximum (optionnel)</Label>
                  <Input
                    type="number"
                    value={data.salaryMax}
                    onChange={(e) => setData('salaryMax', e.target.value)}
                    placeholder="60000"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={data.isUrgent}
                  onChange={(e) => setData('isUrgent', e.target.checked)}
                />

                <Label htmlFor="urgent" className="cursor-pointer">
                  Offre urgente (mise en avant)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compétences requises</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchableMultiSelect
                options={skillOptions}
                values={data.skillIds}
                onValueChange={(vals) => setData('skillIds', vals)}
                placeholder="Recherchez et ajoutez des compétences..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => history.back()}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="border border-green-600 bg-green-600 text-white hover:bg-transparent hover:text-green-600"
            >
              {processing ? 'Publication...' : 'Publier l’offre'}
            </Button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  )
}
