import React from 'react'
import { Head, useForm, usePage, router } from '@inertiajs/react'
import RecruiterLayout from '~/layouts/recruiter_layout'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
// import { Textarea } from '~/components/ui/textarea'
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
  talent: {
    user: {
      firstname: string
      lastname: string
      email: string
      phone?: string
    }
  }
  jobOffer: { title: string }
  message?: string
  documentUrl?: string
  internalNote?: string
  status: ApplicationStatus
  appliedAt: string
  disponibleAt?: string
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
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
} as const

type StatusConfig = typeof statusConfig
type StatusKey = keyof StatusConfig

export default function ApplicationDetails() {
  const { application, flash } = usePage<PageProps>().props

  const { put, processing: statusProcessing } = useForm()

  const changeStatus = (status: ApplicationStatus) => {
    put(`/recruiter/applies/${application.id}/status`, {
      data: { status },
      preserveState: true,
      onSuccess: () => router.reload({ only: ['application'] }),
    })
  }

  const formatDate = (iso: string) => DateTime.fromISO(iso).setLocale('fr').toFormat('dd MMMM yyyy')
  const formatDateTime = (iso: string) =>
    DateTime.fromISO(iso).setLocale('fr').toFormat('dd MMM yyyy à HH:mm')

  const name = `${application.talent.user.firstname} ${application.talent.user.lastname}`
  const status = statusConfig[application.status as StatusKey]

  return (
    <RecruiterLayout>
      <Head title={`Candidature de ${name}`} />

      <div className="max-w-5xl mx-auto space-y-8">
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
                    <p className="text-sm text-gray-500 mt-1">{application.talent.user.email}</p>
                    {application.talent.user.phone && (
                      <p className="text-sm text-gray-500">{application.talent.user.phone}</p>
                    )}
                  </div>
                  <Badge className={`${status.color} text-xs px-4 py-2 border-transparent`}>
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

                {application.disponibleAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Disponible à partir du {formatDate(application.disponibleAt)}
                  </div>
                )}

                {application.documentUrl ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">CV joint</h3>
                    <div className="flex space-2">
                      <Button asChild>
                        <a
                          href={`/recruiter/applies/${application.id}/cv`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500 text-xs"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Voir le CV
                        </a>
                      </Button>

                      <Button asChild>
                        <a
                          href={`/recruiter/applies/${application.id}/cv?preview=false`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-500 text-white hover:bg-amber-500 text-xs"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Télécharger le CV
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">CV joint</h3>
                    <Button asChild>
                      <a
                        href={`/recruiter/applies/talent/${application.talent.user.id}/cv`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500 text-xs"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Voir le CV
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  {application.status !== 'ACCEPTED' && (
                    <Button
                      onClick={() => changeStatus('ACCEPTED')}
                      disabled={statusProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepter
                    </Button>
                  )}
                  {application.status !== 'REJECTED' && (
                    <Button
                      onClick={() => changeStatus('REJECTED')}
                      disabled={statusProcessing}
                      className="bg-red-500 text-white hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  )}
                  {application.status === 'PENDING' && (
                    <Button
                      onClick={() => changeStatus('REVIEWED')}
                      disabled={statusProcessing}
                      variant="secondary"
                      className="bg-amber-500 text-white hover:bg-amber-500"
                    >
                      Marquer comme lue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reçue le</span>
                  <span className="font-medium">{formatDateTime(application.appliedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut actuel</span>
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
