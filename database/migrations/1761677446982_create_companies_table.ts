import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'companies'

  /**
     * Table Entreprise
     * ---------------------------------------------------
     * ---------------------------------------------------
     * Au cours du processus d'inscription en tant que
     * recruiter, l'utilisateur doit enregistrer/creer son
     * entreprise.
     * ---------------------------------------------------
     * ---------------------------------------------------
     *
     **/

    async up() {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id').primary()
        table.integer('admin_id').unsigned().references('users.id').onDelete('SET NULL')
        table.string('name').notNullable()
        table.text('country').nullable()
        table.text('address').nullable()
        table.text('description').nullable()
        table.string('logo_url').nullable()

        table.timestamp('created_at').defaultTo(this.now())
        table.timestamp('updated_at').defaultTo(this.now())
        table.timestamp('deleted_at').nullable()
      })
    }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
