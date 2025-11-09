import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'

import User from './user.js'
import TalentEducation from './talent_education.js'
import TalentExperience from './talent_experience.js'
import Application from './application.js'
import Skill from './skill.js'

export default class TalentProfile extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'user_id' }) declare userId: number
  @column() declare phone: string | null
  @column() declare title: string | null
  @column() declare bio: string | null
  @column() declare location: string | null
  @column() declare isAvailable: string | null
  @column() declare cvUrl: string | null
  @column() declare linkedinUrl: string | null
  @column() declare githubUrl: string | null

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @column.dateTime() declare deleletedAt: DateTime | null

  @belongsTo(() => User) declare user: relations.BelongsTo<typeof User>
  @hasMany(() => TalentEducation) declare educations: relations.HasMany<typeof TalentEducation>
  @hasMany(() => TalentExperience) declare experiences: relations.HasMany<typeof TalentExperience>
  @manyToMany(() => Skill, { pivotTable: 'talent_skills', pivotColumns: ['level'] })
  declare skills: relations.ManyToMany<typeof Skill>
  @hasMany(() => Application) declare applications: relations.HasMany<typeof Application>
}
