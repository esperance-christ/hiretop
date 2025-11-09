import env from '#start/env'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) =>
      ctx.inertia.always(async () => {
        const user = ctx.auth.use('web').user!
        return {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          profile: user.profile,
          emailVerifiedAt: user.emailVerifiedAt?.toISO(),
          roles: await user.roles(),
          isTalent: await user.hasRole('TALENT'),
          isCompanyAdmin: await user.hasRole('COMPANY_ADMIN'),
          isRecruiter: await user.hasRole('RECRUITER'),
          talentProfile: user.talentProfile ?? null,
        }
      }),
    menuItems: (ctx) =>
      ctx.inertia.always(async () => {
        let menuItems: Array<{ label: string; href: string; route: string }> = []

        if (ctx.auth.use('web').user!) {
          if (
            (await ctx.auth.use('web').user!.hasRole('RECRUITER')) ||
            (await ctx.auth.use('web').user!.hasRole('COMPANY_ADMIN'))
          ) {
            return (menuItems = [
              { label: 'Accueil', href: '/dashboard', route: 'dashboard' },
              { label: 'Publications', href: '/recruiter/posts', route: 'recruiter.posts' },
              {
                label: 'Candidatures',
                href: '/recruiter/applies',
                route: 'recruiter.applies',
              },
              { label: 'Paramètres', href: '/recruiter/settings', route: 'recruiter.settings' },
            ])
          } else if (await ctx.auth.use('web').user!.hasRole('TALENT')) {
            return (menuItems = [
              { label: 'Accueil', href: '/dashboard', route: 'dashboard' },
              {
                label: 'Mes Candidatures',
                href: '/talent/applies',
                route: 'talent.applies',
              },
              {
                label: 'Mon Profile',
                href: '/talent/profile',
                route: 'talent.profiles',
              },
            ])
          }
        }
      }),
    currentUrl: (ctx) => `${ctx.request.url()}`,
    flash: (ctx) => {
      return {
        auth: ctx.session.flashMessages.get('auth'),
        success: ctx.session.flashMessages.get('success'),
        error: ctx.session.flashMessages.get('error'),
      }
    },
    appName: () => env.get('APP_NAME') || 'HireTop',
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
