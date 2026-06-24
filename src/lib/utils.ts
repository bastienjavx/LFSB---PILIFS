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

// Convertit les liens internes Obsidian en markdown.
// Supporte [[Titre]] et l'alias [[Titre|texte affiché]].
export function parseObsidianLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, alias] = String(inner).split('|')
    const slug = toSlug(target.trim())
    const label = (alias || target).trim()
    return `[${label}](/signes/${slug})`
  })
}

// Extrait les cibles [[...]] d'un contenu, normalisées en slug.
export function extractLinkSlugs(content: string): string[] {
  const slugs = new Set<string>()
  const re = /\[\[([^\]]+)\]\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content)) !== null) {
    const target = String(m[1]).split('|')[0].trim()
    if (target) slugs.add(toSlug(target))
  }
  return Array.from(slugs)
}

interface BacklinkCandidate {
  id: string
  title: string
  slug: string
  content: string
  category?: { color: string; icon: string | null; slug: string } | null
}

// Trouve les notes (candidats) qui lient vers `target` via [[...]].
export function findBacklinks(
  target: { slug: string; title: string },
  candidates: BacklinkCandidate[],
): BacklinkCandidate[] {
  const targetSlug = target.slug
  const titleSlug = toSlug(target.title)
  return candidates.filter((c) => {
    const links = extractLinkSlugs(c.content || '')
    return links.includes(targetSlug) || links.includes(titleSlug)
  })
}
