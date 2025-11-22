import { Head, usePage, Link } from '@inertiajs/react'
import { DateTime } from 'luxon'
import { Badge } from '~/components/ui/badge'
import { Card, CardHeader, CardContent } from '~/components/ui/card'
import { ArrowLeft } from 'lucide-react'

import RichTextEditor from '~/components/rich-text-editor'
import MainLayout from '~/layouts/main_layout'
import JobApplySheet from '~/components/job-sheet'

const JobDetails = () => {
  const { flash, job, application, alreadyApplied, applicationStatus, appliedAt } =
    usePage<PageProps>().props

  const postedAgo = DateTime.fromISO(job.createdAt).isValid
    ? DateTime.fromISO(job.createdAt).toRelative({ locale: 'fr' })
    : 'il y a quelque temps'

  const appliedAtFormatted =
    appliedAt && DateTime.fromISO(appliedAt).isValid
      ? DateTime.fromISO(appliedAt).toLocaleString(DateTime.DATE_FULL)
      : null

  const renderStatusBadge = () => {
    if (!alreadyApplied) return null

    const statuses: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      sent: { label: 'Candidature envoyée', variant: 'outline' },
      reviewing: { label: 'En cours de revue', variant: 'secondary' },
      accepted: { label: 'Acceptée', variant: 'default' },
      rejected: { label: 'Refusée', variant: 'destructive' },
    }

    const status = statuses[applicationStatus] ?? statuses.sent
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  return (
    <MainLayout>
      {flash?.message && (
        <div className="bg-green-100 text-green-800 p-3 text-center text-sm">{flash.message}</div>
      )}
      {flash?.error && (
        <div className="bg-red-100 text-red-800 p-3 text-center text-sm">{flash.error}</div>
      )}
      <Head title={job.title} />

      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <Link
          href="/talent/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>

        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

            <div className="flex gap-3 mt-3">
              <Badge className="bg-orange-100 text-orange-700 text-xs">{job.contractType}</Badge>
              <Badge variant="secondary">{job.location}</Badge>
              <Badge variant="outline">
                ${job.salaryMin} – ${job.salaryMax}
              </Badge>

              {renderStatusBadge()}
            </div>

            <p className="text-sm text-gray-500 mt-2">Publié {postedAgo}</p>

            {alreadyApplied && appliedAtFormatted && (
              <p className="text-sm text-blue-600 mt-1">
                Candidature envoyée le {appliedAtFormatted}
              </p>
            )}
          </div>

          <JobApplySheet jobId={job.id} alreadyApplied={alreadyApplied} application={application} />
        </div>

        <Card className="shadow-sm border rounded-2xl">
          <CardHeader>
            <h2 className="text-xl font-semibold">Description du poste</h2>
          </CardHeader>

          <CardContent>
            <RichTextEditor value={job.description} editable={false} />
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Compétences requises</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill: any) => (
              <Badge key={skill.id} variant="outline" className="text-xs p-2">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default JobDetails
