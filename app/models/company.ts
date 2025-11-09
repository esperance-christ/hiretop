import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import User from './user.js'
import * as relations from '@adonisjs/lucid/types/relations'
import CompanyMember from './company_member.js'
import JobOffer from './job_offer.js'

export default class Company extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'admin_id' }) declare adminId: number
  @column() declare name: string
  @column() declare country: string | null
  @column() declare address: string | null
  @column() declare description: string | null
  @column({ columnName: 'logo_url' }) declare logoUrl: string | null

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @column.dateTime() declare deletedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'adminId' }) declare admin: relations.BelongsTo<typeof User>
  @hasMany(() => JobOffer, { foreignKey: 'companyId' }) declare jobOffers: relations.HasMany<typeof JobOffer>
  @hasMany(() => CompanyMember, { foreignKey: 'companyId' }) declare members: relations.HasMany<typeof CompanyMember>
}
