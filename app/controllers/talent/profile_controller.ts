import { TalentService } from '#services/talent_service'
import UserService from '#services/user_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProfileController {
    constructor(private userService: UserService, private talentService: TalentService) {}


  /**
   * Afficher le profil de l'utilisateur connecté
   */
  async show({ auth, inertia }: HttpContext) {
    const user = auth.user!
    const fullUser = await this.userService.getUser(user)

    // Si pas de talentProfile, on met completion à 0
    let completion = 0
    if (fullUser.talentProfile) {
      completion = await this.talentService.getTalentProfileCompletion(fullUser)
    }

    return inertia.render('talent/profile', {
      user: fullUser,
      profileCompletion: completion,
    })
  }

  /**
   * Mise à jour du profil
   * Peut gérer à la fois User et TalentProfile
   */
  async update({ auth, request, response }: HttpContext) {

    const fullUser = await this.userService.getUser(auth.user!)

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

      if (!fullUser.talentProfile) {
        await this.talentService.createTalent(fullUser.id, data)
      } else {
        await this.talentService.updateTalent(
          fullUser.talentProfile.id,
          data,
          fullUser.id
        )
      }

      return response.redirect('/talent/profile')
    }

    return response.badRequest('Type de mise à jour inconnu')

  }
}
