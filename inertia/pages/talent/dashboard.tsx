import React from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import {
  ArrowRight,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Search,
} from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import MainLayout from '~/layouts/main_layout'

const TalentBoard = () => {
  const { flash, user, offers, meta, filters } = usePage<PageProps>().props

  const enumContractType = [
    {
      name: 'CDI',
      value: 'CDI',
    },
    {
      name: 'CDD',
      value: 'CDD',
    },
    {
      name: 'FREELANCE',
      value: 'FREELANCE',
    },
    {
      name: 'STAGE',
      value: 'INTERNSHIP',
    },
  ]

  const enumOnRemote = [
    {
      name: 'A distance',
      value: 'ON REMOTE',
    },
    {
      name: 'Sur site',
      value: 'ON SITE',
    },
    {
      name: 'Hybride',
      value: 'HYBRIDE',
    },
  ]
  const userSkills = user?.talentProfile?.skills?.map((s) => s.id) ?? []

  const [search, setSearch] = React.useState(filters.search || '')
  const [location, setLocation] = React.useState(filters.location || '')
  const [contractType, setContractType] = React.useState(filters.contractType || '')
  const [isLoading, setIsLoading] = React.useState(false)

  const canApply = (jobSkills: number[]) => {
    if (!user) return false
    return jobSkills.some((id) => userSkills.includes(id))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      '/dashboard',
      { search, location, contractType: contractType },
      { preserveState: true, replace: true }
    )
  }

  const handleApply = (jobId: number) => {
    router.post(`/jobs/${jobId}/apply`)
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null
    if (min && max) return `${min} € – ${max} €`
    if (min) return `À partir de ${min} €`
    return `Jusqu'à ${max} XOF`
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diff = now.getTime() - posted.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 60) return `Il y a ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  return (
    <MainLayout>
      {flash?.message && (
        <div className="bg-green-100 text-green-800 p-3 text-center text-sm">{flash.message}</div>
      )}
      {flash?.error && (
        <div className="bg-red-100 text-red-800 p-3 text-center text-sm">{flash.error}</div>
      )}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Trouvez l’emploi de vos rêves</h1>
              <p className="text-gray-600 mt-2">
                Vous cherchez un emploi ? Parcourez nos dernières offres pour postuler aux meilleurs
                jobs dès aujourd’hui !
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative w-48 h-32">
                <div className="absolute top-0 right-0 w-20 h-16 bg-green-600 rounded-lg transform rotate-12"></div>
                <div className="absolute bottom-0 left-0 w-24 h-20 bg-black rounded-lg transform -rotate-6"></div>
                <div className="absolute bottom-8 right-8 w-16 h-12 bg-yellow-400 rounded-lg transform rotate-3"></div>
              </div>
            </div>
          </div>
          {/* Filtre par recherche */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center"
          >
            <div className="flex-1 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Intitulé ou mot-clé"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
            <div className="hidden md:flex flex-1 items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pays ou fuseau horaire"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 outline-none text-gray-700"
              />
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8">
              Rechercher
            </Button>
          </form>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filtres */}
          <aside className="w-80 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button className="text-sm text-red-600 hover:underline">Effacer tout</button>
              </div>

              {/* Type de Contrat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d’emploi
                </label>
                <div className="space-y-2">
                  {enumContractType.map((type) => (
                    <label key={type.value} className="uppercase flex items-center gap-2">
                      <input type="checkbox" className="rounded text-green-600" value={type.value} />
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Grille salariale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plage salariale
                </label>
                <div className="space-y-2">
                  {['Moins de 5000', '5000 - 50000', '50000 - 150000', 'Personnalisé'].map(
                    (range) => (
                      <label key={range} className="uppercase flex items-center gap-2">
                        <input type="radio" name="salary" className="text-green-600" />
                        <span className="text-sm text-gray-700">{range}</span>
                      </label>
                    )
                  )}
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 500€</span>
                    <span></span>
                  </div>
                </div>
              </div>

              {/* Localisation pour le Job */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  onRemote
                </label>
                <div className="space-y-2">
                  {enumOnRemote.map((mode) => (
                    <label key={mode.value} className="uppercase flex items-center gap-2">
                      <input type="checkbox" className="rounded text-green-600" value={mode.value} />
                      <span className="text-sm text-gray-700">{mode.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* === JOB LISTINGS === */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {meta.total} résultat{meta.total > 1 ? 's' : ''}
              </h2>
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {offers.map((job) => {
                const hasMatch = canApply(job.skills.map((s) => s.id))
                return (
                  <Sheet key={job.id}>
                    <SheetTrigger asChild>
                      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-linear-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {job.company.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {job.company.name}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700 text-xs"
                                >
                                  {job.contractType}
                                </Badge>
                                {job.isUrgent && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-pink-100 text-pink-700 text-xs"
                                  >
                                    Recrutement urgent
                                  </Badge>
                                )}
                              </div>
                              {formatSalary(job.salaryMin, job.salaryMax) && (
                                <p className="text-sm font-medium text-gray-900 mt-2 flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {formatSalary(job.salaryMin, job.salaryMax)}
                                </p>
                              )}
                              <ul className="mt-3 space-y-1">
                                {job.description && (
                                  <span className=" mt-0.5">{job.description}</span>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>Publié {timeAgo(job.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetTrigger>

                    {/* === DRAWER 60% ÉCRAN (SIDEBAR STYLE) === */}
                    <SheetContent
                      side="job-side"
                      className="p-8 overflow-y-auto bg-white/80 backdrop-blur-lg border-l border-gray-200"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                            {job.company.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                            <p className="text-gray-600">{job.company.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span>{job.contractType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{job.location}</span>
                          </div>
                          {formatSalary(job.salaryMin, job.salaryMax) && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Publié {timeAgo(job.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-3">Description du poste</h3>
                          <ul className="space-y-2">
                            {job.description && <span className=" mt-0.5">{job.description}</span>}
                          </ul>
                        </div>

                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-3">Compétences requises</h3>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                              <Badge key={skill.id} variant="outline" className="text-xs">
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button variant="outline" asChild>
                            <Link href={`/jobs/${job.id}`}>Voir les détails</Link>
                          </Button>
                          {hasMatch && (
                            <Button
                              onClick={() => handleApply(job.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Postuler maintenant
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                          {hasMatch && (
                            <Button disabled variant="secondary">
                              Compétences non correspondantes
                            </Button>
                          )}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default TalentBoard
