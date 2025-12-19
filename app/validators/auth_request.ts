import vine from '@vinejs/vine'

/**
 * Validation de la requete d'inscription de talent
 */
export const registerUserValidation = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .toLowerCase()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      })
      .trim(),
    firstname: vine.string().trim().minLength(2),
    lastname: vine.string().trim().minLength(2),
    password: vine.string().minLength(8),
  })
)

export const registerCompanyUserValidation = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .toLowerCase()
      .unique(async (query, field) => {
        const user = await query.from('users').where('email', field).first()
        return !user
      })
      .trim(),
    firstname: vine.string().trim().minLength(2),
    lastname: vine.string().trim().minLength(2),
    company: vine.string().trim().minLength(2),
    password: vine.string().minLength(8),
  })
)

/**
 * Validation de la requete de connexion
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({ email: vine.string().email() })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    id: vine.number(),
    hash: vine.string(),
    password: vine.string().minLength(8),
    password_confirmation: vine.string().confirmed(),
  })
)
