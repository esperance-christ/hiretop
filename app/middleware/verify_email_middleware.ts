import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class VerifyEmailMiddleware {
  async handle({ auth, request, response }: HttpContext, next: NextFn) {
    // Si utilisateur est connecté
    if (!auth.user) return await next()

    if (request.url().startsWith('/auth/verify')) return await next()

    // Vérifier email
    if (!auth.user.emailVerifiedAt) {
      return response.redirect().toPath('/auth/register/success')
    }

    const output = await next()
    return output
  }
}
