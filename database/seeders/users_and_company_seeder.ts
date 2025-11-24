import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Company from '#models/company'
import CompanyMember from '#models/company_member'
import JobOffer from '#models/job_offer'
import Skill from '#models/skill'
import Hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { Acl } from '@holoyan/adonisjs-permissions'

export default class UserAndCompanySeeder extends BaseSeeder {
  async run() {
    // === Creations des Utilisateurs + Assignation des Roles et Permissions ===
    const usersData = [
      {
        email: 'super@hiretop.com',
        firstname: 'Super',
        lastname: 'Admin',
        role: 'SUPER_ADMIN',
        scope: 'admin',
        permissions: [
          'manage_users',
          'manage_roles',
          'view_dashboard',
          'delete_company',
          'restore_user',
          'manage_company',
          'add_member',
          'remove_member',
          'create_job_offer',
          'edit_job_offer',
          'delete_job_offer',
          'view_applications',
          'apply_job',
          'view_own_applications',
        ],
      },
      {
        email: 'sarah@hiretop.com',
        firstname: 'Sarah',
        lastname: 'System',
        role: 'ADMIN',
        scope: 'admin',
        permissions: [
          'manage_users',
          'manage_roles',
          'view_dashboard',
          'delete_company',
          'restore_user',
        ],
      },
      {
        email: 'alice@digitalcompany.com',
        firstname: 'Alice',
        lastname: 'Dupont',
        role: 'COMPANY_ADMIN',
        scope: 'company',
        permissions: [
          'manage_company',
          'add_member',
          'remove_member',
          'create_job_offer',
          'edit_job_offer',
          'delete_job_offer',
          'view_applications',
          'view_dashboard',
        ],
      },
      {
        email: 'bob@digitalcompany.com',
        firstname: 'Bob',
        lastname: 'Martin',
        role: 'RECRUITER',
        scope: 'company',
        permissions: ['create_job_offer', 'edit_job_offer', 'view_applications', 'view_dashboard'],
      },
      {
        email: 'charlie@talent.com',
        firstname: 'Charlie',
        lastname: 'Lemoine',
        role: 'TALENT',
        scope: 'talent',
        permissions: ['apply_job', 'view_own_applications', 'view_dashboard'],
      },
    ]

    const createdUsers: User[] = []

    for (const data of usersData) {
      const user = await User.firstOrCreate(
        { email: data.email },
        {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          password: await Hash.make('password123'),
          profile: '',
          emailVerifiedAt: DateTime.now()
        }
      )
      const currentUser = await User.query().where('id', user.id).firstOrFail()
      await Acl.model(currentUser).assignRole(data.role)

      if (data.permissions.length > 0) {
        if (data.scope === 'company') {
          for (const perm of data.permissions) {
            await Acl.model(currentUser).allow(perm)
          }
        }
      }
      createdUsers.push(currentUser)
    }

    // === Creation Entreprise ===
    const company = await Company.firstOrCreate(
      { name: 'Digital Company' },
      {
        adminId: 3,
        name: 'Digital Company',
        country: 'Ghana',
        address: 'Aflao rivery',
        description:
          'Entreprise spécialisée dans le développement de solutions web et services cloud.',
      }
    )

    for (const user of createdUsers) {
      const config = usersData.find((u) => u.email === user.email)!

      if (config.scope === 'company') {
        await CompanyMember.firstOrCreate(
          { companyId: company.id, userId: user.id },
          { companyId: company.id, userId: user.id }
        )
      }
    }

    // === Creation d'une Offre d’emploi ===
    const jobOffer = await JobOffer.firstOrCreate(
      { companyId: company.id, title: 'Développeur Full-Stack React / Node.js' },
      {
        companyId: company.id,
        title: 'Développeur Full-Stack React / Node.js',
        description: `
**Missions principales :**
- Concevoir et développer des applications web modernes
- Intégrer des API RESTful
- Optimiser les performances et l’expérience utilisateur
- Collaborer avec les designers et product owners

**Profil recherché :**
- Minimum 3 ans d’expérience
- Maîtrise de React, Node.js, TypeScript
- Connaissance de Git, Docker, CI/CD
- Esprit d’équipe et autonomie

**Avantages :**
- Télétravail 3 jours/semaine
- 13ème mois + prime
- Formation continue
- Équipe dynamique
        `.trim(),
        location: 'Paris ou Remote',
        remoteType: 'HYBRID',
        contractType: 'CDI',
        status: 'PUBLISHED',
        isActive: true,
        isUrgent: true,
        salaryMin: 45000,
        salaryMax: 65000,
        publishedAt: DateTime.now(),
        expireAt: DateTime.now().plus({ days: 30 }),
      }
    )

    // === Compétences ===
    const requiredSkills = ['React', 'Node.js', 'TypeScript', 'Git', 'Docker']
    const skills = await Skill.query().whereIn('name', requiredSkills).exec()
    if (skills.length > 0) {
      await jobOffer.related('skills').sync(skills.map((s) => s.id))
    }

    console.log('Seed terminé avec succès :')
    console.log(`  Offre : "${jobOffer.title}"`)
    console.log(`  Entreprise : ${company.name}`)
    console.log(`  Utilisateurs : ${createdUsers.map((u) => u.email).join(', ')}`)
  }
}
