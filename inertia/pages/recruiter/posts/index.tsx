import { Head, Link, router, usePage } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Briefcase, MapPin, Calendar, MoreVertical, Eye, Edit, XCircle, Trash2 } from 'lucide-react'
import { DateTime } from 'luxon'

interface Job {
  id: number
  title: string
  location: string | null
  contractType: string
  status: string
  isUrgent: boolean
  publishedAt: string
  applicationsCount: number
}

interface Meta {
  currentPage: number
  previousPageUrl: string | null
  nextPageUrl: string | null
}

export default function JobOffers() {
  const { jobs, meta, flash } = usePage<{ jobs: Job[]; meta: Meta; flash?: any }>().props

  const [search, setSearch] = useState('')
  const [contractType, setContractType] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (contractType !== 'all') params.contract = contractType
    if (dateFrom) params.from = dateFrom
    if (dateTo) params.to = dateTo

    router.get('/recruiter/posts', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }, [search, contractType, dateFrom, dateTo])

  const formatDate = (iso: string) => DateTime.fromISO(iso).toFormat('dd/MM/yyyy')

  const contractTypeLabel = (type: string) => {
    switch (type) {
      case 'CDI': return 'CDI'
      case 'CDD': return 'CDD'
      case 'FREELANCE': return 'Freelance'
      case 'INTERNSHIP': return 'Stage'
      default: return type
    }
  }

  return (
    <RecruiterLayout>
      <Head title="Mes offres d'emploi" />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Flash */}
        {flash?.job && (
          <div className={`p-4 rounded-lg border text-sm font-medium ${
            flash.job.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {flash.job.message}
          </div>
        )}

        {/* Header */}
        <div className="text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mes offres publiées</h1>
            <p className="text-amber-300 mt-1">Gérez vos annonces et suivez les candidatures</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/recruiter/posts/create">+ Nouvelle offre</Link>
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input placeholder="Rechercher par titre..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger><SelectValue placeholder="Type de contrat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="INTERNSHIP">Stage</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-10" />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-10" />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {(search || contractType !== 'all' || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => {
                setSearch(''); setContractType('all'); setDateFrom(''); setDateTo('')
              }}>
                Réinitialiser
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-600">Aucune offre publiée pour le moment</p>
                <Button asChild className="mt-6"><Link href="/recruiter/posts/create">Publier ma première offre</Link></Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offre</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Contrat</TableHead>
                    <TableHead>Publiée le</TableHead>
                    <TableHead>Candidatures</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {job.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                          <span className="truncate max-w-xs">{job.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {job.location || 'Remote'}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{contractTypeLabel(job.contractType)}</Badge></TableCell>
                      <TableCell>{formatDate(job.publishedAt)}</TableCell>
                      <TableCell>{job.applicationsCount}</TableCell>
                      <TableCell>
                        {job.status === 'CLOSED' ? (
                          <Badge variant="secondary">Clôturée</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700">Publiée</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/recruiter/posts/${job.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Voir l'offre
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/recruiter/posts/${job.id}/edit`} className="flex items-center gap-2">
                                <Edit className="h-4 w-4" /> Modifier
                              </Link>
                            </DropdownMenuItem>
                            {job.status === 'PUBLISHED' && (
                              <DropdownMenuItem
                                className="text-orange-600 focus:text-orange-600"
                                onClick={() => router.post(`/recruiter/posts/${job.id}/close`)}
                              >
                                <XCircle className="h-4 w-4 mr-2" /> Clôturer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => confirm('Supprimer définitivement cette offre ?') && router.delete(`/recruiter/posts/${job.id}`)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination personnalisée */}
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

          <span className="px-3 py-1 bg-emerald-600 text-white rounded">{meta.currentPage}</span>

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
    </RecruiterLayout>
  )
}
