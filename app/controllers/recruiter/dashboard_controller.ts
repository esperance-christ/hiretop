import Application from '#models/application'
import CompanyMember from '#models/company_member'
import JobOffer from '#models/job_offer'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const company = await user.company

    const stats = {
      totalApplications: await Application.query()
        .where('company_id', company.id)
        .count('* as total'),
      totalPosts: await JobOffer.query().where('company_id', company.id).count('* as total'),
      acceptedApplications: await Application.query()
        .where('company_id', company.id)
        .where('status', 'ACCEPTED')
        .count('* as total'),
      membersCount: await CompanyMember.query().where('company_id', company.id).count('* as total'),
    }

    const latestPosts = await JobOffer.query()
      .where('company_id', company.id)
      .orderBy('created_at', 'desc')
      .limit(5)

    const latestApplications = await Application.query()
      .where('company_id', company.id)
      .preload('talent')
      .orderBy('created_at', 'desc')
      .limit(5)

    return inertia.render('recruiter/dashboard', {
      stats,
      latestPosts,
      latestApplications,
    })
  }
}
