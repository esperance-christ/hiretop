import CompanyMember from '#models/company_member'
import JobOffer from '#models/job_offer'
import User from '#models/user'
import { DateTime } from 'luxon'

interface JobFilters {
  search?: string
  skills?: string[]
  contractType?: string
  location?: string
  status?: string
  page?: number
  limit?: number
}

interface JobResponse {
  data: JobOffer[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

interface CreateJobData {
  title: string
  description: string
  location?: string | null
  onRemote?: string | null
  contractType: 'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP'
  skillIds?: number[]
  salaryMin?: number
  salaryMax?: number
  isUrgent?: boolean
  expireAt?: string
}

interface UpdateJobData extends Partial<CreateJobData> {}

export class JobOfferService {
  /**
   * Recuperation tous les offres d'emploi/jobs
   * @param filters Filtre si defini
   */
  async getJobOffers(filters: JobFilters = {}): Promise<JobResponse> {
    const { search = '', skills = [], contractType, location, page = 1, limit = 12 } = filters

    const query = JobOffer.query()
      .preload('company')
      .preload('skills')
      .where('status', 'PUBLISHED')
      .whereNull('deleted_at')
      .where('is_active', true)

    if (search) {
      query.where((q) => {
        q.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`)
      })
    }

    if (contractType) query.where('contract_type', contractType)
    if (location) query.whereILike('location', `%${location}%`)

    if (skills.length > 0) {
      query.whereHas('skills', (skillQuery) => {
        skillQuery.whereIn('name', skills)
      })
    }

    const result = await query.paginate(page, limit)

    return {
      data: result.all(),
      meta: result.getMeta(),
    }
  }

  /**
   * Recuperation tous les offres d'emploi/jobs par id entreprise
   * @param filters Filtre si defini
   */
  async getJobOfferByCompany(filters: JobFilters = {}, companyId: number): Promise<JobResponse> {
    const { search = '', skills = [], contractType, location, page = 1, limit = 20 } = filters

    const query = JobOffer.query()
      .preload('company')
      .preload('skills')
      .where('company_id', companyId)
      .withCount('applications')
      .orderBy('created_at', 'desc')
      .where('status', 'PUBLISHED')
      .whereNull('deleted_at')
      .where('is_active', true)

    if (search) {
      query.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`)
    }

    if (contractType) {
      query.where('contract_type', contractType)
    }

    if (location) {
      query.whereILike('location', `%${location}%`)
    }

    if (skills.length > 0) {
      query.whereHas('skills', (skillQuery) => {
        skillQuery.whereIn('name', skills)
      })
    }

    const result = await query.paginate(page, limit)

    return {
      data: result.all(),
      meta: result.getMeta(),
    }
  }

  /**
   * Créer une offre d'emploi/job
   * ---------------------------------------------------
   * Ceci n'est possible que par les entrprise
   * @param data Données à creer
   * @param userId ID de l'utilisateur conectee qui effectue l'operation
   */
  async createJobOffer(userId: number, data: CreateJobData): Promise<JobOffer> {
    const companyMember = await CompanyMember.query()
      .where('user_id', userId)
      .preload('company')
      .firstOrFail()
    const expireAt = data.expireAt
      ? DateTime.fromISO(data.expireAt)
      : DateTime.now().plus({ months: 1 })

    const job = await JobOffer.create({
      companyId: companyMember.company.id,
      title: data.title,
      description: data.description,
      location: data.location,
      contractType: data.contractType || 'INTERNSHIP',
      status: 'PUBLISHED',
      isActive: true,
      isUrgent: data.isUrgent ?? false,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      publishedAt: DateTime.now(),
      expireAt,
    })

    if (data.skillIds) {
      await job.related('skills').attach(data.skillIds)
    }

    return job
  }

  /**
   * Récuperer une offre d'emploi /Job par son ID
   * @param jobId Id de l'offre/job
   */
  async getJobOffer(jobId: number) {
    return JobOffer.query()
      .where('id', jobId)
      .preload('skills')
      .preload('company')
      .preload('applications')
      .firstOrFail()
  }

  /**
   * Mise à jour des informations du profil talent
   * @param jobId ID du profil talent
   * @param data Données à mettre à jour
   * @param userId ID de l'utilisateur
   */
  async updateJobOffer(jobId: number, data: UpdateJobData, userId: number): Promise<JobOffer> {
    const job = await JobOffer.query().where('id', jobId).preload('company').firstOrFail()

    const member = await CompanyMember.query()
      .where('user_id', userId)
      .where('company_id', job.company.id)
      .firstOrFail()

    if (!member) {
      throw new Error("Vous n'etes pas autorise a effectue cette action")
    }

    // Mise à jour champs simples
    if (data.title !== undefined) job.title = data.title
    if (data.description !== undefined) job.description = data.description
    if (data.location !== undefined) job.location = data.location
    if (data.contractType !== undefined) job.contractType = data.contractType
    if (data.salaryMin !== undefined) job.salaryMin = data.salaryMin
    if (data.salaryMax !== undefined) job.salaryMax = data.salaryMax
    if (data.isUrgent !== undefined) job.isUrgent = data.isUrgent
    if (data.expireAt !== undefined) {
      job.expireAt = DateTime.fromISO(data.expireAt)
    }

    //  Mise à jour des competences
    if (data.skillIds !== undefined) {
      await job.related('skills').sync(data.skillIds)
    }

    await job.save()
    await job.load('skills')
    await job.load('company')

    return job
  }

  /**
   * Supprimer une offre d'emploi/job (soft delete)
   * ----------------------------------------------
   * Seul l'entreprise ayant creer l'offre peut effectuer cette action
   */
  async deleteJobOffer(userId: number, jobId: number): Promise<void> {
    const user = await User.query().where('id', userId).preload('company').firstOrFail()

    const job = await JobOffer.query().where('id', jobId).preload('company').firstOrFail()

    // Verifier si l'utilisateur connecte est autorisé
    if (user.company.id != job.company.id) {
      throw new Error("Vous n'etes pas autorise a effectuer cette action.")
    }

    job.deletedAt = DateTime.now()
    await job.save()
  }

  /**
   * Clôturer une offre ou Marquer une offre comme close
   */
  async closeJobOffer(userId: number, jobId: number): Promise<JobOffer> {
    const user = await User.query().where('id', userId).firstOrFail()

    const job = await JobOffer.query().where('id', jobId).preload('company').firstOrFail()

    // Verifier si l'utilisateur connecte est autorisé
    if (user.company.id != job.company.id) {
      throw new Error("Vous n'etes pas autorise a effectuer cette action.")
    }

    job.status = 'CLOSED'
    job.isActive = false
    await job.save()

    return job
  }
}
