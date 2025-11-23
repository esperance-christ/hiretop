import TalentSkill from '#models/talent_skill'
import User from '#models/user'
import { JobOfferService } from '#services/job_offer_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class DashboardController {
  constructor(private jobOfferService: JobOfferService) {}

  async index({ request, auth, inertia }: HttpContext) {

    const filters = {
      search: request.input('search'),
      skills: request.input('skills', []),
      contractType: request.input('contractType'),
      location: request.input('location'),
      page: request.input('page', 1),
      limit: 12,
    }

    const fullUser = await User.query().where('id', auth.user!.id).preload('talentProfile').firstOrFail()

    let talentSkills: TalentSkill[] = []
    let talentProfile = fullUser.talentProfile

    if (talentProfile) {
      talentSkills = await TalentSkill.query().where('talent_id', talentProfile.id)
    }

    const { data: offers, meta } = await this.jobOfferService.getJobOffers(filters)

    return inertia.render('talent/dashboard', {
      auth: auth.user,
      talentSkills,
      offers,
      meta,
      filters,
    })
  }

}
