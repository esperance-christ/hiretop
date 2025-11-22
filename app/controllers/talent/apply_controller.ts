import User from '#models/user'
import { ApplicationService } from '#services/application_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ApplyController {
  constructor(private applicationService: ApplicationService) {}

  async show({ auth, request, inertia }: HttpContext) {
    const filters = {
      search: request.input('search'),
      from: request.input('from'),
      to: request.input('to'),
      page: Number(request.input('page', 1)),
      limit: 12,
    }

    const user = auth.user!
    const { data: applications, meta } = await this.applicationService.getApplicationsBy(
      filters,
      null,
      user
    )

    console.log(applications)

    return inertia.render('talent/applies', {
      applications,
      meta,
      filters,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    const data = request.only([
      'jobOfferId',
      'message',
      'document',
      'useProfileCV',
      'disponibility',
    ])
    data.document = request.file('document')

    try {
      await this.applicationService.applyJob(user.id, data)
      session.flash('notification', {
        type: 'success',
        message: 'Candidature envoyée avec succès.',
      })
    } catch (error) {
      session.flash('notification', { type: 'error', message: error.message })
    }

    return response.redirect().back()
  }

  async update({ auth, request, response, session, params }: HttpContext) {
    const user = auth.user!
    const applicationId = Number(params.id)
    const data = request.only(['message', 'useProfileCV', 'document', 'disponibility'])
    data.document = request.file('document')

    try {
      await this.applicationService.updateApplication(applicationId, user.id, data)
      session.flash('notification', {
        type: 'info',
        message: 'Candidature mise à jour avec succès.',
      })
    } catch (error) {
      session.flash('notification', { type: 'error', message: error.message })
    }

    return response.redirect().back()
  }

  async delete({ auth, response, session, params }: HttpContext) {
    const user = auth.user!
    const applicationId = Number(params.id)

    try {
      await this.applicationService.deleteApplication(applicationId, user.id)
      session.flash('info', {
        type: 'success',
        message: 'Candidature supprimée avec succès.',
      })
    } catch (error) {
      session.flash('notification', { type: 'error', message: error.message })
    }

    return response.redirect().back()
  }
}
