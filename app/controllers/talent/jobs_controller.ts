import Application from '#models/application'
import User from '#models/user'
import { JobOfferService } from '#services/job_offer_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class JobsController {
  constructor(private jobService: JobOfferService) {}

  async show({ params, auth, inertia }: HttpContext) {
    const jobId = Number(params.id)
    const user = auth.user

    const userQuery = await User.query()
      .where('id', user!.id)
      .preload('talentProfile')
      .firstOrFail()

    const job = await this.jobService.getJobOffer(jobId)

    if (!job) {
      return inertia.render('errors/NotFound', { message: 'Offre introuvable' })
    }

    let alreadyApplied = false
    let applicationStatus = null
    let appliedAt = null
    let application = null

    if (user) {
      const applicationData = await Application.query()
        .where('job_offer_id', jobId)
        .where('talent_id', userQuery.talentProfile.id)
        .first()
      if (applicationData) {
        alreadyApplied = true
        application = applicationData
        applicationStatus = applicationData.status
        appliedAt = applicationData.createdAt
      }
    }

    return inertia.render('talent/job/job-details', {
      job,
      alreadyApplied,
      application,
      applicationStatus,
      appliedAt,
    })
  }
}
