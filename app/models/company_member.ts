import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";
import Company from "./company.js";
import User from "./user.js";
import * as relations from "@adonisjs/lucid/types/relations";

export default class CompanyMember extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column({ columnName: 'company_id' }) declare companyId: number
  @column({ columnName: 'user_id' }) declare userId: number

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime
  @column.dateTime() declare deletedAt: DateTime | null

  @belongsTo(() => Company, { foreignKey: 'companyId' }) declare company: relations.BelongsTo<typeof Company>
  @belongsTo(() => User, { foreignKey: 'userId' }) declare user: relations.BelongsTo<typeof User>
}
