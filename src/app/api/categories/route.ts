import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { notes: { where: { published: true } } } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { name, icon, color = '#15803d' } = body
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const slug = body.slug || toSlug(name)
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 })

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? 0) + 1

  const category = await prisma.category.create({
    data: { name, slug, icon: icon || null, color, order },
  })
  return NextResponse.json(category, { status: 201 })
}
