import React, { useState } from 'react'
import { usePage } from '@inertiajs/react'
import MainLayout from '~/layouts/main_layout'
import {
  Card,
  CardContent,
  CardTitle,
} from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog'
import { Progress } from '~/components/ui/progress'
import { Button } from '~/components/ui/button'

const TalentProfile = () => {
  const { user, profileCompletion } = usePage<PageProps>().props

  const [showCVModal, setShowCVModal] = useState(false)
  const [showEditGeneralModal, setShowEditGeneralModal] = useState(false)
  const [showEditTalentModal, setShowEditTalentModal] = useState(false)

  const talentProfile = user.talentProfile
  const completionPercent = profileCompletion || 0

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-10 space-y-8">

        {/* Informations générales */}
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <CardTitle>Informations Générales</CardTitle>
            <Button variant="outline" onClick={() => setShowEditGeneralModal(true)}>
              Modifier
            </Button>
          </div>
          <CardContent className="mt-4">
            <p><strong>Nom :</strong> {user.firstname} {user.lastname}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Rôle :</strong> {user.roles.join(', ')}</p>
          </CardContent>
        </Card>

        {/* Informations Talent */}
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <CardTitle>Informations Talent</CardTitle>
            <Button variant="outline" onClick={() => setShowEditTalentModal(true)}>
              Modifier
            </Button>
          </div>
          <CardContent className="mt-4 space-y-2">
            {talentProfile ? (
              <>
                <p><strong>Titre :</strong> {talentProfile.title || 'Non renseigné'}</p>
                <p><strong>Bio :</strong> {talentProfile.bio || 'Non renseigné'}</p>
                <p><strong>Téléphone :</strong> {talentProfile.phone || 'Non renseigné'}</p>
                <p><strong>Localisation :</strong> {talentProfile.location || 'Non renseigné'}</p>
                <p>
                  <strong>CV :</strong>{' '}
                  {talentProfile.cvUrl ? (
                    <Button variant="link" onClick={() => setShowCVModal(true)}>
                      Voir le CV
                    </Button>
                  ) : (
                    'Non renseigné'
                  )}
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Complétion du profil : {completionPercent}%</p>
                  <Progress value={completionPercent} />
                </div>
              </>
            ) : (
              <p className="text-gray-500">Vous n'avez pas encore complété votre profil talent.</p>
            )}
          </CardContent>
        </Card>

        {/* Modal CV */}
        <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>CV de {user.firstname} {user.lastname}</DialogTitle>
              <DialogDescription>
                {talentProfile?.cvUrl ? (
                  <iframe
                    src={talentProfile.cvUrl}
                    className="w-full h-96 border rounded"
                    title="CV"
                  />
                ) : (
                  <p>Aucun CV disponible</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowCVModal(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Modifier Informations Générales */}
        <Dialog open={showEditGeneralModal} onOpenChange={setShowEditGeneralModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier vos informations générales</DialogTitle>
            </DialogHeader>
            <form
              method="POST"
              action="/profile/update"
              className="mt-4 space-y-4"
              encType="multipart/form-data"
            >
              <input name="_method" type="hidden" value="PUT" />
              <input type="hidden" name="type" value="general" />

              <div>
                <label className="block text-sm font-medium">Prénom</label>
                <input
                  type="text"
                  name="firstname"
                  defaultValue={user.firstname}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Nom</label>
                <input
                  type="text"
                  name="lastname"
                  defaultValue={user.lastname}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Modifier Informations Talent */}
        <Dialog open={showEditTalentModal} onOpenChange={setShowEditTalentModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Modifier vos informations talent</DialogTitle>
            </DialogHeader>
            <form
              method="POST"
              action="/profile/update"
              className="mt-4 space-y-4"
              encType="multipart/form-data"
            >
              <input name="_method" type="hidden" value="PUT" />
              <input type="hidden" name="type" value="talent" />

              <div>
                <label className="block text-sm font-medium">Titre</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={talentProfile?.title || ''}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={talentProfile?.bio || ''}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={talentProfile?.phone || ''}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">CV (PDF)</label>
                <input type="file" name="cv" accept=".pdf" className="border px-3 py-2 rounded w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium">LinkedIn</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  defaultValue={talentProfile?.linkedinUrl || ''}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">GitHub</label>
                <input
                  type="text"
                  name="githubUrl"
                  defaultValue={talentProfile?.githubUrl || ''}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  )
}

export default TalentProfile
