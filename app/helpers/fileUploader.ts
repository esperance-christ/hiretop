import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'
import type { MultipartFile } from '@adonisjs/bodyparser'

export interface UploadResult {

  url: string
  path: string
  fileName: string
  signedUrl?: string
}

/**
 * Upload un fichier unifiée (local ou Supabase Storage)
 *
 * @param file     Fichier provenant d'une requête Inertia/FormData (MultipartFile Adonis)
 * @param folder   Dossier dans le bucket (ex: 'avatars', 'documents', 'cv')
 * @param options  Options supplémentaires
 */
export async function uploadFile(
  file: MultipartFile | null | undefined,
  folder: string = 'general',
  options: {
    visibility?: 'public' | 'private'
    signedUrlExpiresIn?: string // ex: '7d', '1h', '30m'
  } = {}
): Promise<UploadResult> {
  const { visibility = 'public', signedUrlExpiresIn } = options

  if (!file) {
    throw new Error('Aucun fichier fourni')
  }

  if (file.hasErrors) {
    const messages = file.errors.map((e) => e.message).join(', ')
    throw new Error(`Validation échouée : ${messages}`)
  }

  const fileName = `${cuid()}.${file.extname}`
  const normalizedFolder = folder.replace(/^\/+/, '')
  const finalPath = normalizedFolder ? `${normalizedFolder}/${fileName}` : fileName

  await file.moveToDisk(finalPath, {
    visibility,
    contentType: file.headers['content-type'] ?? file.type,
  })

  const disk = drive.use()

  const url = await disk.getUrl(finalPath)

  let signedUrl: string | undefined
  if (signedUrlExpiresIn) {
    signedUrl = await disk.getSignedUrl(finalPath, { expiresIn: signedUrlExpiresIn })
  }

  return {
    url,
    signedUrl,
    path: finalPath,
    fileName,
  }
}

/**
 * Suppression sécurisée d'un fichier
 */
export async function deleteFile(path: string): Promise<void> {
  const disk = drive.use()
  if (await disk.exists(path)) {
    await disk.delete(path)
  }
}
