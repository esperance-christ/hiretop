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

    const existEmail = await User.findBy('email', data.email)

    if (existEmail) {
      return session.flash('auth', {
        type: 'error',
        message: 'Ce email est deja associe a un compte... ',
      })
    }

    const user = await this.userService.createUser({
      ...data,
      role: 'COMPANY_ADMIN',
      profile: null,
    })

    // const verificationUrl = this.generateVerificationUrl(user.id)

    // --- Sécurisation de l'envoi mail ---
    try {
      if (!user.email) {
        throw new Error('Email utilisateur non défini')
      }

      await Mail.send((message) => {
        message
          .to(user.email)
          .from(
            env.get('MAIL_FROM_ADDRESS', 'info@hiretop.com'),
            env.get('MAIL_FROM_NAME', 'HireTop')
          )
          .subject('Vérifiez votre compte HireTop')
          .htmlView('emails/verify_email', { user, role: 'COMPANY_ADMIN' })
      })
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’email :', error.message)
      session.flash('auth', {
        type: 'warning',
        message: "Compte créé, mais l'email de vérification n'a pas pu être envoyé.",
      })
    }

    session.flash('auth', { type: 'success', message: 'Compte créé avec succès !' })

    return response.redirect('/dashboard')
  }

  // On desactive temporairement la verification par mail

  // private generateVerificationUrl(userId: number): string {
  //   const hash = Buffer.from(`${userId}|${DateTime.now().toMillis()}`).toString('base64url')
  //   const baseUrl = env.get('APP_URL')
  //   return `${baseUrl}/auth/verify/${userId}/${hash}`
  // }
}
