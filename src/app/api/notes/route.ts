import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || undefined
  const category = searchParams.get('category') || undefined
  const published = searchParams.get('published')

  // Seul un admin connecté peut voir les brouillons : sinon on force `published`.
  const session = await getServerSession(authOptions)
  const publishedFilter = session
    ? published !== null
      ? { published: published === 'true' }
      : {}
    : { published: true }

  const notes = await prisma.note.findMany({
    where: {
      ...(type ? { type: type as 'SIGN' | 'INFORMATION' | 'PAGE' } : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...publishedFilter,
    },
    orderBy: { updatedAt: 'desc' },
    include: { category: true, media: { take: 1 } },
  })

  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, content = '', excerpt = '', type = 'SIGN', categoryId, published = false, mediaIds = [] } = body

  if (!title) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })

  const slugBase = body.slug || toSlug(title)
  let slug = slugBase
  let i = 1
  while (await prisma.note.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${i++}`
  }

  const note = await prisma.note.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      type,
      published,
      categoryId: categoryId || null,
    },
  })

  // Associer les médias existants
  if (mediaIds.length > 0) {
    await prisma.media.updateMany({
      where: { id: { in: mediaIds } },
      data: { noteId: note.id },
    })
  }

  return NextResponse.json(note, { status: 201 })
}
