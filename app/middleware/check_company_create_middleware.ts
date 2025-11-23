import Company from '#models/company'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class CheckCompanyCreateMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */

    const user = ctx.auth.getUserOrFail()

    if(!user) return ctx.response.redirect('/auth/login')

    if (await user.hasRole('COMPANY_ADMIN')) {
      const hasCompany = await Company.query().where('admin_id', user.id).first()
      if (!hasCompany) {
        return ctx.response.redirect('/recruiter/configuration')
      }
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
