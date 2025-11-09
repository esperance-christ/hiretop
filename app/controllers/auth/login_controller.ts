import User from '#models/user'
import { loginValidator } from '#validators/auth_request'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import inertia from '@adonisjs/inertia/client'

export default class LoginController {
  // Page de connexion unique pour la connexion client et recruiter
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  // connexion client/recruiter
  async login({ auth, request, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    // Verifier l'existence l'utilisateur
    const user = await User.query().where('email', email).first()
    if (!user || user == null) {
      console.error('utilisateur not existant : ', user)
      session.flash('auth', { type: 'error', message: 'Email ou mot de passe incorrect.' })
      return response.redirect().back()
    }

    // Verifier si l'email de l'utilisateur est vérifié
    if (!user.emailVerifiedAt) {
      console.error('utilisateur non verifie : ', user)
      session.flash('auth', {
        type: 'error',
        message: 'Veuillez vérifier votre email avant de vous connecter.',
      })
      return response.redirect().back()
    }

    // Verifier si le mot de passe est correct
    const isValidPassword = await hash.verify(user.password, password)
    if (!isValidPassword) {
      console.error('Mot de passe incorrect : ', user)
      session.flash('auth', {
        type: 'error',
        message: 'Email ou mot de passe incorrect. .',
      })
      return response.redirect().back()
    }

    // const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    session.flash('auth', { type: 'success', message: 'Connexion réussie ! Bienvenue.' })
    console.log('recuperation user (async)', await auth?.use('web').user)

    return response.redirect().toPath('/talent/dashboard')
  }
}
