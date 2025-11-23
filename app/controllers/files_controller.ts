// app/controllers/files_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import Application from '#models/application'
import User from '#models/user'
import CompanyMember from '#models/company_member'

export default class FilesController {
  /**
   * Télécharger le CV d'une candidature
   * Accessible aux recruteurs ET au talent propriétaire
   */
  async downloadApplicationCv({ params, response, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const applicationId = params.id
    const preview = request.qs().preview === 'true'

    const application = await Application.query()
      .where('id', applicationId)
      .preload('talent')
      .preload('jobOffer', (q) => q.preload('company'))
      .firstOrFail()

    const isRecruiter = await CompanyMember.query()
      .where('user_id', user.id)
      .where('company_id', application.jobOffer.companyId)
      .first()

    const isOwner = application.talent.userId === user.id

    if (!isRecruiter && !isOwner) {
      return response.forbidden('Accès refusé')
    }

    const filePath = application.documentUrl
    if (!filePath || !(await drive.use().exists(filePath))) {
      return response.notFound('CV introuvable')
    }

    return this.streamFile(response, filePath, preview)
  }

  /**
   * Télécharger le CV du profil talent
   * Accessible au talent lui-même ET aux recruteurs ayant une candidature avec lui
   */
  async downloadTalentCv({ params, response, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const talentUserId = params.userId
    const preview = request.qs().preview === 'true'

    const talentUser = await User.findOrFail(talentUserId)
    await talentUser.load('talentProfile')

    if (!talentUser.talentProfile?.cvUrl) {
      return response.notFound('Aucun CV dans le profil')
    }

    const isOwner = talentUser.id === user.id
    const hasApplicationAccess = await Application.query()
      .where('talent_id', talentUser.talentProfile.id)
      .whereHas('jobOffer', (q) =>
        q.whereHas('company', (cq) => cq.whereHas('members', (mq) => mq.where('user_id', user.id)))
      )
      .first()

    if (!isOwner && !hasApplicationAccess) {
      return response.forbidden('Accès refusé')
    }

    const filePath = talentUser.talentProfile.cvUrl
    if (!(await drive.use().exists(filePath))) {
      return response.notFound('Fichier introuvable')
    }

    return this.streamFile(response, filePath, preview)
  }

  private async streamFile(response: HttpContext['response'], filePath: string, preview: boolean) {
    const fileName = filePath.split('/').pop()!
    const stream = drive.use().getStream(filePath)

    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      preview ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`
    )

    return response.stream(await stream)
  }
}
