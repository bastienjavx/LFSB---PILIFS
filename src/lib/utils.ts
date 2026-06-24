import slugify from 'slugify'
import path from 'path'
import fs from 'fs'

export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: 'fr' })
}

export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
}

export function ensureUploadDir(): void {
  const dir = getUploadDir()
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'GIF' | 'DOCUMENT' {
  if (mimeType.startsWith('image/gif')) return 'GIF'
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  return 'DOCUMENT'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Convertit les liens internes Obsidian [[note]] en markdown [note](/signes/slug)
export function parseObsidianLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const slug = toSlug(title)
    return `[${title}](/signes/${slug})`
  })
}
