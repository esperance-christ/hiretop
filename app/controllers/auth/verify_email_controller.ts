import type { HttpContext } from '@adonisjs/core/http'
import Mail from '@adonisjs/mail/services/main'

import User from '#models/user'
import { DateTime } from 'luxon'
import env from '#start/env'

export default class VerifyEmailController {
  /**
   * Vérification de l'email
   */
  async verifyEmail({ params, response, session }: HttpContext) {
    const { id, hash } = params

    const user = await User.findOrFail(id)

    try {
      if (user.emailVerifiedAt) {
        throw new Error('Ce compte est déjà vérifé. Veuillez vous connectez...')
      }
      const decoded = Buffer.from(hash, 'base64url').toString()
      const [userId, timestamp] = decoded.split('|')
      const sentAt = DateTime.fromMillis(Number(timestamp))

      if (userId !== String(id) || sentAt < DateTime.now().minus({ hours: 1 })) {
        throw new Error('Lien invalide ou expiré')
      }

      user.emailVerifiedAt = DateTime.now()
      await user.save()

      session.flash('auth', {
        type: 'success',
        message: 'Email vérifié avec succès !',
      })

      return response.redirect().toPath('/dashboard')
    } catch {
      session.flash('auth', {
        type: 'erro',
        message: 'Lien invalide ou expiré',
      })
      session.flash('error', 'Lien invalide ou expiré.')
      return response.redirect().toPath('/auth/login')
    }
  }

  /**
   * Page email verifier avec succes
   */
  // async showVerified({ inertia }: HttpContext) {
  //   return inertia.render('auth.verified')
  // }

  /**
   * Page email verifier avec succes
   */
  async showSuccessRegister({ inertia }: HttpContext) {
    return inertia.render('auth/success')
  }

  /**
   * Renvoyer le mail de confirmation de compte
   */
  async resendVerification({ request, response, session }: HttpContext) {
    const { email } = request.body()
    const user = await User.query().where('email', email).first()

    if (!user) {
      session.flash('auth', { type: 'error', message: 'Email incorrect veuillez reesayer.' })
      return response.redirect().back()
    }

    if (!user.emailVerifiedAt) {
      session.flash('auth', { type: 'info', message: 'Votre email est déjà vérifié.' })
      return response.redirect().back()
    }

    const verificationUrl = this.generateVerificationUrl(user.id)
    await Mail.send((message) => {
      message
        .to(user.email)
        .from('info@hiretop.com')
        .subject('Vérification de compte')
        .htmlView('emails/verify_email', { user, verificationUrl })
    })

    session.flash('auth', { type: 'success', message: 'Email de vérification renvoyé.' })
    return response.redirect().back()
  }

  private generateVerificationUrl(userId: number): string {
    const hash = Buffer.from(`${userId}|${DateTime.now().toMillis()}`).toString('base64url')
    const baseUrl = env.get('APP_URL')
    return `${baseUrl}/auth/verify/${userId}/${hash}`
  }
}
