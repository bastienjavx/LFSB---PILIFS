import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/totp'
import { logLogin, MAX_ATTEMPTS, LOCK_MINUTES } from '@/lib/login-log'
import bcrypt from 'bcryptjs'

// Erreur métier renvoyée à NextAuth : le `message` remonte côté client via
// l'URL d'erreur, ce qui permet d'afficher un message précis (2FA requise…).
class AuthError extends Error {}

function clientIp(headers?: Record<string, string>): string | null {
  if (!headers) return null
  const fwd = headers['x-forwarded-for'] || headers['x-real-ip']
  return fwd ? fwd.split(',')[0].trim() : null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        token: { label: 'Code 2FA', type: 'text' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password
        const token = credentials?.token
        const ip = clientIp(req?.headers as Record<string, string> | undefined)
        const userAgent = (req?.headers as Record<string, string> | undefined)?.['user-agent'] ?? null

        if (!email || !password) {
          throw new AuthError('Identifiants manquants')
        }

        const user = await prisma.user.findUnique({ where: { email } })

        // On répond de façon identique si le compte n'existe pas ou si le mot de
        // passe est faux, pour ne pas révéler l'existence d'un compte.
        if (!user) {
          await logLogin({ email, success: false, reason: 'unknown_user', ip, userAgent })
          throw new AuthError('Email ou mot de passe incorrect')
        }

        // 1) Compte verrouillé ?
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await logLogin({ userId: user.id, email, success: false, reason: 'locked', ip, userAgent })
          throw new AuthError('Compte temporairement verrouillé. Réessayez plus tard.')
        }

        // 2) Mot de passe
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
          await registerFailure(user.id)
          await logLogin({ userId: user.id, email, success: false, reason: 'bad_password', ip, userAgent })
          throw new AuthError('Email ou mot de passe incorrect')
        }

        // 3) 2FA TOTP (si activée pour ce compte)
        if (user.twoFactorEnabled) {
          if (!token) {
            await logLogin({ userId: user.id, email, success: false, reason: '2fa_required', ip, userAgent })
            throw new AuthError('Code 2FA requis')
          }
          if (!user.twoFactorSecret || !(await verifyToken(token, user.twoFactorSecret))) {
            await registerFailure(user.id)
            await logLogin({ userId: user.id, email, success: false, reason: 'bad_2fa', ip, userAgent })
            throw new AuthError('Code 2FA incorrect')
          }
        }

        // Succès : on réinitialise le compteur d'échecs et on journalise.
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        })
        await logLogin({ userId: user.id, email, success: true, ip, userAgent })

        return { id: user.id, email: user.email, role: user.role, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const u = user as unknown as { role: string; name?: string | null }
        token.role = u.role
        token.name = u.name ?? null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id: string; role: string; name?: string | null }
        u.id = token.id as string
        u.role = token.role as string
        u.name = (token.name as string | null) ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

/** Incrémente le compteur d'échecs et verrouille le compte au-delà du seuil. */
async function registerFailure(userId: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { failedAttempts: { increment: 1 } },
    select: { failedAttempts: true },
  })
  if (updated.failedAttempts >= MAX_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000),
        failedAttempts: 0,
      },
    })
  }
}
