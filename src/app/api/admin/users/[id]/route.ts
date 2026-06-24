import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/security'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const ROLES = ['ADMIN', 'EDITOR'] as const

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await requireAdmin()
  if (!me) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const data: { role?: 'ADMIN' | 'EDITOR'; password?: string; lockedUntil?: null; failedAttempts?: number } = {}

  // Changement de rôle (impossible de se rétrograder soi-même : garde-fou
  // contre la perte du dernier ADMIN).
  if (body?.role && ROLES.includes(body.role)) {
    if (target.id === me.id && body.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Vous ne pouvez pas retirer votre propre rôle ADMIN' }, { status: 400 })
    }
    if (target.role === 'ADMIN' && body.role !== 'ADMIN') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (admins <= 1) {
        return NextResponse.json({ error: 'Au moins un administrateur doit rester' }, { status: 400 })
      }
    }
    data.role = body.role
  }

  // Réinitialisation de mot de passe par un admin.
  if (typeof body?.password === 'string') {
    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, { status: 400 })
    }
    data.password = await bcrypt.hash(body.password, 12)
  }

  // Déverrouillage manuel d'un compte.
  if (body?.unlock === true) {
    data.lockedUntil = null
    data.failedAttempts = 0
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, lockedUntil: true, createdAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await requireAdmin()
  if (!me) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  if (params.id === me.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 })

  if (target.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) {
      return NextResponse.json({ error: 'Au moins un administrateur doit rester' }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
