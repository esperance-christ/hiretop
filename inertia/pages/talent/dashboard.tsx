import React from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { ArrowRight, Briefcase, Building2, Clock, DollarSign, MapPin, Search } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import MainLayout from '~/layouts/main_layout'
import { DateTime } from 'luxon'
import RichTextEditor from '~/components/rich-text-editor'

const TalentBoard = () => {
  const { flash, user, talentSkills, offers, meta, filters } = usePage<PageProps>().props

  const enumContractType = [
    { name: 'CDI', value: 'CDI' },
    { name: 'CDD', value: 'CDD' },
    { name: 'FREELANCE', value: 'FREELANCE' },
    { name: 'STAGE', value: 'INTERNSHIP' },
  ]

  const userSkills = talentSkills?.map((s: any) => s.skillId) ?? []

  const [search, setSearch] = React.useState(filters.search || '')
  const [location, setLocation] = React.useState(filters.location || '')
  const [contractType, setContractType] = React.useState(filters.contractType || '')

  const canApply = (jobSkills: number[]) => {
    if (!user) return false
    return jobSkills.some((id) => userSkills.includes(id))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      '/dashboard',
      { search, location, contractType },
      { preserveState: true, replace: true }
    )
  }

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setContractType('')
    router.get('/dashboard', {}, { replace: true })
  }

  function basicSanitize(html: string) {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
  }

  const formatSalary = (min?: any, max?: any) => {
    if (!min && !max) return null
    if (min && max) return `${min} $ – ${max} $`
    if (min) return `À partir de ${min} $`
    return `Jusqu'à ${max} $`
  }

  const formatAgo = (d: string) => {
    return DateTime.fromISO(d).toRelative({ locale: 'fr' }) ?? ''
  }

  return (
    <MainLayout>
      {flash?.message && (
        <div className="bg-green-100 text-green-800 p-3 text-center text-sm">{flash.message}</div>
      )}
      {flash?.error && (
        <div className="bg-red-100 text-red-800 p-3 text-center text-sm">{flash.error}</div>
      )}

      <Head title={'Tableau de Board'} />

      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Trouvez l’emploi de vos rêves</h1>
              <p className="text-gray-600 mt-2">
                Parcourez nos dernières offres et postulez instantanément !
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
                placeholder="Pays ou ville"
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
          <aside className="w-80 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">
                  Effacer tout
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d’emploi
                </label>
                <div className="space-y-2">
                  {enumContractType.map((type) => (
                    <label key={type.value} className=" uppercase flex items-center gap-2">
                      <input
                        type="radio"
                        name="contractType"
                        value={type.value}
                        checked={contractType === type.value}
                        onChange={() => setContractType(type.value)}
                      />
                      <span className="text-sm text-gray-700">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {meta.total} résultat{meta.total > 1 ? 's' : ''}
              </h2>
            </div>

            <div className="space-y-6">
              {offers.map((job) => {
                const hasMatch = canApply(job.skills.map((s) => s.id))

                return (
                  <Sheet key={job.id}>
                    <SheetTrigger asChild>
                      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                              {job.company.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <div className="flex justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                <div className="grid text-right text-sm">
                                  <div className="text-xs flex items-center gap-1 text-gray-500 mt-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Publié {formatAgo(job.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {job.company.name}
                                </span>

                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                  {job.contractType}
                                </Badge>

                                <div className="flex items-center gap-1 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                              </div>

                              {job.description && <RichTextEditor value={job.description} editable={false} truncateLength={300} />}

                              {formatSalary(job.salaryMin, job.salaryMax) && (
                                <p className="text-sm font-medium text-gray-900 mt-2 flex items-center gap-1">
                                  {formatSalary(job.salaryMin, job.salaryMax)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SheetTrigger>

                    <SheetContent
                      side="job-side"
                      className="p-8 overflow-y-auto bg-white/80 backdrop-blur-lg border-l border-gray-200"
                    >
                      <div>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-16 h-16 bg-green-600 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
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
                            <span>Publié {formatAgo(job.createdAt)}</span>
                          </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-3">Description du poste</h3>
                          {job.description && (
                            <RichTextEditor value={job.description} editable={false} />
                          )}
                        </div>

                        {/* SKILLS */}
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

                        {/* APPLY BUTTONS */}
                        <div className="flex justify-end gap-3">

                          {hasMatch ? (
                            <Button
                              onClick={() => router.get(`/talent/job/${job.id}`)}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              Voir details
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          ) : (
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

            <div className="flex justify-end items-center text-xs gap-2 mt-10">
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
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default TalentBoard
