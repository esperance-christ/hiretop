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
        if (!ctx.auth) return null

        const logUser = ctx.auth.use('web').user
        if (!logUser) return null

        const role = await logUser.roles().first()
        const permissions = await logUser.permissions()

        return {
          ...logUser.serialize(),
          role,
          permissions,
        }
      }) ?? null,

    menuItems: (ctx) =>
      ctx.inertia.always(async () => {
        if (!ctx.auth) return []

        const user = ctx.auth.use('web').user
        if (!user) return []

        if (
          (await user.hasRole('RECRUITER')) ||
          (await user.hasRole('COMPANY_ADMIN'))
        ) {
          return [
            { label: 'Accueil', href: '/dashboard', route: 'dashboard' },
            { label: 'Publications', href: '/recruiter/posts', route: 'recruiter.posts' },
            {
              label: 'Candidatures',
              href: '/recruiter/applies',
              route: 'recruiter.applies',
            },
            {
              label: 'Paramètres',
              href: '/recruiter/configuration',
              route: 'recruiter.settings',
            },
          ]
        }

        if (await user.hasRole('TALENT')) {
          return [
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
          ]
        }

        return []
      }),

    currentUrl: (ctx) => ctx?.request?.url() ?? '/',

    flash: (ctx) => {
      return {
        auth: ctx?.session?.flashMessages?.get('auth') ?? null,
        success: ctx?.session?.flashMessages?.get('success') ?? null,
        error: ctx?.session?.flashMessages?.get('error') ?? null,
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
