import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  /**
   * Methode de deconnexion
   */
  async logout({ auth, response, session }: HttpContext) {
    const user = await auth.user!

    if (!user) return null
    await auth.use('web').logout()

    session.flash('auth', { type: 'success', message: 'Déconnexion effectuée avec succès' })
    return response.redirect().toRoute('auth.login')
  }
}
