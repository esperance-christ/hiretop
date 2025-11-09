import data from '#database/data'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { Acl } from '@holoyan/adonisjs-permissions'

export default class PermissionSeeder extends BaseSeeder {
  async run() {
    const permissions = data.permissions

    for (const perm of permissions) {
      await Acl.permission().create(
        {
          slug: perm.slug,
          title: perm.title,
          scope: 'default',
          entityType: '*',
          allowed: true,
        }
      )
    }
  }

}
