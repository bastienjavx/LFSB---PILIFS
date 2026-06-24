import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/security'

export const dynamic = 'force-dynamic'

// Statut 2FA de l'utilisateur courant (pour la page de gestion).
export async function GET() {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: { twoFactorEnabled: true },
  })
  return NextResponse.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false })
}
