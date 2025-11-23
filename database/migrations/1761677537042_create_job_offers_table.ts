import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_offers'

  /**
   * Table Offres d'emploi
   * ---------------------------------------------------
   * ---------------------------------------------------
   * Type de contrat : CDI, CDD, FREELANCE, INTERNSHIP
   * Status : DRAFT, PUBLISHED, EXPIRED, CLOSED
   **/

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('company_id').unsigned().references('companies.id').onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('description')
      table.string('location').nullable()

      table.string('remote_type', 20).nullable().comment('ON-SITE, HYBRID, REMOTE')
      table.enum('contract_type', ['CDI', 'CDD', 'FREELANCE', 'INTERNSHIP']).notNullable()
      table.enum('status', ['DRAFT', 'PUBLISHED', 'EXPIRED', 'CLOSED']).defaultTo('DRAFT')

      table.decimal('salary_min', 10, 2).nullable()
      table.decimal('salary_max', 10, 2).nullable()
      table.string('salary_currency', 3).defaultTo('XOF').comment('XOF, EUR, etc.')
      table.boolean('salary_visible').defaultTo(true)

      table.boolean('is_urgent').defaultTo(false).index()
      table.boolean('is_active').defaultTo(true)

      table.dateTime('published_at').nullable().index()
      table.dateTime('expire_at').nullable().index()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
