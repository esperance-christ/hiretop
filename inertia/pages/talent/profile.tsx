import React, { useRef, useState, useMemo } from 'react'
import { usePage, router, useForm, Head } from '@inertiajs/react'
import MainLayout from '~/layouts/main_layout'
import { Card, CardContent, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { z } from 'zod'
import { User as UserIcon } from 'lucide-react'

// Composant multi-select
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
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
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

// Validation zod
const generalSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
})

const talentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  bio: z.string().min(1, 'La bio est requise'),
  phone: z.string().min(8, 'Numéro invalide'),
  location: z.string().min(1, 'La localisation est requise'),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  skills: z.array(z.number()),
})

const TalentProfile = () => {
  const {
    user,
    skills,
    talentProfile,
    talentSkills,
    talentEducation,
    talentExperience,
    profileCompletion,
  } = usePage<PageProps>().props
  const completionPercent = profileCompletion || 0

  const avatarRef = useRef<HTMLInputElement | null>(null)
  const cvRef = useRef<HTMLInputElement | null>(null)
  const skillsList = Array.isArray(skills) ? skills : []

  const safeDate = (value: any) => {
    if (!value) return ''
    const d = new Date(value)
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }

  const validSkillIds =
    talentSkills
      ?.map((s: any) => s.skillId)
      ?.filter((id: number) => skillsList.some((skill: any) => skill.id === id)) || []

  const [skillsSelected, setSkillsSelected] = useState<number[]>(validSkillIds) || []

  console.log(talentSkills)

  const [experiences, setExperiences] = useState(
    talentExperience?.map((e: any) => ({
      id: e.id,
      title: e.jobTitle,
      company: e.companyName,
      startDate: safeDate(e.startAt),
      endDate: safeDate(e.endAt),
      location: e.location,
      current: e.current || false,
      description: e.description || '',
    })) || []
  )

  const [educations, setEducations] = useState(
    talentEducation?.map((e: any) => ({
      id: e.id,
      school: e.institution,
      degree: e.degree,
      field: e.description,
      startDate: safeDate(e.startAt),
      endDate: safeDate(e.endAt),
      current: e.current || false,
    })) || []
  )

  const generalForm = useForm({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
  })

  const talentForm = useForm({
    title: talentProfile?.title || '',
    bio: talentProfile?.bio || '',
    phone: talentProfile?.phone || '',
    location: talentProfile?.location || '',
    linkedinUrl: talentProfile?.linkedinUrl || '',
    githubUrl: talentProfile?.githubUrl || '',
    skills: skillsSelected,
    experiences,
    educations,
  })

  const handleSkillsChange = (values: number[]) => {
    setSkillsSelected(values)
    talentForm.setData('skills', values)
  }

  const addExperience = () =>
    setExperiences((prev: any) => {
      const updated = [
        ...prev,
        {
          id: null,
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        },
      ]
      talentForm.setData('experiences', updated)
      return updated
    })

  const removeExperience = (index: number) =>
    setExperiences((prev: any) => {
      const updated = prev.filter((_: any, i: number) => i !== index)
      talentForm.setData('experiences', updated)
      return updated
    })

  const updateExperience = (index: number, patch: Partial<any>) =>
    setExperiences((prev: any) => {
      const updated = prev.map((e: any, i: number) => (i === index ? { ...e, ...patch } : e))
      talentForm.setData('experiences', updated)
      return updated
    })

  const addEducation = () =>
    setEducations((prev: any) => {
      const updated = [
        ...prev,
        {
          id: null,
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          current: false,
        },
      ]
      talentForm.setData('educations', updated)
      return updated
    })

  const removeEducation = (index: number) =>
    setEducations((prev: any[]) => {
      const updated = prev.filter((_: any, i: number) => i !== index)
      talentForm.setData('educations', updated)
      return updated
    })

  const updateEducation = (index: number, patch: Partial<any>) =>
    setEducations((prev: any[]) => {
      const updated = prev.map((e: any, i: number) => (i === index ? { ...e, ...patch } : e))
      talentForm.setData('educations', updated)
      return updated
    })

  const submitGeneral = (e: React.FormEvent) => {
    e.preventDefault()
    const validation = generalSchema.safeParse(generalForm.data)
    if (!validation.success) return alert(JSON.stringify(validation.error.format(), null, 2))
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('type', 'general')
    Object.entries(generalForm.data).forEach(([key, value]) =>
      formData.append(key, value as string)
    )
    const avatarFile = avatarRef.current?.files?.[0]
    if (avatarFile) formData.append('profileFile', avatarFile)
    router.post(`/talent/profile/${user.id}`, formData)
  }

  const submitTalent = (e: React.FormEvent) => {
    e.preventDefault()

    const finalData = {
      ...talentForm.data,
      skills: skillsSelected,
      experiences,
      educations,
    }

    const validation = talentSchema.safeParse(finalData)
    if (!validation.success) return alert(JSON.stringify(validation.error.format(), null, 2))

    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('type', 'talent')

    Object.entries(finalData).forEach(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value ?? '')
      }
    })

    const cvFile = cvRef.current?.files?.[0]
    if (cvFile) formData.append('cv', cvFile)

    router.post(`/talent/profile/${user.id}`, formData)
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-10 space-y-8">
        <Head title="Mon Profile" />
        <form onSubmit={submitGeneral} className="space-y-6" encType="multipart/form-data">
          <Card className="p-6 flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                {user.profile ? (
                  <img
                    src={user.profile}
                    alt={user.firstname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profileFile"
                className="absolute inset-0 rounded-full cursor-pointer"
                title="Changer la photo"
              />
            </div>
            <div>
              <Label>Changer la photo de profil</Label>
              <Input
                ref={avatarRef}
                id="profileFile"
                name="profileFile"
                type="file"
                accept="image/*"
                className="hidden mt4"
              />
            </div>
          </Card>

          <Card className="p-6">
            <CardTitle>Informations Générales</CardTitle>
            <CardContent className="mt-4 grid gap-4">
              <div>
                <Label>Prénom</Label>
                <Input
                  className="mt-4"
                  name="firstname"
                  value={generalForm.data.firstname}
                  onChange={(e) => generalForm.setData('firstname', e.target.value)}
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  className="mt-4"
                  name="lastname"
                  value={generalForm.data.lastname}
                  onChange={(e) => generalForm.setData('lastname', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  className="mt-4"
                  name="email"
                  value={generalForm.data.email}
                  onChange={(e) => generalForm.setData('email', e.target.value)}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  type="submit"
                  className="bg-green-600 border rounded-xl border-green-600 text-white hover:bg-white hover:text-green-600 transition-all duration-500"
                >
                  Enregistrer informations générales
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* TALENT FORM */}
        <form onSubmit={submitTalent} className="space-y-6">
          <Card className="p-6">
            <CardTitle>Informations Talent</CardTitle>
            <CardContent className="mt-4 grid gap-4">
              {/* Titre, Bio, Téléphone, Adresse, LinkedIn, GitHub */}
              <div>
                <Label>Titre</Label>
                <Input
                  className="mt-4"
                  name="title"
                  value={talentForm.data.title}
                  onChange={(e) => talentForm.setData('title', e.target.value)}
                />
              </div>

              <div>
                <Label>Bio</Label>
                <textarea
                  name="bio"
                  className="border px-3 py-2 mt-2 rounded w-full"
                  value={talentForm.data.bio}
                  onChange={(e) => talentForm.setData('bio', e.target.value)}
                />
              </div>

              <div>
                <Label>Téléphone</Label>
                <Input
                  className="mt-4"
                  name="phone"
                  value={talentForm.data.phone}
                  onChange={(e) => talentForm.setData('phone', e.target.value)}
                />
              </div>

              <div>
                <Label>Adresse</Label>
                <Input
                  className="mt-4"
                  name="location"
                  value={talentForm.data.location}
                  onChange={(e) => talentForm.setData('location', e.target.value)}
                />
              </div>

              <div>
                <Label>LinkedIn</Label>
                <Input
                  className="mt-4"
                  name="linkedinUrl"
                  value={talentForm.data.linkedinUrl}
                  onChange={(e) => talentForm.setData('linkedinUrl', e.target.value)}
                />
              </div>

              <div>
                <Label>GitHub</Label>
                <Input
                  className="mt-4"
                  name="githubUrl"
                  value={talentForm.data.githubUrl}
                  onChange={(e) => talentForm.setData('githubUrl', e.target.value)}
                />
              </div>

              {/* Compétences */}
              <div>
                <Label>Compétences (max 10)</Label>
                <SearchableMultiSelect
                  options={skillsList.map((s: any) => ({ label: s.name, value: s.id }))}
                  values={skillsSelected}
                  onValueChange={handleSkillsChange}
                  placeholder="Sélectionner des compétences"
                />
              </div>

              {/* CV */}
              <div>
                <Label>CV (PDF)</Label>
                <Input className="mt-4" ref={cvRef} name="cv" type="file" accept=".pdf" />
                {talentProfile?.cvUrl ? (
                  <Button asChild variant="link" className="mt-1 h-auto p-0">
                    <a
                      href="/talent/my-cv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Voir le CV
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">Aucun CV uploadé</span>
                )}
              </div>

              {/* Expériences */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Expériences</Label>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    type="button"
                    onClick={addExperience}
                  >
                    Ajouter
                  </Button>
                </div>
                <table className="w-full table-auto border mt-2">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Poste</th>
                      <th className="p-2 text-left">Entreprise</th>
                      <th className="p-2 text-left">Début</th>
                      <th className="p-2 text-left">Fin</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((exp: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(i, { title: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(i, { company: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(i, { endDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeExperience(i)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Formations */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Formations</Label>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    type="button"
                    onClick={addEducation}
                  >
                    Ajouter
                  </Button>
                </div>
                <table className="w-full table-auto border mt-2">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">École</th>
                      <th className="p-2 text-left">Diplôme</th>
                      <th className="p-2 text-left">Domaine</th>
                      <th className="p-2 text-left">Début</th>
                      <th className="p-2 text-left">Fin</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {educations.map((edu: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <Input
                            value={edu.school}
                            onChange={(e) => updateEducation(i, { school: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(i, { degree: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(i, { field: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(i, { startDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(i, { endDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeEducation(i)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">
                  Complétion du profil : {completionPercent}%
                </p>
                <Progress value={completionPercent} />
              </div>

              <div className="mt-4">
                <Button
                  className="bg-green-600 border rounded-xl border-green-600 text-white hover:bg-white hover:text-green-600 transition-all duration-500"
                  type="submit"
                >
                  Enregistrer les modifications Talent
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  )
}

export default TalentProfile
