import React from 'react'
import { usePage, Link, Head, router } from '@inertiajs/react'
import MainLayout from '~/layouts/main_layout'
import { Card, CardAction, CardContent, CardTitle } from '~/components/ui/card'
import { DateTime } from 'luxon'
import { Button } from '~/components/ui/button'
import { Search } from 'lucide-react'

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
      <Head title={'Mes candidatures'} />
      <div className="w-full relative h-screen max-w-6xl my-8 mx-auto px-4 sm:px-6 lg:px-8">
        <form method="GET" action="/talent/applies" className="flex w-full gap-2 mb-6">
          <div className="flex-1 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={filters?.search || ''}
              placeholder="Rechercher par titre ou entreprise"
              className="border w-full px-3 py-2 rounded"
            />
          </div>
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
          <Button
            type="submit"
            className="border border-green-600 text-green-600 bg-transparent hover:text-white hover:bg-green-600"
          >
            Filtrer
          </Button>
        </form>

        <section>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((application) => {
              const job = application.jobOffer
              const company = job.company

              return (
                <Card
                  key={application.id}
                  className="bg-white p-4 w-80 rounded-2xl shadow-sm flex flex-col justify-between"
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
                      <div className="mt-2 text-xs text-gray-500">
                        Disponible dès le:{' '}
                        {application.disponibleAt
                          ? DateTime.fromISO(String(application?.disponibleAt)).toISODate()
                          : 'N/A'}
                      </div>
                    </CardContent>
                  </div>

                  <CardAction>
                    <Link href={`/talent/job/${job.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        Voir Détails
                      </Button>
                    </Link>
                  </CardAction>
                </Card>
              )
            })}
          </div>
        </section>
        <div className="flex absolute bottom-0 right-0 justify-end items-center text-xs gap-2 mt-10">
          <button
            disabled={!meta.previousPageUrl}
            onClick={() => meta.previousPageUrl && router.visit(meta.previousPageUrl)}
            className={`px-3 py-1 rounded ${
              meta.previousPageUrl
                ? 'bg-gray-100 hover:bg-gray-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Précédent
          </button>

          <span className="px-3 py-1 bg-green-600 text-white rounded">{meta.currentPage}</span>

          <button
            disabled={!meta.nextPageUrl}
            onClick={() => meta.nextPageUrl && router.visit(meta.nextPageUrl)}
            className={`px-3 py-1 rounded ${
              meta.nextPageUrl
                ? 'bg-gray-100 hover:bg-gray-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Suivant
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

export default TalentApplies
