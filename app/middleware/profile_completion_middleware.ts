// app/middlewares/check_talent_profile_completion_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { TalentService } from '#services/talent_service'

export default class CheckTalentProfileCompletionMiddleware {
  async handle({ auth, response, request }: HttpContext, next: NextFn) {
    const user = auth.user!
    const talent = await user.load('talentProfile')
    const isTalent = await user.hasRole('TALENT')
    if (!isTalent) return next()

    console.log(talent)

    const talentService = new TalentService()
    const completion = await talentService.getTalentProfileCompletion(user)

    console.log('completion type:', typeof completion)
    console.log('Profile completion:', completion)

    if (completion < 25) {
        return response.redirect('/talent/profile', true)
    }

    return next()
  }
}
