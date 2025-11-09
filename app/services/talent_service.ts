// app/services/talent_service.ts
import TalentProfile from '#models/talent_profile'
import User from '#models/user'
import Skill from '#models/skill'
import TalentEducation from '#models/talent_education'
import TalentExperience from '#models/talent_experience'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { Exception } from '@adonisjs/core/exceptions'
import TalentSkill from '#models/talent_skill'

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
  cv?: any
  skills?: { skillId: number; level?: number }[]
  experiences?: Array<{
    id?: number
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string | null
    current?: boolean
    description?: string
  }>
  educations?: Array<{
    id?: number
    school: string
    degree: string
    field: string
    startDate: string
    endDate?: string | null
    current?: boolean
  }>
}

interface TalentResponse {
  data: (TalentProfile & { user: User })[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export class TalentService {
  /**
   * Récupère les talents depuis TalentProfile
   */
  async getTalents(filters: TalentFilters = {}): Promise<TalentResponse> {
    const { search = '', skills = [], location = '', page = 1, limit = 20 } = filters

    const query = TalentProfile.query()
      .preload('user')
      .preload('skills')
      .preload('experiences')
      .preload('educations')
      .whereNull('deleted_at')

    // Recherche a partir des filtres si definies
    if (search) {
      query
        .whereHas('user', (user) => {
          user.whereILike('firstname', `%${search}%`).orWhereILike('lastname', `%${search}%`)
        })
        .orWhereILike('title', `%${search}%`)
        .orWhereILike('bio', `%${search}%`)
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
   * Récuperer un talent par son ID
   * @param talentId ID du profil talent
   */
  async getTalent(talentId: number) {
    return TalentProfile.query()
      .where('id', talentId)
      .preload('user')
      .preload('skills')
      .preload('experiences')
      .preload('educations')
      .first()
  }

  /**
   * Création du profil talent si l'utilisateur n'en possède pas encore
   * @param userId ID de l'utilisateur
   * @param data Données du profil talent à créer
   */
  async createTalent(userId: number, data: UpdateTalentData): Promise<TalentProfile> {
    const {
      phone,
      title,
      bio,
      location,
      isAvailable,
      linkedinUrl,
      githubUrl,
      cv,
      skills,
      experiences,
      educations,
    } = data

    const user = await User.query().where('id', userId).preload('talentProfile').firstOrFail()

    if (user.talentProfile) {
      throw new Error('L’utilisateur possède déjà un profil talent. Utilisez updateTalent.')
    }

    const talentProfile = new TalentProfile()
    talentProfile.userId = user.id
    talentProfile.phone = phone || null
    talentProfile.title = title || null
    talentProfile.bio = bio || null
    talentProfile.location = location || null
    talentProfile.isAvailable = isAvailable || null
    talentProfile.linkedinUrl = linkedinUrl || null
    talentProfile.githubUrl = githubUrl || null

    // Upload CV si fourni
    if (cv) {
      const fileName = `${cuid()}.${cv.extname}`
      await cv.moveToDisk('cvs', { name: fileName }, 'local')
      talentProfile.cvUrl = await drive.use().getUrl(`cvs/${fileName}`)
    }

    await talentProfile.save()

    // Ajouter les compétences
    if (skills && skills.length > 0) {
      const validSkillIds = await Skill.query()
        .whereIn(
          'id',
          skills.map((s) => s.skillId)
        )
        .select('id')
      const validIds = validSkillIds.map((s) => s.id)
      if (validIds.length !== skills.length) {
        throw new Error('Une ou plusieurs compétences sont invalides.')
      }

      const attachData: Record<number, { level: number }> = {}
      for (const { skillId, level } of skills) {
        attachData[skillId] = { level: level || 1 }
      }
      await talentProfile.related('skills').attach(attachData)
    }

    // Ajouter les expériences
    if (experiences && experiences.length > 0) {
      for (const exp of experiences) {
        await talentProfile.related('experiences').create({
          job_title: exp.title,
          company_name: exp.company,
          location: exp.location || null,
          start_at: exp.startDate,
          end_at: exp.current ? null : exp.endDate,
          is_current: exp.current || false,
          description: exp.description || null,
        })
      }
    }

    // Ajouter les formations
    if (educations && educations.length > 0) {
      for (const edu of educations) {
        await talentProfile.related('educations').create({
          talent_id: talentProfile.id,
          degree: edu.degree,
          institution: edu.school,
          start_at: edu.startDate,
          end_at: edu.current ? null : edu.endDate,
          is_current: edu.current || false,
        })
      }
    }

    // Recharger relations pour retour complet
    await talentProfile.load('user')
    await talentProfile.load('skills')
    await talentProfile.load('experiences')
    await talentProfile.load('educations')

    return talentProfile
  }

  /**
   * Mise à jour des informations du profil talent
   * @param talentId ID du profil talent
   * @param data Données à mettre à jour
   * @param userId ID de l'utilisateur
   */
  async updateTalent(
    talentId: number,
    data: UpdateTalentData,
    userId: number
  ): Promise<any> {
    const {
      phone,
      title,
      bio,
      location,
      isAvailable,
      linkedinUrl,
      githubUrl,
      cv,
      skills,
      experiences,
      educations,
    } = data

    const talentProfile = await TalentProfile.query()
      .where('id', talentId)
      .firstOrFail()

    if (talentProfile.userId !== userId) {
      throw new Error("Vous n'êtes pas autorisé à effectuer cette action.")
    }

    if (phone !== undefined) talentProfile.phone = phone
    if (title !== undefined) talentProfile.title = title
    if (bio !== undefined) talentProfile.bio = bio
    if (location !== undefined) talentProfile.location = location
    if (isAvailable !== undefined) talentProfile.isAvailable = isAvailable
    if (linkedinUrl !== undefined) talentProfile.linkedinUrl = linkedinUrl
    if (githubUrl !== undefined) talentProfile.githubUrl = githubUrl

    if (cv) {
      const fileName = `${cuid()}.${cv.extname}`
      await cv.moveToDisk('cvs', { name: fileName }, 'local')
      talentProfile.cvUrl = await drive.use().getUrl(`cvs/${fileName}`)
    }

    if(skills !== undefined && Array.isArray(skills) && skills.length > 0) {
      const skillIds = skills.map((s: any) => (s.skillId !== undefined ? s.skillId : s))
      const validSkillIds = await Skill.query()
        .whereIn('id', skillIds)
        .select('id')

      const validIds = validSkillIds.map((s) => s.id)

      if (validIds.length !== skillIds.length) {
        throw new Error('Une ou plusieurs compétences sont invalides.')
      }

      await talentProfile.related('skills').detach()

      const attachData: Record<number, { level: number }> = {}
      for (const s of skills) {
        const id = s.skillId !== undefined ? s.skillId : s
        attachData[id] = { level: s.level || 1 }
      }

      await talentProfile.related('skills').attach(attachData)
    }
// A corriger
    // if (experiences !== undefined) {
    //   const existing = await TalentExperience.query()
    //     .where('talent_profile_id', talentId)
    //     .select('id')

    //   const existingIds = existing.map((e) => e.id)
    //   const incomingIds = experiences.map((e) => e.id).filter(Boolean)

    //   const toDelete = existingIds.filter((id) => !incomingIds.includes(id))

    //   if (toDelete.length > 0) {
    //     await TalentExperience.query()
    //       .whereIn('id', toDelete)
    //       .where('talent_profile_id', talentId)
    //       .delete()
    //   }

    //   for (const exp of experiences) {
    //     const payload = {
    //       title: exp.title,
    //       company: exp.company,
    //       location: exp.location,
    //       start_date: exp.startDate,
    //       end_date: exp.current ? null : exp.endDate,
    //       current: exp.current || false,
    //       description: exp.description,
    //     }

    //     if (exp.id) {
    //       await TalentExperience.query().where('id', exp.id).update(payload)
    //     } else {
    //       await TalentExperience.create({
    //         talent_id: talentId,
    //         ...payload,
    //       })
    //     }
    //   }
    // }


    // if (educations !== undefined) {
    //   const existing = await TalentEducation.query()
    //     .where('talent_profile_id', talentId)
    //     .select('id')

    //   const existingIds = existing.map((e) => e.id)
    //   const incomingIds = educations.map((e) => e.id).filter(Boolean)

    //   const toDelete = existingIds.filter((id) => !incomingIds.includes(id))

    //   if (toDelete.length > 0) {
    //     await TalentEducation.query()
    //       .whereIn('id', toDelete)
    //       .where('talent_profile_id', talentId)
    //       .delete()
    //   }

    //   for (const edu of educations) {
    //     const payload = {
    //       school: edu.school,
    //       degree: edu.degree,
    //       field: edu.field,
    //       start_date: edu.startDate,
    //       end_date: edu.current ? null : edu.endDate,
    //       current: edu.current || false,
    //     }

    //     if (edu.id) {
    //       await TalentEducation.query().where('id', edu.id).update(payload)
    //     } else {
    //       await TalentEducation.create({
    //         talent_id: talentId,
    //         ...payload,
    //       })
    //     }
    //   }
    // }

    await talentProfile.save()

    /**
     * Retour formaté (sans preload)
     */
    const talentSkills = await TalentSkill.query().where('talent_id', talentId)
    const talentExperience = await TalentExperience.query().where('talent_profile_id', talentId)
    const talentEducation = await TalentEducation.query().where('talent_profile_id', talentId)

    return {
      ...talentProfile.toJSON(),
      skills: talentSkills,
      experiences: talentExperience,
      educations: talentEducation,
    }
  }


  /**
   * Verifier le pourcentage de completion du profil du talent
   * @param talentId ID du profil talent
   */
  async getTalentProfileCompletion(user: User): Promise<number> {
    const checkUser = User.query().where('id', user.id).preload('talentProfile').first()

    if (!checkUser) throw new Error('Utilisateur introuvable')
    if (!user.talentProfile) return 0

    const talent = await TalentProfile.query()
      .where('id', user.talentProfile.id)
      .preload('skills')
      .preload('experiences')
      .preload('educations')
      .firstOrFail()

    let completion = 0

    if (talent.phone && talent.bio && talent.location && talent.cvUrl) {
      completion += 25
    }

    if (talent.skills.length > 0) {
      completion += 25
    }

    if (talent.educations.length > 0) {
      completion += 25
    }

    if (talent.experiences.length > 0) {
      completion += 25
    }

    return completion
  }
}
