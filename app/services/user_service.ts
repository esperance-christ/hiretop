import Company from '#models/company'
import Skill from '#models/skill'
import TalentProfile from '#models/talent_profile'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { Acl } from '@holoyan/adonisjs-permissions'
import { DateTime } from 'luxon'

export default class UserService {
  /**
   * Create a user with optional role (e.g. 'talent' or 'recruiter')
   */
  async createUser(data: {
    firstname: string
    lastname: string
    email: string
    password: string
    profile: string | null
    role?: 'TALENT' | 'COMPANY_ADMIN' | 'RECRUITER' | 'ADMIN'
  }) {
    const user = await User.create({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      emailVerifiedAt: DateTime.now(),
    })

    if (data.role) {
      await Acl.model(user).assignRole(data.role)
    } else {
      // Si aucun role preiser, on le met
      await Acl.model(user).assignRole('TALENT')
    }

    return user
  }

  async updateUser(user: User, payload: Partial<User> & { profileFile?: any }) {

    if (payload.profileFile) {
      const fileName = `${cuid()}.${payload.profileFile.extname}`
      await payload.profileFile.moveToDisk('profiles', { name: fileName })
      payload.profile = await drive.use().getUrl(`profiles/${fileName}`)
    }

    user.merge(payload)
    await user.save()
    return user
  }

  async getUser(user: User){
    const fullUser = await User.query().where('id', user.id).firstOrFail()

    const talentProfile = await TalentProfile.query()
      .where('user_id', user.id)
      .first()

    const company = await Company.query()
      .where('admin_id', user.id)
      .first()

    const skills = await Skill.all()

    return {
      ...fullUser.$attributes,
      talentProfile,
      company,
      skills
    }
  }

  async delete(user: User) {
    user.deletedAt = DateTime.now()
    await user.save()
    return true
  }
}
