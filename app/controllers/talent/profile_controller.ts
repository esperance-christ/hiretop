import Skill from '#models/skill'
import TalentEducation from '#models/talent_education'
import TalentExperience from '#models/talent_experience'
import TalentProfile from '#models/talent_profile'
import TalentSkill from '#models/talent_skill'
import User from '#models/user'
import { TalentService } from '#services/talent_service'
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProfileController {
  constructor(
    private userService: UserService,
    private talentService: TalentService
  ) {}

  /**
   * Afficher le profil de l'utilisateur connecté
   */
  async show({ auth, inertia }: HttpContext) {
    const user = auth.user!
    // const fullUser = await this.userService.getUser(user)
    const fullUser = await User.query().where('id', user.id).firstOrFail()

    // Si pas de talentProfile, on met completion à 0
    let completion = 0
    let talentSkills = null
    let talentEducation = null
    let talentExperience = null

    if (fullUser.talentProfile) {
      fullUser.load('talentProfile')
      completion = await this.talentService.getTalentProfileCompletion(fullUser)
    }

    if (fullUser.talentProfile) {
      const skills = await TalentSkill.query()
        .where('talent_id', fullUser.talentProfile.id)
        .firstOrFail()
      talentSkills = skills
    }

    const talentProfile = await TalentProfile.query().where('user_id', fullUser.id).firstOrFail()

    if (talentProfile) {
      talentEducation = await (
        await TalentEducation.query().where('talent_id', talentProfile.id)
      ).entries()
    }

    if (talentProfile) {
      talentEducation = (
        await TalentExperience.query().where('talent_id', talentProfile.id)
      ).entries()
    }

    const skills = await Skill.all()

    return inertia.render('talent/profile', {
      user: fullUser,
      talentSkills,
      talentProfile,
      talentEducation,
      talentExperience,
      skills,
      profileCompletion: completion,
    })
  }

  /**
   * Mise à jour du profil
   * Peut gérer à la fois User et TalentProfile
   */
  async update({ auth, request, response }: HttpContext) {
    const fullUser = await User.query().where('id', auth.user!.id).firstOrFail()

    const updateType = request.input('type')

    if (updateType === 'general') {
      const payload = request.only(['firstname', 'lastname', 'email', 'profile'])
      await this.userService.updateUser(fullUser, payload)
      return response.redirect('/talent/profile')
    }

    if (updateType === 'talent') {
      const data: any = request.all()

      const cvFile = request.file('cv')
      if (cvFile) data.cv = cvFile

      const talentProfile = await TalentProfile.query().where('user_id', fullUser.id).firstOrFail()

      if (!talentProfile) {
        await this.talentService.createTalent(fullUser.id, data)
      } else {
        await this.talentService.updateTalent(talentProfile.id, data, fullUser.id)
      }

      return response.redirect('/talent/profile')
    }

    return response.badRequest('Type de mise à jour inconnu')
  }
}
