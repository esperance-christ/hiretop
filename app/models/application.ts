import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import * as relations from '@adonisjs/lucid/types/relations'

import TalentProfile from './talent_profile.js'
import JobOffer from './job_offer.js'

export default class Application extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'talent_id' }) declare talentId: number
  @column({ columnName: 'job_offer_id' }) declare jobOfferId: number
  @column({ columnName: 'company_id' }) declare companyId: number
  @column() declare message: string | null
  @column() declare documentUrl: string | null
  @column() declare status: string

  @column.dateTime() declare disponibleAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare appliedAt: DateTime
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @column.dateTime() declare deletedAt: DateTime | null

  @belongsTo(() => TalentProfile, { foreignKey: 'talentId' }) declare talent: relations.BelongsTo<typeof TalentProfile>
  @belongsTo(() => JobOffer, { foreignKey: 'jobOfferId' }) declare jobOffer: relations.BelongsTo<typeof JobOffer>
}
