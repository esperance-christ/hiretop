import TalentProfile from '#models/talent_profile'
import User from '#models/user'
import Skill from '#models/skill'
import TalentEducation from '#models/talent_education'
import TalentExperience from '#models/talent_experience'
import TalentSkill from '#models/talent_skill'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { deleteFile, uploadFile } from '#helpers/fileUploader'
import { DateTime } from 'luxon'

interface TalentFilters {
  search?: string
  skills?: string[] | number[]
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
  skills?: string | number[] | { skillId: number; level?: number }[]
  experiences?: string | {
    id?: number
    title: string
    company: string
    location?: string
    startDate: string
    endDate?: string | null
    current?: boolean
    description?: string
  }[]
  educations?: string | {
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
          level: pivot?.level ?? 2,
          is_validated: pivot?.is_validated ?? false,
        },
      }
    })

    const experiences = await TalentExperience.query()
      .where('talent_id', talent.id)
      .orderBy('start_at', 'desc')

    const educations = await TalentEducation.query()
      .where('talent_id', talent.id)
      .orderBy('start_at', 'desc')

    return {
      user,
      skills: skillsWithPivot,
      experiences,
      educations,
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

    // Parser JSON si nécessaire
    const skills = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills ?? []
    const experiences = typeof data.experiences === 'string' ? JSON.parse(data.experiences) : data.experiences ?? []
    const educations = typeof data.educations === 'string' ? JSON.parse(data.educations) : data.educations ?? []

    // Skills
    for (const s of skills) {
      if (typeof s === 'number') {
        await TalentSkill.create({
          talent_id: talentProfile.id,
          skill_id: s,
          level: 1,
          is_validated: false,
        })
      } else if (typeof s === 'object' && s.skillId) {
        await TalentSkill.create({
          talent_id: talentProfile.id,
          skill_id: s.skillId,
          level: s.level ?? 1,
          is_validated: false,
        })
      }
    }

    // Experiences
    for (const exp of experiences) {
      if (!exp.title || !exp.company) continue
      await TalentExperience.create({
        talent_id: talentProfile.id,
        job_title: exp.title,
        company_name: exp.company,
        location: exp.location ?? '',
        start_at: DateTime.fromISO(exp.startDate),
        end_at: exp.current ? null : exp.endDate ? DateTime.fromISO(exp.endDate) : null,
        is_current: exp.current ?? false,
        description: exp.description ?? '',
      })
    }

    // Educations
    for (const edu of educations) {
      if (!edu.school || !edu.degree) continue
      await TalentEducation.create({
        talent_id: talentProfile.id,
        institution: edu.school,
        degree: edu.degree,
        description: edu.field ?? '',
        start_at: DateTime.fromISO(edu.startDate),
        end_at: edu.current ? null : edu.endDate ? DateTime.fromISO(edu.endDate) : null,
        is_current: edu.current ?? false,
      })
    }

    const relations = await this.loadTalentRelations(talentProfile)
    return { ...talentProfile.toJSON(), ...relations }
  }

  /**
   * Mise à jour du profil talent
   */
  async updateTalent(talentId: number, data: UpdateTalentData, userId: number) {
    const talent = await TalentProfile.findOrFail(talentId)
    if (talent.userId !== userId) throw new Error('Action non autorisée.')

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
      if (talent.cvUrl) await deleteFile(talent.cvUrl).catch(() => {})
      const { url, path } = await uploadFile(data.cv, 'cvs')
      talent.cvUrl = url
      talent.cvPath = path
    }

    await talent.save()

    // Parser JSON si nécessaire
    const skills = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills ?? []
    const experiences = typeof data.experiences === 'string' ? JSON.parse(data.experiences) : data.experiences ?? []
    const educations = typeof data.educations === 'string' ? JSON.parse(data.educations) : data.educations ?? []

    // Skills
    if (skills.length > 0) {
      await TalentSkill.query().where('talent_id', talent.id).delete()
      for (const s of skills) {
        if (typeof s === 'number') {
          await TalentSkill.create({ talent_id: talent.id, skill_id: s, level: 1, is_validated: false })
        } else if (typeof s === 'object' && s.skillId) {
          await TalentSkill.create({ talent_id: talent.id, skill_id: s.skillId, level: s.level ?? 1, is_validated: false })
        }
      }
    }

    // Experiences
    if (experiences.length > 0) {
      await TalentExperience.query().where('talent_id', talent.id).delete()
      for (const exp of experiences) {
        if (!exp.title || !exp.company) continue
        await TalentExperience.create({
          talent_id: talent.id,
          job_title: exp.title,
          company_name: exp.company,
          location: exp.location ?? '',
          start_at: DateTime.fromISO(exp.startDate),
          end_at: exp.current ? null : exp.endDate ? DateTime.fromISO(exp.endDate) : null,
          is_current: exp.current ?? false,
          description: exp.description ?? '',
        })
      }
    }

    // Educations
    if (educations.length > 0) {
      await TalentEducation.query().where('talent_id', talent.id).delete()
      for (const edu of educations) {
        if (!edu.school || !edu.degree) continue
        await TalentEducation.create({
          talent_id: talent.id,
          institution: edu.school,
          degree: edu.degree,
          description: edu.field ?? '',
          start_at: DateTime.fromISO(edu.startDate),
          end_at: edu.current ? null : edu.endDate ? DateTime.fromISO(edu.endDate) : null,
          is_current: edu.current ?? false,
        })
      }
    }

    const relations = await this.loadTalentRelations(talent)
    return { ...talent.toJSON(), ...relations }
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
