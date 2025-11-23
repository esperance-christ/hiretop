import Application from '#models/application'
import Company from '#models/company'
import CompanyMember from '#models/company_member'
import JobOffer from '#models/job_offer'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ request, auth, inertia }: HttpContext) {
    const user = auth.user!

    // Verifier si l'utilisateur est associe a une entreprise
    const companyMember = await CompanyMember.query().where('user_id', user.id).first()
    if (!companyMember) throw new Error("Vous n'etes associe a aucune entreprise")

    const company = await Company.query().where('id', companyMember.companyId).first()
    if (!company) throw new Error('Entreprise non trouvee')

    const totalApplicationsRow = await Application.query()
      .where('company_id', company.id)
      .count('* as total')
      .first()
    const totalPostsRow = await JobOffer.query()
      .where('company_id', company.id)
      .count('* as total')
      .first()
    const acceptedApplicationsRow = await Application.query()
      .where('company_id', company.id)
      .where('status', 'ACCEPTED')
      .count('* as total')
      .first()
    const membersCountRow = await CompanyMember.query()
      .where('company_id', company.id)
      .count('* as total')
      .first()

    const latestPosts = await JobOffer.query()
      .where('company_id', company.id)
      .orderBy('created_at', 'desc')
      .limit(5)

    const latestApplications = await Application.query()
      .where('company_id', company.id)
      .preload('talent', (talentQuery) => {
        talentQuery.preload('user')
      })
      .preload('jobOffer')
      .orderBy('created_at', 'desc')
      .limit(5)


    return inertia.render('recruiter/dashboard', {
      auth: auth.user,
      companyName: company.name || null,
      stats: {
        totalApplications: Number(totalApplicationsRow?.$extras.total ?? 0),
        totalPosts: Number(totalPostsRow?.$extras.total ?? 0),
        acceptedApplications: Number(acceptedApplicationsRow?.$extras.total ?? 0),
        membersCount: Number(membersCountRow?.$extras.total ?? 0),
      },
      latestPosts: latestPosts.map((p) => p.serialize()),
      latestApplications: latestApplications.map((a) => a.serialize()),
    })
  }
}
