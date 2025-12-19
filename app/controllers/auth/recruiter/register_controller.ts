import { inject } from '@adonisjs/core'
import Mail from '@adonisjs/mail/services/main'
import type { HttpContext } from '@adonisjs/core/http'

import env from '#start/env'
import User from '#models/user'
import UserService from '#services/user_service'
import { registerCompanyUserValidation } from '#validators/auth_request'
import hash from '@adonisjs/core/services/hash'
import { CompanyService } from '#services/company_service'
import { notEqual } from 'assert'
import Company from '#models/company'
import CompanyMember from '#models/company_member'

@inject()
export default class RegisterController {
  constructor(
    private companyService: CompanyService,
    private userService: UserService
  ) {}

  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register_recruiter')
  }

  async store({ request, response, session }: HttpContext) {
    const data = await request.validateUsing(registerCompanyUserValidation)

    const existEmail = await User.findBy('email', data.email)

    if (existEmail) {
      return session.flash('auth', {
        type: 'error',
        message: 'Ce email est deja associe a un compte... ',
      })
    }

    const hashPasssword = await hash.make(data.password)

    const user = await this.userService.createUser({
      ...data,
      password: hashPasssword,
      role: 'COMPANY_ADMIN',
      profile: null,
    })

    // Create Company
    if (data.company) {
      const existCompany = await Company.query().where('name', data.company).first()
      if (existCompany)
        throw new Error('Cette entreprise existe deja. Veuillez en creer un nouveau.')

      const admin = await User.findBy('id', user.id)
      if (!admin) throw new Error('Utilisateu non trouvee')

      const newCompany = await Company.create({
        adminId: admin.id,
        name: data.company,
        description: '',
        address: '',
        country: '',
      })

      await CompanyMember.create({
        userId: admin.id,
        companyId: newCompany.id,
      })
    }

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
