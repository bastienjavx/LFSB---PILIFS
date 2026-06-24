import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

// Import d'un vault Obsidian: accepte un zip ou un tableau de fichiers markdown
// Le corps JSON est: { files: [{ name: string, content: string }] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { files, publish = false } = body as {
    files: { name: string; content: string }[]
    publish?: boolean
  }

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'Fichiers manquants' }, { status: 400 })
  }

  const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] }

  for (const file of files) {
    try {
      if (!file.name.endsWith('.md')) { results.skipped++; continue }

      const title = file.name.replace(/\.md$/, '')
      const slug = toSlug(title)

      // Extraire le frontmatter YAML s'il existe
      let content = file.content
      let excerpt = ''
      let categorySlug: string | null = null

      const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
      if (fmMatch) {
        content = content.slice(fmMatch[0].length)
        const fm = fmMatch[1]
        const descMatch = fm.match(/description:\s*(.+)/)
        if (descMatch) excerpt = descMatch[1].trim()
        const catMatch = fm.match(/category:\s*(.+)/)
        if (catMatch) categorySlug = toSlug(catMatch[1].trim())
      }

      // Si pas d'excerpt, utiliser la première ligne non vide
      if (!excerpt) {
        const firstLine = content.split('\n').find((l) => l.trim() && !l.startsWith('#'))
        if (firstLine) excerpt = firstLine.trim().slice(0, 200)
      }

      let categoryId: string | null = null
      if (categorySlug) {
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } })
        categoryId = cat?.id ?? null
      }

      const existing = await prisma.note.findUnique({ where: { slug } })
      if (existing) {
        await prisma.note.update({
          where: { slug },
          data: { title, content, excerpt, categoryId, ...(publish ? { published: true } : {}) },
        })
        results.updated++
      } else {
        await prisma.note.create({
          data: { title, slug, content, excerpt, categoryId, published: publish, type: 'SIGN' },
        })
        results.created++
      }
    } catch (err) {
      results.errors.push(`${file.name}: ${(err as Error).message}`)
    }
  }

  return NextResponse.json(results)
}
