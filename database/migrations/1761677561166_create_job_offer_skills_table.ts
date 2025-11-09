import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'job_offer_skills'

  /**
   * Table Skills associes a une offres
   * ---------------------------------------------------
   * ---------------------------------------------------
   *
   **/

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('job_offer_id').unsigned().references('job_offers.id').onDelete('CASCADE')
      table.integer('skill_id').unsigned().references('skills.id').onDelete('CASCADE')
      table.primary(['job_offer_id', 'skill_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
