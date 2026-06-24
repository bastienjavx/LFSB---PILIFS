import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : []
  if (ids.length === 0) return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })

  await prisma.$transaction(
    ids.map((id: string, index: number) =>
      prisma.category.update({
        where: { id },
        data: { order: index + 1 },
      }),
    ),
  )

  return NextResponse.json({ ok: true })
}
