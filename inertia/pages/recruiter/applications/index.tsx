import React from 'react'
import { Head, usePage, router, Link } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { DateTime } from 'luxon'
import { Search, Filter, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'

interface Application {
  id: number
  talent: { user: { firstname: string; lastname: string; email: string } }
  jobOffer: { id: number; title: string }
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
  appliedAt: string
}

interface Filters {
  search?: string
  status?: string
  jobOfferId?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'En attente',
    color: 'bg-blue-100 text-blue-800',
    icon: <Clock className="w-4 h-4" />,
  },
  REVIEWED: {
    label: 'Reçu et en cours de traitement',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Eye className="w-4 h-4" />,
  },
  ACCEPTED: {
    label: 'Acceptée',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  REJECTED: {
    label: 'Rejetée',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="w-4 h-4" />,
  },
}

export default function Applications() {
  const { applications, meta, filters, jobOffers } = usePage<PageProps>().props

  const formatDate = (isoString: string) => {
    return DateTime.fromISO(isoString).setLocale('fr').toFormat('dd MMM yyyy')
  }

  const handleFilterChange = (key: 'search' | 'status' | 'jobOfferId', value: string) => {
    router.get(
      '/recruiter/applies',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true, replace: true }
    )
  }

  const goToPage = (page: number) => {
    router.get('/recruiter/applies', { ...filters, page }, { preserveState: true })
  }

  return (
    <RecruiterLayout>
      <Head title="Candidatures reçues" />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Nos Candidatures</h1>
            <p className="text-amber-300 mt-1">Gérez les candidatures</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/recruiter/posts/create">+ Nouvelle offre</Link>
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <CardTitle className="text-lg">Filtres</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un candidat..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.jobOfferId || 'all'}
                onValueChange={(v) => handleFilterChange('jobOfferId', v === 'all' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les offres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les offres</SelectItem>
                  {jobOffers.map((offer: any) => (
                    <SelectItem key={offer.id} value={String(offer.id)}>
                      {offer.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || 'all'}
                onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">Nouvelles</SelectItem>
                  <SelectItem value="REVIEWED">En revue</SelectItem>
                  <SelectItem value="ACCEPTED">Acceptées</SelectItem>
                  <SelectItem value="REJECTED">Rejetées</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => router.visit('/recruiter/applies')}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidat</TableHead>
              <TableHead>Offre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  Aucune candidature pour le moment
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => {
                const status = statusConfig[app.status]
                const name = `${app.talent.user.firstname} ${app.talent.user.lastname}`
                const initials = `${app.talent.user.firstname[0]}${app.talent.user.lastname[0]}`

                return (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-gray-500">{app.talent.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{app.jobOffer.title}</TableCell>
                    <TableCell>{formatDate(String(app.appliedAt))}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} border-transparent`}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-amber-500 text-white hover:bg-amber-500 text-xs"
                        onClick={() => router.visit(`/recruiter/applies/${app.id}`)}
                      >
                        Voir détail
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta.lastPage > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === meta.currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </RecruiterLayout>
  )
}
