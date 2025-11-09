import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Skill from '#models/skill'
import data from '#database/data'

export default class SkillSeeder extends BaseSeeder {
  async run() {
    const skills = data.skills

    skills.map(async (sk) => {
      await Skill.firstOrCreate({
        name: sk.name,
        category: sk.category,
      })
    })
  }
}
