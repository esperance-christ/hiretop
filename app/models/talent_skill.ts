import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'

import Skill from './skill.js'
import TalentProfile from './talent_profile.js'

export default class TalentSkill extends BaseModel {
  @column({ isPrimary: true }) declare id: number

  @column() declare talent_id: number
  @column() declare skill_id: number
  @column() declare level: number | null
  @column() declare is_validated: boolean

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @column.dateTime() declare deletedAt: DateTime | null

  @belongsTo(() => TalentProfile, { foreignKey: 'talent_id'}) declare user: relations.BelongsTo<typeof TalentProfile>
  @belongsTo(() => Skill) declare skill: relations.BelongsTo<typeof Skill>
}
