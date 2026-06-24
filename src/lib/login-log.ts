import { prisma } from '@/lib/prisma'

// Anti-brute-force : au-delà de MAX_ATTEMPTS échecs consécutifs, le compte est
// verrouillé pendant LOCK_MINUTES minutes.
export const MAX_ATTEMPTS = 5
export const LOCK_MINUTES = 15

/** Enregistre une tentative de connexion dans le journal (best-effort). */
export async function logLogin(data: {
  userId?: string | null
  email: string
  success: boolean
  reason?: string
  ip?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.loginEvent.create({
      data: {
        userId: data.userId ?? null,
        email: data.email,
        success: data.success,
        reason: data.reason ?? null,
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
      },
    })
  } catch {
    // Le journal ne doit jamais bloquer une connexion.
  }
}
