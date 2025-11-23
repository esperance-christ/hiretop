import TalentProfile from '#models/talent_profile'
import { TalentService } from '#services/talent_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckTalentProfileCompletionMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()

    const userRole = await user.roles().first()
    if (!user || !userRole) return next()


    const talentService = new TalentService()

    // Verifier si l'utilisateur est un TEALENT
    const isTalent = await user.hasRole('TALENT')
    if (!isTalent) return next()

    if(user && isTalent) {
      if(user.talentProfile && user.talentProfile.id) {
        const completion = await talentService.getTalentProfileCompletion(user)
        /**
         * Call next method in the pipeline and return its output
         */
        if (completion < 25) {
          return ctx.response.redirect('/talent/profile')
        }
      }
    }
  }
}
