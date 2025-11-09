// database/seeders/02_RoleSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import data from '#database/data'
import { Acl } from '@holoyan/adonisjs-permissions'

export default class RoleSeeder extends BaseSeeder {
  async run() {
    const roles = data.roles
    const permissions = data.permissions

    const createdRoles = []

    for (const role of roles) {
      const roleInstance = await Acl.role().create({
        slug: role.slug,
        title: role.title,
        scope: 'default',
        entityType: '*',
        allowed: true,
      })

      createdRoles.push(roleInstance)
    }

    // === Assignation des permissions aux rôles ===
    const roleMap = Object.fromEntries(createdRoles.map(r => [r.slug, r]))

    // SUPER_ADMIN : toutes les permissions (global)
    await Acl.role(roleMap['SUPER_ADMIN']).giveAll(
      permissions.map(p => p.slug)
    )

    // ADMIN : permissions globales
    await Acl.role(roleMap['ADMIN']).giveAll([
      'manage_users',
      'manage_roles',
      'view_dashboard',
      'delete_company',
      'restore_user',
    ])

    // COMPANY_ADMIN, RECRUITER, VIEWER : permissions scopées sur Company
    const companyRolePermissions = {
      COMPANY_ADMIN: [
        'manage_company',
        'add_member',
        'remove_member',
        'create_job_offer',
        'edit_job_offer',
        'delete_job_offer',
        'view_applications',
        'view_dashboard',
      ],
      RECRUITER: [
        'create_job_offer',
        'edit_job_offer',
        'view_applications',
        'view_dashboard',
      ],
    }

    // On assigne ces permissions **globalement sur le rôle**, mais elles seront **appliquées scopées** quand le rôle est assigné à une `Company`
    for (const [roleSlug, perms] of Object.entries(companyRolePermissions)) {
      await Acl.role(roleMap[roleSlug]).giveAll(perms)
    }

    // TALENT : permissions globales
    await Acl.role(roleMap['TALENT']).giveAll([
      'apply_job',
      'view_own_applications',
      'view_dashboard',
    ])
  }
}
