import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: { note: { select: { id: true, title: true, slug: true } } },
  })
  return NextResponse.json(media)
}
