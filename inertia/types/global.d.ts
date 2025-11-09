import { DateTime } from 'luxon'

declare global {
  interface Company {
    id: number
    adminId: number
    name: string
    country?: string | null
    address?: string | null
    description?: string | null
    logoUrl?: string | null
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    admin: User
    jobOffers: JobOffer[]
    members: CompanyMember[]
  }

  interface CompanyMember {
    id: number
    companyId: number
    userId: number
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    company: Company
    user: User
  }

  interface Skill {
    id: number
    name: string
  }

  interface JobOffer {
    id: number
    companyId: number
    title: string
    description?: string | null
    location?: string | null
    remoteType?: string | null
    contractType: 'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP'
    status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'CLOSED'
    salaryMin?: number | null
    salaryMax?: number | null
    isUrgent: boolean
    isActive: boolean
    publishedAt?: DateTime | null
    expireAt?: DateTime | null
    createdAt: DateTime
    updatedAt?: DateTime | null
    deletedAt?: DateTime | null
    company: Company
    skills: Skill[]
    applications: Application[]
  }

  interface Application {
    id: number
    talentId: number
    jobOfferId: number
    companyId: number
    message?: string | null
    documentUrl?: string | null
    status: string
    disponibleAt?: DateTime | null
    appliedAt: DateTime
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    talent: TalentProfile
    jobOffer: JobOffer
  }

  interface TalentProfile {
    id: number
    userId: number
    phone?: string | null
    title?: string | null
    bio?: string | null
    location?: string | null
    isAvailable?: string | null
    cvUrl?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    createdAt: DateTime
    updatedAt?: DateTime | null
    deleletedAt?: DateTime | null
    user: User
    educations: TalentEducation[]
    experiences: TalentExperience[]
    skills: Skill[]
    applications: Application[]
  }

  interface TalentEducation {
    id: number
    talentId: number
    degree: string
    institution: string
    startAt?: number | null
    endAt?: number | null
    isCurrent: boolean
    description?: string | null
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    user: TalentProfile
  }

  interface TalentExperience {
    id: number
    talentId: number
    jobTitle: string
    companyName: string
    location?: string | null
    isCurrent: boolean
    startAt: string
    endAt?: string | null
    description?: string | null
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    user: TalentProfile
  }

  interface TalentSkill {
    id: number
    talentId: number
    skillId: number
    level?: number | null
    isValidated: boolean
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime | null
    user: TalentProfile
    skill: Skill
  }

  interface User {
    id: number
    firstname: string
    lastname: string
    email: string
    profile: string | null
    emailVerifiedAt: string | null
    roles: string[]
    isTalent: boolean
    isCompanyAdmin: boolean
    isRecruiter: boolean
    talentProfile: TalentProfile | null
  }

  interface PageProps {
    appName: string
    flash: { message?: string; error?: string }
    auth: {
      user?: User | null
    } | null
    offers: JobOffer[]
    applications: Application[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
    filters: {
      search?: string
      location?: string
      contractType?: string
      from?: string
      to?: string
    }
    [key: string]: any
  }
}
