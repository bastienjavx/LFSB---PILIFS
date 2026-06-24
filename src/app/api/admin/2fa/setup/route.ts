import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/security'
import { generateSecret, buildEnrollment } from '@/lib/totp'

export const dynamic = 'force-dynamic'

// Génère un nouveau secret TOTP pour l'utilisateur courant et renvoie le QR code.
// Le secret est stocké mais la 2FA reste DÉSACTIVÉE tant qu'un code valide n'a
// pas été confirmé via /api/admin/2fa/enable.
export async function POST() {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: me.id } })
  if (!user) return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 })
  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: 'La 2FA est déjà activée' }, { status: 409 })
  }

  const secret = generateSecret()
  await prisma.user.update({ where: { id: me.id }, data: { twoFactorSecret: secret } })

  const { otpauthUrl, qrDataUrl } = await buildEnrollment(user.email, secret)
  return NextResponse.json({ secret, otpauthUrl, qrDataUrl })
}
