import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'talent_profiles'
  protected userEducationsTable = 'talent_educations'
  protected userExperiencesTable = 'talent_experiences'
  protected userSkillsTable = 'talent_skills'

  /**
   * Table talent_profiles
   * ---------------------------------------------------
   * ---------------------------------------------------
   * Informations sur le profile du talent
   * (CV, parcours academique, experience professionnel, bio, etc...)
   * ---------------------------------------------------
   * ---------------------------------------------------
   *
   **/

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().unique().references('users.id').onDelete('CASCADE')
      table.string('title').nullable()
      table.string('phone', 20).nullable()
      table.string('location').nullable()
      table.string('is_available').nullable()
      table.text('bio').nullable()
      table.string('cv_url').nullable()
      table.string('linkedin_url').nullable()
      table.string('github_url').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.timestamp('deleted_at').nullable()
    })

    // Informations Academiques
    this.schema.createTable(this.userEducationsTable, (table) => {
      table.increments('id').primary()
      table.integer('talent_id').unsigned().references('talent_profiles.id').onDelete('CASCADE')
      table.string('degree', 255).notNullable() // intitule du diplome / formation / certification ex. master informatique
      table.string('institution', 255).notNullable() // ecole /universite / centre de formation ex. EPITEC
      table.integer('start_at').nullable()
      table.integer('end_at').nullable()
      table.boolean('is_current').defaultTo(false) // si en cours de formation ou terminee.
      table.text('description').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.timestamp('deleted_at').nullable()

      table.index('talent_id')
    })

    // Experiences Professionnelles
    this.schema.createTable(this.userExperiencesTable, (table) => {
      table.increments('id').primary()
      table.integer('talent_id').unsigned().references('talent_profiles.id').onDelete('CASCADE')
      table.string('job_title', 150).notNullable()
      table.string('company_name', 200).notNullable()
      table.string('location', 150).nullable()
      table.boolean('is_current').defaultTo(false)
      table.date('start_at').notNullable()
      table.date('end_at').nullable()
      table.text('description').nullable()

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      table.timestamp('deleted_at').nullable()

      table.index('talent_id')
    })

    // Competences
    this.schema.createTable(this.userSkillsTable, (table) => {
      table.increments('id').primary()
      table.integer('talent_id').unsigned().references('talent_profiles.id').onDelete('CASCADE')
      table.integer('skill_id').unsigned().references('skills.id').onDelete('CASCADE')
      table.integer('level').nullable() // (1=debutant, 3=expert)
      table.boolean('is_validated').defaultTo(false).comment('Validé par admin ou certificat')

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()

      table.unique(['talent_id', 'skill_id'])
      table.index('talent_id')
      table.index('skill_id')
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.userSkillsTable)
    this.schema.dropTableIfExists(this.userExperiencesTable)
    this.schema.dropTableIfExists(this.userEducationsTable)
    this.schema.dropTable(this.tableName)
  }
}
