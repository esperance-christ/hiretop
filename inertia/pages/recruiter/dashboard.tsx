// resources/js/pages/recruiter/dashboard.tsx
import React from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Building2, Users, Briefcase, FileText, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { companyName, stats, latestPosts, latestApplications } = usePage<any>().props

  const totalApplications = Number(stats.totalApplications)
  const totalPosts = Number(stats.totalPosts)
  const acceptedApplications = Number(stats.acceptedApplications)
  const membersCount = Number(stats.membersCount)
  const acceptanceRate =
    totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0

  return (
    <>
      <Head title="Tableau de bord" />

      <RecruiterLayout>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-50">
            Bienvenue, {companyName || 'Recruteur'}
          </h1>
          <p className="text-amber-400 mt-2">Tableau de Bord du Recruteur</p>
          <p className="text-white mt-2 text-xs">
            Voici un aperçu de votre activité de recrutement
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Membres</CardTitle>
              <Users className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{membersCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Offres publiées</CardTitle>
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPosts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Candidatures</CardTitle>
              <FileText className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApplications}</div>
              <Badge variant="outline" className="mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                {acceptanceRate}% acceptées
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
              <div className="h-5 w-5 bg-white/20 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acceptanceRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dernières candidatures reçues</CardTitle>
              <CardDescription>Les 5 plus récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {latestApplications.length > 0 ? (
                    latestApplications.map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.talent.user?.firstname} {app.talent.user?.lastname}
                        </TableCell>
                        <TableCell className="text-gray-600">{app.jobOffer.title}</TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        Aucune candidature récente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernières offres publiées</CardTitle>
              <CardDescription>Vos annonces récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestPosts.length > 0 ? (
                  latestPosts.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">
                          Publiée le {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Voir →
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune offre publiée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </RecruiterLayout>
    </>
  )
}
