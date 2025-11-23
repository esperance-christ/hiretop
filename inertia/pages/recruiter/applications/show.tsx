import React from 'react'
import { Head, usePage, router } from '@inertiajs/react' // ← Plus besoin de useForm ici
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Clock,
  Eye,
} from 'lucide-react'
import { DateTime } from 'luxon'

type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'

interface Application {
  id: number
  talent: { user: { firstname: string; lastname: string; email: string; phone?: string } }
  jobOffer: { title: string }
  message?: string
  documentUrl?: string
  status: ApplicationStatus
  appliedAt: string
  disponibleAt?: string
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    color: 'bg-blue-100 text-blue-800',
    icon: <Clock className="w-4 h-4" />,
  },
  REVIEWED: {
    label: 'En cours',
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
} as const

const formatDate = (iso: string) => DateTime.fromISO(iso).setLocale('fr').toFormat('dd MMMM yyyy')
const formatDateTime = (iso: string) =>
  DateTime.fromISO(iso).setLocale('fr').toFormat('dd MMM yyyy à HH:mm')

export default function ApplicationDetails() {
  const { application, flash } = usePage<{ application: Application; flash?: any }>().props
  const [isUpdating, setIsUpdating] = React.useState(false)

  const changeStatus = (newStatus: ApplicationStatus) => {
    setIsUpdating(true)

    router.put(
      `/recruiter/applies/${application.id}/status`,
      { status: newStatus },
      {
        preserveState: true,
        preserveScroll: true,
        onFinish: () => setIsUpdating(false),
        onSuccess: () => {
          router.reload({ only: ['application'] })
        },
        onError: (errors) => {
          console.error(errors)
        },
      }
    )
  }

  const name = `${application.talent.user.firstname} ${application.talent.user.lastname}`
  const status = statusConfig[application.status]

  return (
    <RecruiterLayout>
      <Head title={`Candidature de ${name}`} />

      <div className="max-w-5xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.visit('/recruiter/applies')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Candidature de {name}</h1>
            <p className="text-white/80">Offre : {application.jobOffer.title}</p>
          </div>
        </div>

        {flash?.success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {flash.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{name}</CardTitle>
                    <p className="text-sm text-gray-500">{application.talent.user.email}</p>
                  </div>
                  <Badge className={`${status.color} px-4 py-2`}>
                    {status.icon}
                    <span className="ml-2">{status.label}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {application.message && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Message du candidat
                    </h3>
                    <div className="bg-gray-50 p-5 rounded-lg whitespace-pre-wrap text-gray-700">
                      {application.message}
                    </div>
                  </div>
                )}

                {/* Disponibilité */}
                {application.disponibleAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Disponible à partir du {formatDate(application.disponibleAt)}
                  </div>
                )}

                {/* CV */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">CV joint</h3>
                  <div className="flex gap-3">
                    {application.documentUrl ? (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <a href={`/recruiter/applies/${application.id}/cv`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </a>
                        </Button>
                        <Button asChild size="sm">
                          <a href={`/recruiter/applies/${application.id}/cv?download=1`} download>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={`/recruiter/applies/talent/${application.talent.user.id}/cv`}
                          target="_blank"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir le CV du talent
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  {application.status !== 'ACCEPTED' && (
                    <Button
                      onClick={() => changeStatus('ACCEPTED')}
                      disabled={isUpdating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepter
                    </Button>
                  )}

                  {application.status !== 'REJECTED' && (
                    <Button
                      onClick={() => changeStatus('REJECTED')}
                      disabled={isUpdating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  )}

                  {application.status === 'PENDING' && (
                    <Button
                      onClick={() => changeStatus('REVIEWED')}
                      disabled={isUpdating}
                      variant="secondary"
                    >
                      Marquer comme lue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reçue le</span>
                  <span className="font-medium">
                    {DateTime.fromISO(application.appliedAt)
                      .setLocale('fr')
                      .toFormat('dd MMM yyyy à HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut</span>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  )
}
