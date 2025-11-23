import Application from '#models/application'
import Company from '#models/company'
import CompanyMember from '#models/company_member'
import JobOffer from '#models/job_offer'
import User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'

interface ApplicationFilters {
  search?: string
  company?: string[]
  status?: string
  jobOfferId?: number
  page?: number
  limit?: number
}

interface ApplicationResponse {
  data: Application[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

interface CreateApplicationData {
  jobOfferId: number
  message?: string
  document: any
  useProfileCV: boolean
  disponibility: string
}

interface verdictApplicationData {
  status: string
}

interface UpdateApplicationData extends Partial<CreateApplicationData> {}

export class ApplicationService {
  /**
   * Recuperation tous les candidatures
   * -------------------------------------
   * Uniquement pour admin pour le moment
   * @param filters Filtre si defini
   */
  async getApplications(filters: ApplicationFilters = {}): Promise<ApplicationResponse> {
    const { search = '', company = [], status = 'PUBLISHED', page = 1, limit = 20 } = filters

    const query = Application.query()
      .preload('jobOffer')
      .preload('talent')
      .where('status', status)
      .whereNull('deleted_at')

    // Rechercher ici les candidatures par nonm du candidat talent associe
    // Le nom se trouve dans le talent.user.name (On va utiliser la relation talent et user)
    if (search) {
      query.whereHas('talent', (talentQuery) => {
        talentQuery.whereHas('user', (userQuery) => {
          userQuery.where('firstname', 'like', `%${search}%`)
          userQuery.orWhere('lastname', 'like', `%${search}%`)
        })
      })
    }

    if (company && company.length > 0) {
      query.whereIn('company_id', company)
    }

    const result = await query.paginate(page, limit)

    return {
      data: result.all(),
      meta: result.getMeta(),
    }
  }

  /**
   * Récupérer toutes les offres actives de l'entreprise
   */
  async getJobOffersByCompany(companyId: number) {
    return JobOffer.query()
      .where('company_id', companyId)
      .whereNull('closed_at')
      .whereNull('deleted_at')
      .select('id', 'title')
      .orderBy('created_at', 'desc')
  }

  /**
   * Recuperation des candidatures pour une entreprise
   * @param filters Filtre si defini
   * @param companyId ID de l'entreprise
   * @param talentId ID du talent
   */
  async getApplicationsBy(
    filters: ApplicationFilters = {},
    company: Company | null,
    user: User | null
  ): Promise<ApplicationResponse> {
    const { status, page = 1, limit = 20 } = filters

    const query = Application.query()
      .preload('jobOffer', (q) => q.preload('company'))
      .preload('talent', (q) => q.preload('user'))
      .whereNull('deleted_at')

    // Appliquer filtre status seulement si défini
    if (status && status.trim() !== '') {
      query.where('status', status)
    }

    if (company?.id) {
      query.where('company_id', company.id)
    }

    if (user?.id) {
      const isTalent = await user.hasRole('TALENT')

      if (isTalent) {
        await user.load('talentProfile')

        if (!user.talentProfile?.id) {
          return {
            data: [],
            meta: {
              total: 0,
              perPage: limit,
              currentPage: page,
              lastPage: 1,
            },
          }
        }

        query.where('talent_id', user.talentProfile.id)
      }
    }

    if (filters.jobOfferId) {
      query.where('job_offer_id', filters.jobOfferId)
    }

    const result = await query.paginate(page, limit)

    return {
      data: result.all(),
      meta: result.getMeta(),
    }
  }

  /**
   * Postuler une offre d'emploi/job
   * ---------------------------------------------------
   * Ceci n'est possible que par les Talents
   * @param data Données à creer
   * @param userId ID de l'utilisateur connecte qui effectue l'operation
   */
  async applyJob(userId: number, data: CreateApplicationData): Promise<Application> {
    const { jobOfferId, message, document, useProfileCV, disponibility } = data

    const job = await JobOffer.query()
      .where('id', jobOfferId)
      .whereNull('deleted_at')
      .preload('company')
      .firstOrFail()

    const user = await User.query().where('id', userId).preload('talentProfile').firstOrFail()

    if (!user.hasRole('TALENT')) {
      throw new Error("Vous n'êtes pas autorisé à postuler")
    }

    if (!user.talentProfile?.id) {
      throw new Error('Vous devez compléter votre profil talent avant de postuler')
    }

    const talentId = user.talentProfile.id

    const applyExist = await Application.query()
      .where('job_offer_id', jobOfferId)
      .where('talent_id', talentId)
      .first()

    if (applyExist) {
      throw new Error('Vous avez déjà postulé à cette offre')
    }

    const newApplication = new Application()
    newApplication.talentId = talentId
    newApplication.jobOfferId = job.id
    newApplication.companyId = job.companyId
    newApplication.message = message || null

    if (useProfileCV === true && user.talentProfile.cvUrl) {
      newApplication.documentUrl = user.talentProfile.cvUrl
    }

    if (useProfileCV === false && document) {
      const fileName = `${cuid()}.${document.extname}`
      await document.moveToDisk('cvs', { name: fileName })
      newApplication.documentUrl = await drive.use().getUrl(`cvs/${fileName}`)
    }

    if (disponibility) {
      newApplication.disponibleAt = DateTime.fromISO(disponibility)
    }

    await newApplication.save()
    return newApplication
  }

  /**
   * Récuperer une candidature
   * @param applicationId Id de la candidature
   */
  async getApplication(applicationId: number) {
    return Application.query()
      .where('id', applicationId)
      .preload('talent', (q) => q.preload('user'))
      .preload('jobOffer', (q) => q.preload('company'))
      .firstOrFail()
  }

  /**
   * Marquer une candidature comme accepte ou rejete
   * @param applicationId
   */
  async confirmOrRevokeApply(applicationId: number, data: verdictApplicationData, userId: number) {
    const application = await Application.query()
      .where('id', applicationId)
      .whereNull('deleted_at')
      .preload('jobOffer', (q) => q.preload('company'))
      .preload('talent', (q) => q.preload('user'))
      .firstOrFail()

    const isMember = await CompanyMember.query()
      .where('user_id', userId)
      .where('company_id', application.companyId)
      .first()

    if (!isMember) throw new Error('Vous ne pouvez pas faire cette opération')

    application.status = data.status
    await application.save()

    if (data.status === 'ACCEPTED') {
      await mail.send((message) => {
        message
          .to(application.talent.user.email)
          .subject('Candidature acceptée')
          .htmlView('emails/apply_approved', { job: application.jobOffer })
      })
    }

    return application
  }

  /**
   * Modifier une candidature (seul le talent peut faire cette action)
   * @param applicationId
   */
  async updateApplication(applicationId: number, userId: number, payload: UpdateApplicationData) {
    console.log(applicationId, userId, payload)
    const application = await Application.findBy('id', applicationId)
    const user = await User.query().where('id', userId).preload('talentProfile').first()
    if (!application) {
      throw new Exception('Candidature introuvable', { status: 404 })
    }

    if (!user?.talentProfile.id) {
      throw new Exception('Vous devez avoir un profil talent pour modifier cette candidature', {
        status: 403,
      })
    }

    if (application.talentId !== user?.talentProfile.id) {
      throw new Exception('Vous ne pouvez pas modifier cette candidature', { status: 403 })
    }

    application.merge({
      message: payload.message,
    })

    if (payload.useProfileCV && payload.disponibility) {
      application.disponibleAt = DateTime.fromISO(payload.disponibility)
    }

    if (payload.useProfileCV === false && payload.document) {
      const fileName = `${cuid()}.${payload.document.extname}`
      await payload.document.moveToDisk('cvs', { name: fileName })
      application.documentUrl = await drive.use().getUrl(`cvs/${fileName}`)
    }

    await application.save()
    return application
  }

  async deleteApplication(applicationId: number, userId: number) {
    const application = await Application.find(applicationId)
    const talent = await User.query().where('id', userId).preload('talentProfile').firstOrFail()
    if (!application) {
      throw new Exception('Candidature introuvable', { status: 404 })
    }

    if (application.talentId !== talent.id) {
      throw new Exception('Vous ne pouvez pas modifier cette candidature', { status: 403 })
    }

    if (application.talentId !== talent.id) {
      throw new Exception('Vous ne pouvez pas supprimer cette candidature', { status: 403 })
    }

    application.deletedAt = DateTime.now()
    await application.save()
    return true
  }
}
