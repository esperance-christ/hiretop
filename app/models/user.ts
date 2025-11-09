import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import * as relations from '@adonisjs/lucid/types/relations'

import { MorphMap } from '@holoyan/morph-map-js'
import { AclModelInterface } from '@holoyan/adonisjs-permissions/types'
import { hasPermissions } from '@holoyan/adonisjs-permissions'

import Company from './company.js'
import CompanyMember from './company_member.js'
import TalentProfile from './talent_profile.js'

@MorphMap('users')
export default class User extends compose(BaseModel, hasPermissions()) implements AclModelInterface
{
  getModelId(): number {
    return this.id
  }

  @column({ isPrimary: true }) declare id: number

  @column() declare firstname: string
  @column() declare lastname: string
  @column() declare email: string
  @column() declare profile: string
  @column({ serializeAs: null }) declare password: string

  @column()
  public rememberMeToken?: string
  @column.dateTime() declare emailVerifiedAt: DateTime | null

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @column.dateTime() declare deletedAt: DateTime | null

  @hasOne(() => TalentProfile) declare talentProfile: relations.HasOne<typeof TalentProfile>
  @hasOne(() => Company, { foreignKey: 'admin_id'}) declare company: relations.HasOne<typeof Company>

  @hasMany(() => CompanyMember, { foreignKey: 'user_id' })
  declare companyMemberships: relations.HasMany<typeof CompanyMember>

}
