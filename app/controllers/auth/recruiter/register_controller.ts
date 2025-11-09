import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import Mail from '@adonisjs/mail/services/main'
import type { HttpContext } from '@adonisjs/core/http'

import env from '#start/env'
import User from '#models/user'
import UserService from '#services/user_service'
import { registerUserValidation } from '#validators/auth_request'

@inject()
export default class RegisterController {
  constructor(protected userService: UserService) {}

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register_recruiter')
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(registerUserValidation)

    // on verifie si ce email est deja lie a un compte
    const existEmail = await User.findBy('email', data.email)

    if (existEmail) {
      return session.flash('auth', {
        type: 'error',
        message: 'Ce email est deja associe a un compte... ',
      })
    }

    const user = await this.userService.createUser({
      ...data,
      role: 'TALENT',
      profile: null,
    })

    const verificationUrl = this.generateVerificationUrl(user.id)

    // Envoyer email de vérification
    await Mail.send((message) => {
      message
        .to(user.email)
        .from('info@hiretop.com', 'HireTop')
        .subject('Vérifiez votre compte HireTop')
        .htmlView('emails/verify_email', { user, verificationUrl })
    })

    return response.redirect().toRoute('auth.register.success')
  }

  private generateVerificationUrl(userId: number): string {
    const hash = Buffer.from(`${userId}|${DateTime.now().toMillis()}`).toString('base64url')
    const baseUrl = env.get('APP_URL')
    return `${baseUrl}/auth/verify/${userId}/${hash}`
  }
}
