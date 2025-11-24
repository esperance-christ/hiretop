// app/controllers/posts_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import { JobOfferService } from '#services/job_offer_service'
import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import { createJobValidator } from '#validators/create_job'
import { updateJobValidator } from '#validators/update_job'
import Skill from '#models/skill'
import CompanyMember from '#models/company_member' // ← Ajouté
import { Exception } from '@adonisjs/core/exceptions'

@inject()
export default class PostsController {
  constructor(private jobOfferService: JobOfferService) {}

  /**
   * Récupère l'ID de l'entreprise de l'utilisateur connecté
   */
  private async getUserCompanyId(userId: number): Promise<number> {
    const member = await CompanyMember.query()
      .where('user_id', userId)
      .select('company_id')
      .firstOrFail()

    return member.companyId
  }

  /**
   * Liste des offres de l'entreprise
   */
  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)

    const companyId = await this.getUserCompanyId(user.id)

    const { data: jobs, meta } = await this.jobOfferService.getJobOfferByCompany(
      { page, limit: 10 },
      companyId
    )

    return inertia.render('recruiter/posts/index', {
      jobs: jobs.map((j) => j.serialize()),
      meta,
    })
  }

  /**
   * Afficher le détail d'une offre
   */
  async show({ auth, params, inertia }: HttpContext) {
    const jobId = Number(params.id)
    const user = auth.getUserOrFail()

    const job = await this.jobOfferService.getJobOffer(jobId)
    const companyId = await this.getUserCompanyId(user.id)

    if (companyId !== job.companyId) {
      throw new Exception('Vous ne pouvez pas acceder a ce contenue', { status: 403 })
    }

    const skills = await Skill.all()

    return inertia.render('recruiter/posts/show', {
      job: job.serialize(),
      skills
    })
  }

  /**
   * Page de création
   */
  async create({ inertia }: HttpContext) {
    const skills = await Skill.all()
    return inertia.render('recruiter/posts/create', { skills })
  }

  /**
   * Créer une offre
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createJobValidator)

    try {
      await this.jobOfferService.createJobOffer(user.id, {
        ...data,
        expireAt: data.expireAt ? DateTime.fromISO(String(data.expireAt)).toISO()! : undefined,
      })

      session.flash('job', { type: 'success', message: 'Offre publiée avec succès !' })
      return response.redirect().toRoute('recruiter.posts.index')
    } catch (error) {
      session.flash('errors', { type: 'error', form: error.message || 'Erreur lors de la création' })
      return response.redirect().back()
    }
  }

  /**
   * Mettre à jour une offre
   */
  async update({ auth, params, inertia, request, response, session }: HttpContext) {
    const jobId = Number(params.id)
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateJobValidator)

    console.log(data)
    try {
      const job = await this.jobOfferService.getJobOffer(jobId)
      const companyId = await this.getUserCompanyId(user.id)

      if (companyId !== job.companyId) {
        throw new Exception('Vous ne pouvez pas acceder a ce contenue', { status: 403 })
      }

      await this.jobOfferService.updateJobOffer(
        jobId,
        {
          ...data,
          expireAt: data.expireAt ? DateTime.fromISO(String(data.expireAt)).toISO()! : undefined,
        },
        user.id
      )

      session.flash('job', { type: 'success', message: 'Offre mise à jour avec succès' })
      return response.redirect().back()
    } catch (error) {
      session.flash('errors', { form: error.message })
      return response.redirect().back()
    }
  }

  /**
   * Supprimer une offre
   */
  async delete({ auth, params, inertia, response, session }: HttpContext) {
    const jobId = Number(params.id)
    const user = auth.getUserOrFail()

    try {
      const job = await this.jobOfferService.getJobOffer(jobId)
      const companyId = await this.getUserCompanyId(user.id)

      if (companyId !== job.companyId) {
        throw new Exception('Vous ne pouvez pas acceder a ce contenue', { status: 403 })
      }

      await this.jobOfferService.deleteJobOffer(user.id, jobId)

      session.flash('job', { type: 'success', message: 'Offre supprimée avec succès' })
      return response.redirect().toRoute('recruiter.posts.index')
    } catch (error) {
      session.flash('error', error.message || 'Impossible de supprimer cette offre')
      return response.redirect().back()
    }
  }

  /**
   * Clôturer une offre
   */
  async close({ auth, params, inertia, response, session }: HttpContext) {
    const jobId = Number(params.id)
    const user = auth.getUserOrFail()

    try {
      const job = await this.jobOfferService.getJobOffer(jobId)
      const companyId = await this.getUserCompanyId(user.id)

      if (companyId !== job.companyId) {
        throw new Exception('Vous ne pouvez pas acceder a ce contenue', { status: 403 })
      }

      await this.jobOfferService.closeJobOffer(user.id, jobId)

      session.flash('job', { type: 'success', message: 'Offre clôturée avec succès' })
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Impossible de clôturer cette offre')
      return response.redirect().back()
    }
  }
}
