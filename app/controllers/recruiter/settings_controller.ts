// app/controllers/settings_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'
import Company from '#models/company'
import CompanyMember from '#models/company_member'
import { inject } from '@adonisjs/core'
import { CompanyService } from '#services/company_service'

@inject()
export default class SettingsController {
  constructor(
    private companyService: CompanyService,
    private userService: UserService
  ) {}

  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const company = await Company.query()
      .where('admin_id', user.id)
      .orWhereHas('members', (q) => q.where('user_id', user.id))
      .preload('members', (q) => q.preload('user'))
      .firstOrFail()

    return inertia.render('recruiter/settings', {
      company: company.serialize(),
      members: company.members.map(m => m.user.serialize()),
    })
  }

  async updateCompany({ request, auth, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.all() // Prend tout (y compris le fichier)

    const company = await Company.query()
      .where('admin_id', user.id)
      .orWhereHas('members', (q) => q.where('user_id', user.id))
      .firstOrFail()

    await this.companyService.updateCompany(user.id, company.id, data)
    session.flash('success', 'Entreprise mise à jour avec succès')
    return response.redirect().back()
  }

  async inviteMember({ request, auth, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { firstname, lastname, email } = request.only(['firstname', 'lastname', 'email'])

    if (!firstname || !lastname || !email) {
      session.flash('error', 'Tous les champs sont obligatoires')
      return response.redirect().back()
    }

    const company = await Company.query()
      .where('admin_id', user.id)
      .orWhereHas('members', (q) => q.where('user_id', user.id))
      .firstOrFail()

    const tempPassword = 'password1234567890'

    const newUser = await this.userService.createUser({
      firstname,
      lastname,
      email,
      password: tempPassword,
      role: 'RECRUITER',
    })

    await CompanyMember.create({
      userId: newUser.id,
      companyId: company.id,
    })

    // TODO: Envoyer email avec mot de passe temporaire
    session.flash('success', `Membre invité ! Mot de passe temporaire : ${tempPassword}`)
    return response.redirect().back()
  }

  async updatePassword({ request, auth, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { password, password_confirmation } = request.only(['password', 'password_confirmation'])

    if (password !== password_confirmation) {
      session.flash('error', 'Les mots de passe ne correspondent pas')
      return response.redirect().back()
    }

    if (password.length < 8) {
      session.flash('error', 'Le mot de passe doit faire au moins 8 caractères')
      return response.redirect().back()
    }

    user.password = password
    await user.save()

    session.flash('success', 'Mot de passe mis à jour')
    return response.redirect().back()
  }
}
