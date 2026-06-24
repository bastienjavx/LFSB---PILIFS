import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: { category: true, media: true },
  })
  if (!note) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json(note)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, slug, content, excerpt, type, categoryId, published, mediaIds } = body

  const existing = await prisma.note.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Vérifier unicité du slug (sauf pour la note elle-même)
  if (slug && slug !== existing.slug) {
    const conflict = await prisma.note.findFirst({ where: { slug, id: { not: params.id } } })
    if (conflict) return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
  }

  const note = await prisma.note.update({
    where: { id: params.id },
    data: {
      title: title ?? existing.title,
      slug: slug ?? existing.slug,
      content: content ?? existing.content,
      excerpt: excerpt ?? existing.excerpt,
      type: type ?? existing.type,
      published: published ?? existing.published,
      categoryId: categoryId !== undefined ? (categoryId || null) : existing.categoryId,
    },
  })

  // Resync médias si fournis
  if (Array.isArray(mediaIds)) {
    await prisma.media.updateMany({
      where: { noteId: params.id },
      data: { noteId: null },
    })
    if (mediaIds.length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: mediaIds } },
        data: { noteId: params.id },
      })
    }
  }

  return NextResponse.json(note)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.media.updateMany({ where: { noteId: params.id }, data: { noteId: null } })
  await prisma.note.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
