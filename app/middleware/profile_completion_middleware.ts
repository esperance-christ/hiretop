// app/middlewares/check_talent_profile_completion_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { TalentService } from '#services/talent_service'

export default class CheckTalentProfileCompletionMiddleware {
  async handle({ auth, response, request }: HttpContext, next: NextFn) {
    const user = auth.user!

    const isTalent = await user.hasRole('TALENT')
    if (!isTalent) return next()

    if (!user.talentProfile?.id) {
      return response.redirect('/talent/profile', true)
    }

    // 3. On calcule le vrai taux de complétion via ton service
    const talentService = new TalentService()
    const completion = await talentService.getTalentProfileCompletion(user)

    console.log('Profile completion:', completion)

    if (completion <= 25) {
      return response.redirect('/talent/profile', true)
    }

    return next()
  }

}
