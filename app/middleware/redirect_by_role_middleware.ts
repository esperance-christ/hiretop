import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RedirectByRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, request, response } = ctx

    if (!auth.user) {
      return next()
    }

    const user = auth.user!
    const url = request.url()

    if (!url.startsWith('/dashboard')) {
      return next()
    }

    if (!user.emailVerifiedAt) {
      return response.redirect('/auth/register/success', true)
    }

    const isTalent = await user.hasRole('TALENT')
    const isRecruiter = await user.hasRole('RECRUITER')
    const isCompanyAdmin = await user.hasRole('COMPANY_ADMIN')

    if (!isTalent && !isRecruiter && !isCompanyAdmin) {
      await auth.use('web').logout()

      ctx.session.flash('auth', {
        type: 'error',
        message: 'Votre compte n’a pas de rôle valide. Vous avez été déconnecté pour des raisons de sécurité.',
      })

      return response.redirect('/auth/login', true)
    }

    if (isTalent) {
      return response.redirect('/talent/dashboard', true)
    }

    if (isRecruiter || isCompanyAdmin) {
      return response.redirect('/recruiter/dashboard', true)
    }

    return next()
  }
}
