import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_offers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('closed_at').nullable().after('expire_at')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('closed_at')
    })
  }
}
