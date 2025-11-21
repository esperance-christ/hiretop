import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RedirectByRoleMiddleware {
  async handle({ auth, request, response }: HttpContext, next: NextFn) {
    if (!auth.user) {
      return await next()
    }

    const url = request.url()

    if (!url.startsWith('/dashboard')) {
      return await next()
    }

    if (auth.isAuthenticated && !auth.user.emailVerifiedAt) {
      return response.redirect().toPath('/auth/register/success')
    }

    if (await auth.user.hasRole('TALENT')) {
      console.log(await auth.user.hasRole('TALENT'))
      return response.redirect('/talent/dashboard', true)
    }

    if (await auth.user.hasAnyRole('RECRUITER', 'COMPANY_ADMIN')) {
      return response.redirect('/recruiter/dashboard', true)
    }

    return await next()
  }
}
