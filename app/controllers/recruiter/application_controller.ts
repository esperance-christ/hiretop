import type { HttpContext } from '@adonisjs/core/http'
import { ApplicationService } from '#services/application_service'
import { inject } from '@adonisjs/core'
import CompanyMember from '#models/company_member'
import Application from '#models/application'

@inject()
export default class ApplicationsController {
  constructor(private applicationService: ApplicationService) {}

  /**
   * Récupérer l'ID de l'entreprise de l'utilisateur connecté
   */
  private async getCompanyId(userId: number): Promise<number> {
    const member = await CompanyMember.query()
      .where('user_id', userId)
      .select('company_id')
      .firstOrFail()

    return member.companyId
  }

  /**
   * Liste des candidatures pour l'entreprise du recruteur
   */
  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const companyId = await this.getCompanyId(user.id)

    const page = Number(request.input('page', 1))
    const search = request.input('search', '').trim()
    const status = request.input('status', '')
    const jobOfferId = request.input('job_offer_id')

    const { data: applications, meta } = await this.applicationService.getApplicationsBy(
      {
        page,
        limit: 15,
        search,
        status: status || undefined,
        ...(jobOfferId && { jobOfferId: Number(jobOfferId) }),
      },
      { id: companyId } as any,
      null
    )

    // Charger les offres pour le filtre
    const jobOffers = await this.applicationService.getJobOffersByCompany(companyId)

    return inertia.render('recruiter/applications/index', {
      applications: applications.map(a => a.serialize()),
      meta,
      filters: { search, status, jobOfferId },
      jobOffers: jobOffers.map(j => ({ id: j.id, title: j.title })),
    })
  }

  /**
   * Détail d'une candidature
   */
  async show({ params, inertia, auth }: HttpContext) {
    const applicationId = Number(params.id)
    const user = auth.getUserOrFail()
    const companyId = await this.getCompanyId(user.id)

    const application = await this.applicationService.getApplication(applicationId)

    if (application.companyId !== companyId) {
      return inertia.render('errors/403')
    }

    return inertia.render('recruiter/applications/show', {
      application: application.serialize({
        relations: {
          talent: { relations: { user: {} } },
          jobOffer: { relations: { company: {} } },
        },
      }),
    })
  }

  /**
   * Changer le statut d'une candidature
   */
  async updateStatus({ params, request, response, session, auth }: HttpContext) {
    const applicationId = Number(params.id)
    const { status } = request.only(['status'])
    const user = auth.getUserOrFail()

    if (!['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      session.flash('error', 'Statut invalide')
      return response.redirect().back()
    }

    try {
      await this.applicationService.confirmOrRevokeApply(applicationId, { status }, user.id)
      session.flash('success', `Candidature marquée comme ${status === 'ACCEPTED' ? 'acceptée' : status === 'REJECTED' ? 'rejetée' : 'en cours de traitement'}`)
    } catch (error) {
      session.flash('error', error.message || 'Action impossible')
    }

    return response.redirect().back()
  }

}
