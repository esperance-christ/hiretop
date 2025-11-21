import TalentProfile from '#models/talent_profile'
import User from '#models/user'
import Skill from '#models/skill'
import TalentEducation from '#models/talent_education'
import TalentExperience from '#models/talent_experience'
import TalentSkill from '#models/talent_skill'
// import { cuid } from '@adonisjs/core/helpers'
// import drive from '@adonisjs/drive/services/main'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { deleteFile, uploadFile } from '#helpers/fileUploader'

interface TalentFilters {
  search?: string
  skills?: string[]
  location?: string
  page?: number
  limit?: number
}

interface UpdateTalentData {
  phone?: string | null
  title?: string | null
  bio?: string | null
  location?: string | null
  isAvailable?: string | null
  linkedinUrl?: string | null
  githubUrl?: string | null
  cv?: MultipartFile | null
  skills?: { skillId: number; level?: number }[]
  experiences?: {
    id?: number
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string | null
    current?: boolean
    description?: string
  }[]
  educations?: {
    id?: number
    school: string
    degree: string
    field: string
    startDate: string
    endDate?: string | null
    current?: boolean
  }[]
}

export class TalentService {
  /**
   * Chargement manuel des relations
   */
  private async loadTalentRelations(talent: TalentProfile) {
    const user = await User.find(talent.userId)

    const skillsPivot = await TalentSkill.query()
      .where('talent_id', talent.id)
      .select(['id', 'talent_id', 'skill_id', 'level', 'is_validated'])

    const skillIds = skillsPivot.map((s) => s.skill_id)

    const skills = skillIds.length ? await Skill.query().whereIn('id', skillIds) : []

    const skillsWithPivot = skills.map((skill) => {
      const pivot = skillsPivot.find((p) => p.skill_id === skill.id)
      return {
        ...skill.toJSON(),
        pivot: {
          level: pivot?.level ?? 1,
          is_validated: pivot?.is_validated ?? false,
        },
      }
    })

    const experiences = await TalentExperience.query()
      .where('talent_id', talent.id)
      .orderBy('start_date', 'desc')

    const educations = await TalentEducation.query()
      .where('talent_id', talent.id)
      .orderBy('start_date', 'desc')

    return {
      user,
      skills: skillsWithPivot,
      experiences,
      educations,
    }
  }

  /**
   * Récupération multiple sans preload
   */
  async getTalents(filters: TalentFilters = {}) {
    const { search = '', skills = [], location = '', page = 1, limit = 20 } = filters

    const query = TalentProfile.query().whereNull('deleted_at')

    if (search) {
      query.whereILike('title', `%${search}%`).orWhereILike('bio', `%${search}%`)
    }

    if (location) {
      query.whereILike('location', `%${location}%`)
    }

    // On filtre juste les talent_ids via pivot
    if (skills.length > 0) {
      const matching = await TalentSkill.query().whereIn('skill_id', skills).select('talent_id')

      const ids = matching.map((m) => m.talent_id)

      if (ids.length === 0)
        return { data: [], meta: { total: 0, per_page: limit, current_page: page, last_page: 1 } }

      query.whereIn('id', ids)
    }

    const result = await query.paginate(page, limit)

    const data = []
    for (const talent of result.all()) {
      const relations = await this.loadTalentRelations(talent)
      data.push({
        ...talent.toJSON(),
        ...relations,
      })
    }

    return {
      data,
      meta: result.getMeta(),
    }
  }

  /**
   * Récupération d'un talent (sans preload)
   */
  async getTalent(talentId: number) {
    const talent = await TalentProfile.find(talentId)
    if (!talent) return null

    const relations = await this.loadTalentRelations(talent)

    return {
      ...talent.toJSON(),
      ...relations,
    }
  }

