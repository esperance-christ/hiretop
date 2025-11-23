import vine from '@vinejs/vine'

export const createJobValidator = vine.compile(
  vine.object({
    title: vine.string(),
    description: vine.string(),
    location: vine.string().nullable(),
    onRemote: vine.enum(['ON-SITE', 'HYBRID', 'REMOTE']).optional(),
    contractType: vine.enum(['CDI', 'CDD', 'FREELANCE', 'INTERNSHIP']),
    salaryMin: vine.number().min(1).optional(),
    salaryMax: vine.number().min(5).optional(),
    isUrgent: vine.boolean().optional(),
    expireAt: vine.date().optional(),
    skillIds: vine.array(vine.number())
  })
)


