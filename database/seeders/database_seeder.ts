import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class DatabaseSeeder extends BaseSeeder {
  private async importSeeder(path: string) {
    const { default: Seeder } = await import(path)
    return new Seeder()
  }

  async run() {
    const seeders = [
      '#database/seeders/role_seeder',
      '#database/seeders/permission_seeder',
      '#database/seeders/skill_seeder',
      // '#database/seeders/users_and_company_seeder',
    ]

    for (const seederPath of seeders) {
      const seeder = await this.importSeeder(seederPath)
      await seeder.run()
      console.log(`${seeder.constructor.name} exécuté`)
    }

  }
}
