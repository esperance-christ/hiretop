import React from 'react'
import { usePage } from '@inertiajs/react'
import MainLayout from '~/layouts/main_layout'
import { Card, CardAction, CardContent, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog'
import { DateTime } from 'luxon'
import { Button } from '~/components/ui/button'

const TalentApplies = () => {
  const { user, applications: offers, meta, filters } = usePage<PageProps>().props

  if (!user.talentProfile || offers.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-500 mb-4">
            {!user.talentProfile
              ? "Vous n'avez pas encore créé de profil talent."
              : 'Vous n’avez pas encore de candidatures.'}
          </p>
          <a href="/dashboard" className="px-4 py-2 rounded-full bg-indigo-600 text-white">
            Voir les offres
          </a>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-screen">
        <form method="GET" action="/applies" className="flex gap-2 mb-6">
          <input
            type="text"
            name="search"
            defaultValue={filters?.search || ''}
            placeholder="Rechercher par titre ou entreprise"
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            name="from"
            defaultValue={filters?.from || ''}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            name="to"
            defaultValue={filters?.to || ''}
            className="border px-3 py-2 rounded"
          />
          <Button type="submit">Filtrer</Button>
        </form>

        <section>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((application) => {
              const job = application.jobOffer
              const company = job.company

              return (
                <Card
                  key={application.id}
                  className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700">
                        {company?.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{job?.title}</div>
                        <div className="text-xs text-gray-500">{company?.name}</div>
                      </div>
                    </CardTitle>
                    <CardContent>
                      <p className="text-xs text-gray-500 mt-3">
                        {application?.message || 'Aucun message'}
                      </p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {job?.skills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <CardAction>
                        <Button variant="outline" className="w-full mt-4">
                          Voir Détails
                        </Button>
                      </CardAction>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{job.title}</DialogTitle>
                        <DialogDescription>
                          {application.message || 'Aucun message'}
                          <div className="mt-2 text-xs text-gray-500">
                            Disponible le:{' '}
                            {application.disponibleAt
                              ? DateTime.fromISO(application.disponibleAt).toLocaleString(
                                  DateTime.DATE_MED
                                )
                              : 'N/A'}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Entreprise: {job.company.name}
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={() => {}}>Fermer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default TalentApplies
