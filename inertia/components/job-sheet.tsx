import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { usePage, router } from '@inertiajs/react'
import { number } from 'zod'

interface JobApplySheetProps {
  jobId: number
  alreadyApplied: boolean
  application?: any
}

export default function JobApplySheet({ jobId, alreadyApplied, application }: JobApplySheetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState(application?.message ?? '')
  const [document, setDocument] = useState<File | null>(null)
  const [useProfileCV, setUseProfileCV] = useState(true)
  const [disponibility, setDisponibility] = useState(application?.disponibleAt ?? '')

  console.log('Candidature', application)

  useEffect(() => {
    if (alreadyApplied && application) {
      setMessage(application?.message ?? '')
      setDisponibility(application?.disponibleAt ?? '')
      setUseProfileCV(application?.documentUrl === application?.talent?.profileCvUrl)
    }
  }, [alreadyApplied, application])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    if (alreadyApplied) {
      formData.append('_method', 'PUT')
    }

    formData.append('jobOfferId', String(jobId))
    formData.append('message', message)
    formData.append('useProfileCV', String(useProfileCV))
    formData.append('disponibility', disponibility)

    if (!useProfileCV && document) {
      formData.append('document', document)
    }

    const url = alreadyApplied ? `/talent/apply/${application.id}` : `/talent/apply`

    if (alreadyApplied) {
      router.put(url, formData, {
        forceFormData: true,
        preserveState: true,

        onSuccess: () => {
          setLoading(false)
          setOpen(false)
          router.reload()
        },

        onError: () => {
          setLoading(false)
        },
      })
    } else {
      router.post(url, formData, {
        forceFormData: true,
        preserveState: true,

        onSuccess: () => {
          setLoading(false)
          setOpen(false)
          router.reload()
        },

        onError: () => {
          setLoading(false)
        },
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className={
            alreadyApplied
              ? 'border border-green-600 text-green-600 bg-transparent hover:text-white hover:bg-green-600'
              : 'border border-green-600 bg-green-600 text-white hover:bg-transparent hover:text-green-600'
          }
        >
          {alreadyApplied ? 'Modifier ma candidature' : 'Postuler maintenant'}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="job-side"
        className="p-8 overflow-y-auto bg-white/95 backdrop-blur-md border-l border-gray-200"
      >
        <h2 className="text-xl font-bold mb-6">
          {alreadyApplied ? 'Modifier votre candidature' : 'Postuler à l’offre'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message au recruteur"
              className="mt-2"
              rows={8}
            />
          </div>

          <div>
            <Label>CV à utiliser</Label>

            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useProfileCV === true}
                  onChange={() => setUseProfileCV(true)}
                />
                CV du profil
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useProfileCV === false}
                  onChange={() => setUseProfileCV(false)}
                />
                Importer un CV
              </label>
            </div>

            {alreadyApplied && application?.documentUrl && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-semibold">CV actuel : </span>
                <a
                  href={application.documentUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Voir le document
                </a>
              </div>
            )}

            {!useProfileCV && (
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files && setDocument(e.target.files[0])}
                className="mt-2"
              />
            )}
          </div>

          <div>
            <Label htmlFor="disponibility">Date de disponibilité</Label>
            <Input
              type="date"
              id="disponibility"
              value={disponibility}
              onChange={(e) => setDisponibility(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="border border-green-600 bg-green-600 text-white hover:bg-transparent hover:text-green-600"
            >
              {loading
                ? 'Veuillez patienter...'
                : alreadyApplied
                  ? 'Modifier ma candidature'
                  : 'Envoyer ma candidature'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
