import React, { useRef, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import MainLayout from '~/layouts/main_layout'
import { Card, CardContent, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { User as UserIcon } from 'lucide-react'
import { MultiSelect } from '~/components/ui/multi-select'

const TalentProfile = () => {
  const { user, skills, talentProfile, profileCompletion } = usePage<PageProps>().props

  const completionPercent = profileCompletion || 0

  console.log(usePage().props.talentProfile)


  // states for dynamic lists
  const [experiences, setExperiences] = useState(
    talentProfile?.experiences?.map((e: any) => ({
      id: e.id ?? null,
      title: e.title ?? '',
      company: e.company ?? '',
      location: e.location ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      current: e.current ?? false,
      description: e.description ?? '',
    })) || []
  )

  const [educations, setEducations] = useState(
    talentProfile?.educations?.map((e: any) => ({
      id: e.id ?? null,
      school: e.school ?? '',
      degree: e.degree ?? '',
      field: e.field ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      current: e.current ?? false,
    })) || []
  )

  const skillsInitial = talentProfile?.skills?.map((s: any) => s.id) || []
  const [skillsSelected, setSkillsSelected] = useState<number[]>(skillsInitial)

  const avatarRef = useRef<HTMLInputElement | null>(null)
  const cvRef = useRef<HTMLInputElement | null>(null)

  const skillsList = Array.isArray(skills) ? skills : []

  const addExperience = () =>
    setExperiences((prev) => [
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
    ])
  const removeExperience = (index: number) =>
    setExperiences((prev) => prev.filter((_, i) => i !== index))
  const updateExperience = (index: number, patch: Partial<any>) =>
    setExperiences((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))

  const addEducation = () =>
    setEducations((prev) => [
      ...prev,
      { id: null, school: '', degree: '', field: '', startDate: '', endDate: '', current: false },
    ])
  const removeEducation = (index: number) =>
    setEducations((prev) => prev.filter((_, i) => i !== index))
  const updateEducation = (index: number, patch: Partial<any>) =>
    setEducations((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))

  // On limitera pour le moment les competences a 10
  const handleSkillsChange = (values: number[]) => {
    if (values.length > 10) {
      setSkillsSelected(values.slice(0, 10))

      return
    }
    setSkillsSelected(values)
  }

  const handleSubmitTalent = (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData()

    form.append('_method', 'PUT')
    form.append('type', 'talent')

    const titleInput =
      (document.querySelector('input[name="title"]') as HTMLInputElement | null)?.value || ''
    const bioInput =
      (document.querySelector('textarea[name="bio"]') as HTMLTextAreaElement | null)?.value || ''
    const phoneInput =
      (document.querySelector('input[name="phone"]') as HTMLInputElement | null)?.value || ''
    const locationInput =
      (document.querySelector('input[name="location"]') as HTMLInputElement | null)?.value || ''
    const linkedinInput =
      (document.querySelector('input[name="linkedinUrl"]') as HTMLInputElement | null)?.value || ''
    const githubInput =
      (document.querySelector('input[name="githubUrl"]') as HTMLInputElement | null)?.value || ''

    form.append('title', titleInput)
    form.append('bio', bioInput)
    form.append('phone', phoneInput)
    form.append('location', locationInput)
    form.append('linkedinUrl', linkedinInput)
    form.append('githubUrl', githubInput)

    form.append('skills', JSON.stringify(skillsSelected))

    form.append('experiences', JSON.stringify(experiences))
    form.append('educations', JSON.stringify(educations))

    const cvFile = cvRef.current?.files?.[0]
    if (cvFile) form.append('cv', cvFile)

    const url = `/talent/profile/${user.id}`
    router.post(url, form)
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-10 space-y-8">
        {/* GENERAL FORM (avatar + basic user fields) */}
        <form
          method="POST"
          action={`/talent/profile/${user.id}`}
          encType="multipart/form-data"
          className="space-y-6"
        >
          <Input className="mt-4" type="hidden" name="_method" value="PUT" />
          <Input className="mt-4" type="hidden" name="type" value="general" />

          {/* Avatar */}
          <Card className="p-6 flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                {user.profile ? (
                  <img
                    src={user.profile}
                    alt={`${user.firstname}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>

              {/* invisible file input overlayed, triggered by label */}
              <label
                htmlFor="profileFile"
                className="absolute inset-0 rounded-full cursor-pointer"
                aria-label="Changer photo"
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

          {/* General info inputs */}
          <Card className="p-6">
            <CardTitle>Informations Générales</CardTitle>
            <CardContent className="mt-4 grid gap-4">
              <div>
                <Label>Prénom</Label>
                <Input className="mt-4" name="firstname" defaultValue={user.firstname} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input className="mt-4" name="lastname" defaultValue={user.lastname} />
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-4" name="email" defaultValue={user.email} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  className="bg-green-600 border rounded-xl border-green-600 text-white hover:bg-white hover:text-green-600 transition-all duration-500"
                  type="submit"
                >
                  Enregistrer informations générales
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* TALENT FORM (skills, CV, experiences, educations) */}
        <form onSubmit={handleSubmitTalent} className="space-y-6">
          <Card className="p-6">
            <CardTitle>Informations Talent</CardTitle>
            <CardContent className="mt-4 grid gap-4">
              <div>
                <Label>Titre</Label>
                <Input className="mt-4" name="title" defaultValue={talentProfile?.title || ''} />
              </div>

              <div>
                <Label>Bio</Label>
                <textarea
                  name="bio"
                  defaultValue={talentProfile?.bio || ''}
                  className="border px-3 py-2 mt-2 rounded w-full"
                />
              </div>

              <div>
                <Label>Téléphone</Label>
                <Input className="mt-4" name="phone" defaultValue={talentProfile?.phone || ''} />
              </div>

              <div>
                <Label>Localisation</Label>
                <Input
                  className="mt-4"
                  name="location"
                  defaultValue={talentProfile?.location || ''}
                />
              </div>

              <div>
                <Label>LinkedIn</Label>
                <Input
                  className="mt-4"
                  name="linkedinUrl"
                  defaultValue={talentProfile?.linkedinUrl || ''}
                />
              </div>

              <div>
                <Label>GitHub</Label>
                <Input
                  className="mt-4"
                  name="githubUrl"
                  defaultValue={talentProfile?.githubUrl || ''}
                />
              </div>

              {/* Commpetences */}
              <div>
                <Label>Compétences (max 10)</Label>
                {/* <Select
                  multiple
                  value={skillsSelected}
                  onValueChange={(values: number[]) => handleSkillsChange(values)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des compétences" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillsList.map((skill: any) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

                <MultiSelect
                  options={skills.map((skill) => ({
                    label: skill.name,
                    value: skill.id,
                  }))}
                  onValueChange={(values) => setSkillsSelected(values)}
                  placeholder="Sélectionner des compétences"
                />

                <div className="flex gap-2 flex-wrap mt-2">
                  {skillsSelected.map((id) => {
                    const s = skillsList.find((x: any) => x.id === id)
                    return (
                      <span
                        key={id}
                        className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
                      >
                        {s?.name || id}
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Envoie de CV */}
              <div>
                <Label>CV (PDF)</Label>
                <Input className="mt-4" ref={cvRef} name="cv" type="file" accept=".pdf" />
                {talentProfile?.cvUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="mt-1">
                        Voir le CV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>CV de {user.firstname}</DialogTitle>
                      </DialogHeader>
                      <iframe src={talentProfile.cvUrl} className="w-full h-96 border rounded" />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Fermer</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Expériences</Label>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      type="button"
                      onClick={addExperience}
                    >
                      Ajouter
                    </Button>
                  </div>
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
                    {experiences.map((exp, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            value={exp.title}
                            onChange={(e) => updateExperience(i, { title: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            value={exp.company}
                            onChange={(e) => updateExperience(i, { company: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(i, { endDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removeExperience(i)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {experiences.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-sm text-gray-500">
                          Aucune expérience
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sesction pour les formations */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Formations</Label>
                  <div className="flex gap-2">
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700"
                      type="button"
                      onClick={addEducation}
                    >
                      Ajouter
                    </Button>
                  </div>
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
                    {educations.map((edu, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            value={edu.school}
                            onChange={(e) => updateEducation(i, { school: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            value={edu.degree}
                            onChange={(e) => updateEducation(i, { degree: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            value={edu.field}
                            onChange={(e) => updateEducation(i, { field: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(i, { startDate: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            className="mt-4"
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
                    {educations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-sm text-gray-500">
                          Aucune formation
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Niveau de remplissage des informations */}
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
