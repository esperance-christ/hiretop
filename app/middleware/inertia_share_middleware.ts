import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class InertiaShareMiddleware {
  async handle({ auth, inertia, request, session }: HttpContext, next: NextFn) {

    const user = await auth.use('web').user!
console.log('utilisateur en ligne : ', user!)
    let menuItems: Array<{ label: string; href: string; route: string }> = []

    if (user) {
      if ((await user.hasRole('RECRUITER')) || (await user.hasRole('COMPANY_ADMIN'))) {
        menuItems = [
          { label: 'Accueil', href: '/dashboard', route: 'dashboard' },
          { label: 'Publications', href: '/recruiter/posts', route: 'recruiter.posts' },
          {
            label: 'Candidatures',
            href: '/recruiter/applications',
            route: 'recruiter.applications',
          },
          { label: 'Contrats', href: '/recruiter/contracts', route: 'recruiter.contracts' },
          { label: 'Paramètres', href: '/recruiter/settings', route: 'recruiter.settings' },
        ]
      } else if (await user.hasRole('TALENT')) {
        menuItems = [
          { label: 'Accueil', href: '/dashboard', route: 'dashboard' },
          { label: 'Jobs', href: '/talent/jobs', route: 'talent.posts' },
          { label: 'Mes Candidatures', href: '/talent/applications', route: 'talent.applications' },
          { label: 'Mes Contrats', href: '/talent/contracts', route: 'talent.contracts' },
          { label: 'Mon Profile', href: '/talent/settings', route: 'talent.settings' },
        ]
      }
    }

    inertia.share({
      auth: () => {
        if (!user) return null
        return {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profile: user.profile,
          emailVerifiedAt: user.emailVerifiedAt?.toISO(),
          roles: user.roles(),
          isTalent: user.hasRole('TALENT'),
          isCompanyAdmin: user.hasRole('COMPANY_ADMIN'),
          isRecruiter: user.hasRole('RECRUITER'),
          talentProfile: user.talentProfile ?? null,
        }
      },

      menuItems: () => menuItems,
      currentUrl: () => `${request.url()}`,

      flash: () => {
        return {
          auth: session.flashMessages.get('auth'),
          success: session.flashMessages.get('success'),
          error: session.flashMessages.get('error'),
        }
      },

      appName: () => env.get('APP_NAME') || 'HireTop',
    })

    await next()
  }
}
