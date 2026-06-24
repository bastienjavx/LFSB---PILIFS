import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type SessionUser = { id: string; email: string; role: string; name?: string | null }

/** Session courante (ou null) avec le typage utilisateur enrichi. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  return (session?.user as SessionUser | undefined) ?? null
}

/** Exige une session ADMIN ; renvoie l'utilisateur ou null si non autorisé. */
export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}
