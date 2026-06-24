import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/security'
import { verifyToken } from '@/lib/totp'

export const dynamic = 'force-dynamic'

// Confirme l'activation de la 2FA en validant un premier code de l'application.
export async function POST(req: NextRequest) {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const token = body?.token as string | undefined
  if (!token) return NextResponse.json({ error: 'Code requis' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: me.id } })
  if (!user?.twoFactorSecret) {
    return NextResponse.json({ error: 'Aucune configuration 2FA en cours' }, { status: 400 })
  }

  if (!(await verifyToken(token, user.twoFactorSecret))) {
    return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })
  }

  await prisma.user.update({ where: { id: me.id }, data: { twoFactorEnabled: true } })
  return NextResponse.json({ ok: true })
}
