import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'company_members'

  /**
   * Membre d'une entreprise
   * ---------------------------------------------------
   * ---------------------------------------------------
   * l'admin de l'entreprise peut ajouter un
   * nouvel utilisateur en tant que membre de l'entreprise
   * ---------------------------------------------------
   *
   **/

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('company_id').unsigned().references('companies.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')

      table.unique(['company_id', 'user_id'])
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
