import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Company from '#models/company'
import CompanyMember from '#models/company_member'

import UserService from '#services/user_service'
import { CompanyService } from '#services/company_service'

@inject()
export default class settingsController {
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
      .first()

    return inertia.render('recruiter/settings', {
      company: company?.serialize() || null,
      members: company?.members.map((m) => m.user.serialize()) || [],
    })
  }

  async updateCompany({ request, auth, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.only(['name', 'country', 'address', 'description', 'logo'])
    const company = await Company.query().where('admin_id', user.id).firstOrFail()

    await this.companyService.updateCompany(user.id, company.id, data)
    session.flash('success', 'Informations mises à jour')
    return response.redirect().back()
  }

  async inviteMember({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { firstname, lastname, email } = request.only(['firstname', 'lastname', 'email'])
    const company = await Company.query().where('admin_id', user.id).firstOrFail()

    const tempPassword = Math.random().toString(36).slice(-10)
    const newUser = await this.userService.createUser({
      firstname,
      lastname,
      email,
      password: tempPassword,
      role: 'RECRUITER',
    })

    await CompanyMember.create({ userId: newUser.id, companyId: company.id })

    return response.redirect().back()
  }

  async updatePassword({ request, auth, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { password, password_confirmation } = request.only(['password', 'password_confirmation'])

    if (password !== password_confirmation) {
      session.flash('error', 'Les mots de passe ne correspondent pas')
      return response.redirect().back()
    }

    user.password = password
    await user.save()
    session.flash('success', 'Mot de passe mis à jour')
    return response.redirect().back()
  }
}
