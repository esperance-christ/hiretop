import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, ...rawRoles: string[]) {
    const { auth, response } = ctx

    if (!auth.user) {
      return response.unauthorized('Authentification requise.')
    }

    const user = auth.user!

    if (rawRoles.length === 0) {
      return response.forbidden('Aucun rôle configuré pour cette route.')
    }

    const allowedRoles = rawRoles
      .join(',')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)

    let hasValidRole = false
    for (const role of allowedRoles) {
      if (await user.hasRole(role)) {
        hasValidRole = true
        break
      }
    }

    if (!hasValidRole) {
      return response.forbidden('Accès refusé : rôle non autorisé.')
    }
    return next()
  }
}
