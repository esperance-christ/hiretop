import type { HttpContext } from '@adonisjs/core/http'
import Mail from '@adonisjs/mail/services/main'
import { inject } from '@adonisjs/core'

import env from '#start/env'
import UserService from '#services/user_service'
import { registerUserValidation } from '#validators/auth_request'
import { DateTime } from 'luxon'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

@inject()
export default class RegisterController {
  constructor(protected userService: UserService) {}

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register_talent')
  }

  async store({ auth, request, response, session }: HttpContext) {
    const data = await request.validateUsing(registerUserValidation)

    // on verifie si ce email est deja lie a un compte
    const existEmail = await User.findBy('email', data.email)

    if (existEmail) {
      return session.flash('auth', {
        type: 'error',
        message: 'Ce email est deja associe a un compte... ',
      })
    }
    // Mot de passe hashe
    const hashPasssword = await hash.make(data.password)

    const user = await this.userService.createUser({
      ...data,
      password: hashPasssword,
      role: 'TALENT',
      profile: null,
    })

    // const verificationUrl = this.generateVerificationUrl(user.id)

    // Envoyer email de vérification
    await Mail.send((message) => {
      message
        .to(user.email)
        .from('info@hiretop.com', 'HireTop')
        .subject('Bienvenue sur HireTop')
        .htmlView('emails/verify_email', { user, role: 'TALENT' })
    })

    // await auth.use('web').login(user)
    session.flash('auth', { type: 'success', message: 'inscription réussie ! Bienvenue.' })

    return response.redirect('/auth/login')
  }

  // private generateVerificationUrl(userId: number): string {
  //   const hash = Buffer.from(`${userId}|${DateTime.now().toMillis()}`).toString('base64url')
  //   const baseUrl = env.get('APP_URL')
  //   return `${baseUrl}/auth/verify/${userId}/${hash}`
  // }
}
