import React from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
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
import { Badge } from '~/components/ui/badge'
import { Archive, ArrowLeft, Edit, Save, Trash2, X } from 'lucide-react'
import RichTextEditor from '~/components/rich-text-editor'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

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

const InputError = ({ message }: { message?: string }) => {
  return message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null
}

function SearchableMultiSelect({
  options,
  values,
  onValueChange,
  placeholder = 'Sélectionner...',
  disabled = false,
}: {
  options: { label: string; value: number }[]
  values: number[]
  onValueChange: (vals: number[]) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const toggle = (value: number) => {
    if (disabled) return
    onValueChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  const getLabel = (v: number) => options.find((o) => o.value === v)?.label ?? v

  if (disabled) {
    return (
      <div className="flex flex-wrap gap-2 py-2">
        {values.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          values.map((v) => (
            <span key={v} className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm">
              {getLabel(v)}
            </span>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 border rounded-lg text-left bg-white hover:bg-gray-50 transition flex items-center justify-between"
      >
        <div className="flex flex-wrap gap-2">
          {values.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            values.map((v) => (
              <Badge key={v} variant="secondary" className="pr-1">
                {getLabel(v)}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(v)
                  }}
                />
              </Badge>
            ))
          )}
        </div>
        <span className="text-gray-400 text-xs">Down Arrow</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-64 overflow-auto">
          <input
            className="w-full p-3 border-b text-sm sticky top-0 bg-white"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="p-2">
            {filtered.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="rounded border-gray-300"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const FormSection = ({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => (
  <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
)

export default function JobDetails() {
  const { job, skills, flash } = usePage<PageProps>().props
  const [isEditing, setIsEditing] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

  const { data, setData, put, processing, errors, reset } = useForm({
    title: job.title || '',
    description: job.description || '',
    location: job.location || '',
    onRemote: job.onRemote || 'ON-SITE',
    contractType: job.contractType || 'CDI',
    salaryMin: job.salaryMin ? String(job.salaryMin) : '',
    salaryMax: job.salaryMax ? String(job.salaryMax) : '',
    isUrgent: job.isUrgent,
    skillIds: job.skills.map((s: any) => s.id),
  })

  const skillOptions = skills.map((s: Skill) => ({ label: s.name, value: s.id }))

  const isClosed = !!job.closedAt

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      title: data.title.trim(),
      description: data.description,
      location: data.location || null,
      onRemote: data.onRemote,
      contractType: data.contractType,
      isUrgent: data.isUrgent,
      skillIds: data.skillIds,
    }

    if (data.salaryMin && Number(data.salaryMin) >= 1) {
      payload.salaryMin = Number(data.salaryMin)
    }
    if (data.salaryMax && Number(data.salaryMax) >= 1) {
      payload.salaryMax = Number(data.salaryMax)
    }

    put(`/recruiter/posts/${job.id}`, {
      data: payload,
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => setIsEditing(false),
    })
  }

  const cancelEdit = () => {
    reset()
    setIsEditing(false)
  }

  const closeJob = () => {
    router.post(
      `/recruiter/posts/${job.id}/close`,
      {},
      {
        onSuccess: () => router.visit('/recruiter/posts'),
      }
    )
  }

  const deleteJob = () => {
    router.delete(`/recruiter/posts/${job.id}`, {
      onSuccess: () => router.visit('/recruiter/posts'),
    })
  }

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

  return (
    <RecruiterLayout>
      <Head title={job.title} />

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.visit('/recruiter/posts')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {isEditing ? 'Modifier l’offre' : job.title}
              </h1>
              <div className="flex gap-2 mt-2">
                {job.isUrgent && !isEditing && <Badge variant="destructive">Urgent</Badge>}
                {isClosed && (
                  <Badge variant="secondary" className="bg-gray-600 text-white">
                    Clôturée
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {!isEditing && !isClosed && (
            <div className='flex space-x-4'>
              <Button onClick={closeJob} className="bg-amber-400 text-white hover:bg-amber-700">
                <Archive className="h-4 w-4 mr-2" /> Clôturer
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-400 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Edit className="h-4 w-4 mr-2" /> Modifier
              </Button>
            </div>
          )}

          {isEditing ?? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" /> Annuler
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" /> {processing ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <FormSection title="Informations principales" description="Détails de l'offre d'emploi">
            <div>
              <Label>Titre de l’offre</Label>
              {isEditing ? (
                <>
                  <Input
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="mt-2"
                  />
                  <InputError message={errors.title} />
                </>
              ) : (
                <p className="mt-2 text-lg font-medium">{job.title}</p>
              )}
            </div>

            <div>
              <Label>Description détaillée</Label>
              {isEditing ? (
                <>
                  <div className="mt-2 border rounded-xl overflow-hidden">
                    <RichTextEditor
                      editable
                      value={data.description}
                      onChange={(html) => setData('description', html)}
                    />
                  </div>
                  <InputError message={errors.description} />
                </>
              ) : (
                <div
                  className="mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Lieu de travail</Label>
                {isEditing ? (
                  <>
                    <Input
                      value={data.location || ''}
                      onChange={(e) => setData('location', e.target.value)}
                      className="mt-2"
                    />
                    <InputError message={errors.location} />
                  </>
                ) : (
                  <p className="mt-2">{job.location || 'Non spécifié'}</p>
                )}
              </div>

              <div>
                <Label>Télétravail</Label>
                {isEditing ? (
                  <>
                    <Select
                      value={data.onRemote}
                      onValueChange={(v) => setData('onRemote', v as any)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ON-SITE">Sur site uniquement</SelectItem>
                        <SelectItem value="HYBRID">Hybride</SelectItem>
                        <SelectItem value="REMOTE">100% Remote</SelectItem>
                      </SelectContent>
                    </Select>
                    <InputError message={errors.onRemote} />
                  </>
                ) : (
                  <p className="mt-2">{getOnRemoteLabel(job.onRemote)}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Type de contrat</Label>
              {isEditing ? (
                <>
                  <Select
                    value={data.contractType}
                    onValueChange={(v) => setData('contractType', v as any)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="FREELANCE">Freelance / Mission</SelectItem>
                      <SelectItem value="INTERNSHIP">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={errors.contractType} />
                </>
              ) : (
                <Badge variant="outline" className="mt-2">
                  {getContractLabel(job.contractType)}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salaire minimum </Label>
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      value={data.salaryMin}
                      onChange={(e) => setData('salaryMin', e.target.value)}
                      className="mt-2"
                    />
                    <InputError message={errors.salaryMin} />
                  </>
                ) : (
                  <p className="mt-2">{job.salaryMin ? `${job.salaryMin}` : 'Non communiqué'}</p>
                )}
              </div>
              <div>
                <Label>Salaire maximum </Label>
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      value={data.salaryMax}
                      onChange={(e) => setData('salaryMax', e.target.value)}
                      className="mt-2"
                    />
                    <InputError message={errors.salaryMax} />
                  </>
                ) : (
                  <p className="mt-2">{job.salaryMax ? `${job.salaryMax}` : 'Non communiqué'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEditing ? data.isUrgent : job.isUrgent}
                onChange={(e) => isEditing && setData('isUrgent', e.target.checked)}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              <Label>Offre urgente (mise en avant)</Label>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              {isClosed ? (
                <p className="text-red-600 font-medium">
                  Cette offre est clôturée et ne peut plus être modifiée.
                </p>
              ) : (
                <p>Offre active • Visible par les candidats</p>
              )}
            </div>
          </FormSection>

          <FormSection title="Compétences requises">
            <SearchableMultiSelect
              options={skillOptions}
              values={isEditing ? data.skillIds : job.skills.map((s: Skill) => s.id)}
              onValueChange={(vals) => setData('skillIds', vals)}
              disabled={!isEditing}
            />
            <InputError message={errors.skillIds} />
          </FormSection>

          {isEditing && (
            <div className="flex justify-end gap-4 py-8">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 mr-2" /> Annuler
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </form>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette offre ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L’offre <strong>{job.title}</strong> sera
                définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={deleteJob} className="bg-red-600 hover:bg-red-700">
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RecruiterLayout>
  )
}
