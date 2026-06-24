import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/security'

export const dynamic = 'force-dynamic'

// Journal des 100 dernières tentatives de connexion (réservé aux ADMIN).
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  const events = await prisma.loginEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      email: true,
      success: true,
      reason: true,
      ip: true,
      createdAt: true,
    },
  })
  return NextResponse.json(events)
}