  /**
   * Création du profil talent
   */
  async createTalent(userId: number, data: UpdateTalentData) {
    const talentProfile = await TalentProfile.create({
      userId,
      phone: data.phone ?? null,
      title: data.title ?? '',
      bio: data.bio ?? '',
      location: data.location ?? '',
      isAvailable: data.isAvailable ?? 'no',
      linkedinUrl: data.linkedinUrl ?? '',
      githubUrl: data.githubUrl ?? '',
    })

    if (data.cv) {
      const { url, path } = await uploadFile(data.cv, 'cvs')
      talentProfile.cvUrl = url
      talentProfile.cvPath = path
      await talentProfile.save()
    }

    // Skills
    if (data.skills?.length) {
      for (const s of data.skills) {
        await TalentSkill.create({
          talent_id: talentProfile.id,
          skill_id: s.skillId,
          level: s.level ?? 1,
          is_validated: false,
        })
      }
    }

    // Experiences
    if (data.experiences?.length) {
      for (const exp of data.experiences) {
        await TalentExperience.create({
          talent_id: talentProfile.id,
          job_title: exp.title ?? '', // ← valeur par défaut
          company_name: exp.company ?? '', // ← valeur par défaut
          location: exp.location ?? '',
          start_at: exp.startDate ?? new Date().toISOString(),
          end_at: exp.current ? null : (exp.endDate ?? null),
          is_current: exp.current ?? false,
          description: exp.description ?? '',
        })
      }
    }

    // Educations
    if (data.educations?.length) {
      for (const edu of data.educations) {
        await TalentEducation.create({
          talent_id: talentProfile.id,
          institution: edu.school ?? '',
          degree: edu.degree ?? '',
          description: edu.field ?? '',
          start_at: edu.startDate ?? new Date().toISOString(),
          end_at: edu.current ? null : (edu.endDate ?? null),
          is_current: edu.current ?? false,
        })
      }
    }

    const relations = await this.loadTalentRelations(talentProfile)

    return {
      ...talentProfile.toJSON(),
      ...relations,
    }
  }

  /**
   * Mise à jour du profil talent
   */
  async updateTalent(talentId: number, data: UpdateTalentData, userId: number) {
    const talent = await TalentProfile.findOrFail(talentId)

    if (talent.userId !== userId) {
      throw new Error('Action non autorisée.')
    }

    Object.assign(talent, {
      phone: data.phone ?? talent.phone,
      title: data.title ?? talent.title,
      bio: data.bio ?? talent.bio,
      location: data.location ?? talent.location,
      isAvailable: data.isAvailable ?? talent.isAvailable,
      linkedinUrl: data.linkedinUrl ?? talent.linkedinUrl,
      githubUrl: data.githubUrl ?? talent.githubUrl,
    })

    if (data.cv) {
      // 1. Supprimer l’ancien CV s’il existe
      if (talent.cvUrl) {
        await deleteFile(talent.cvUrl).catch(() => {})
      }

      // 2. Uploader le nouveau
      const { url, path } = await uploadFile(data.cv, 'cvs')
      talent.cvUrl = url
      talent.cvPath = path
    }

    await talent.save()

    /** Skills **/
    if (data.skills !== undefined) {
      await TalentSkill.query().where('talent_id', talent.id).delete()

      for (const s of data.skills) {
        await TalentSkill.create({
          talent_id: talent.id,
          skill_id: s.skillId,
          level: s.level ?? 1,
          is_validated: false,
        })
      }
    }

    /** Experiences **/
    if (data.experiences !== undefined) {
      await TalentExperience.query().where('talent_id', talent.id).delete()

      for (const exp of data.experiences) {
        await TalentExperience.create({
          talent_id: talent.id,
          job_title: exp.title ?? '', // ← obligatoire
          company_name: exp.company ?? '', // ← obligatoire
          location: exp.location ?? '',
          start_at: exp.startDate ?? new Date().toISOString(),
          end_at: exp.current ? null : (exp.endDate ?? null),
          is_current: exp.current ?? false,
          description: exp.description ?? '',
        })
      }
    }

    /** Educations **/
    if (data.educations !== undefined) {
      await TalentEducation.query().where('talent_id', talent.id).delete()

      for (const edu of data.educations) {
        await TalentEducation.create({
          talent_id: talent.id,
          institution: edu.school ?? '', // ← obligatoire
          degree: edu.degree ?? '', // ← obligatoire
          description: edu.field ?? '',
          start_at: edu.startDate ?? new Date().toISOString(),
          end_at: edu.current ? null : (edu.endDate ?? null),
          is_current: edu.current ?? false,
        })
      }
    }

    const relations = await this.loadTalentRelations(talent)

    return {
      ...talent.toJSON(),
      ...relations,
    }
  }

  /**
   * Calcul du taux de complétion
   */
  async getTalentProfileCompletion(user: User) {
    const talent = await TalentProfile.find(user.talentProfile?.id ?? 0)
    if (!talent) return 0

    const skills = await TalentSkill.query().where('talent_id', talent.id)
    const exp = await TalentExperience.query().where('talent_id', talent.id)
    const edu = await TalentEducation.query().where('talent_id', talent.id)

    let completion = 0

    if (talent.phone && talent.bio && talent.location && talent.cvUrl) completion += 25
    if (skills.length > 0) completion += 25
    if (exp.length > 0) completion += 25
    if (edu.length > 0) completion += 25

    return completion
  }
}
