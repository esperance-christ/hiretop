import Company from '#models/company'
import CompanyMember from '#models/company_member'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import drive from '@adonisjs/drive/services/main'
import { Acl } from '@holoyan/adonisjs-permissions'

interface createCompany {
  name: string
  country: string | null
  address: string | null
  description: string | null
  logo?: any
}

interface updateCompany extends Partial<createCompany> {}

export class CompanyService {
  /**
   * Recuperation des informations de l'entreprise
   * @param companyId ID de l'entreprise
   * @param userId ID de l'utilisateur
   */
  async getCompany(companyId: number) {
    return Company.query()
      .where('id', companyId)
      .preload('admin')
      .preload('jobOffers')
      .preload('members')
      .first()
  }

  /**
   * Creation d'une entrprise
   * @param data Données à pour la creation de l'entreprise
   * @param userId ID de l'utilisateur admin
   */
  async createCompany(userId: number, data: createCompany): Promise<Company> {
    // Verifier l'existence d'une entreprise
    const { name } = data

    const existCompany = await Company.query().where('name', name).first()
    if (existCompany) throw new Error('Cette entreprise existe deja. Veuillez en creer un nouveau.')

    const admin = await User.findBy('id', userId)
    if (!admin) throw new Error('Utilisateu non trouvee')
    const isComapnyAdmin = await Acl.model(admin).hasRole('COMPANY_ADMIN')
    if (!isComapnyAdmin) throw new Error("Ce compte n'est pas autorise")

    const newCompany = await Company.create({
      adminId: admin.id,
      name: data.name,
      description: data.description,
      address: data.address,
      country: data.country,
    })

    // Creation du premier utilisateur
    await CompanyMember.create({
      userId: admin.id,
      companyId: newCompany.id
    })

    return newCompany
  }

  /**
   * Mise à jour des informations de l'entreprise
   * @param data Données à mettre à jour
   * @param companyId ID de l'entreprise
   */
  async updateCompany(userId: number, companyId: number, data: updateCompany): Promise<Company> {
    const company = await Company.query()
      .where('id', companyId)
      .preload('admin')
      .preload('members')
      .firstOrFail()

    // Verifier que líd que souhqite modifier les informations appatient au company
    const isMember = company.members.find((m) => {
      return m.userId === userId
    })

    if (!isMember) {
      throw new Error("Vous n'êtes pas autorisé à effectuer cette action:")
    }

    if (data.name !== undefined) company.name = data.name
    if (data.country !== undefined) company.country = data.country
    if (data.description !== undefined) company.description = data.description
    if (data.address !== undefined) company.address = data.address

    // Modification du logo de l'entreprise
    if (data.logo) {
      const fileName = `${cuid()}.${data.logo.extname}`
      await data.logo.moveToDisk('companies', { name: fileName }, 'local')
      company.logoUrl = await drive.use().getUrl(`companies/${fileName}`)
    }

    await company.save()

    await company.load('admin')
    await company.load('jobOffers')
    await company.load('members')

    return company
  }
}
