import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/security'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

const ROLES = ['ADMIN', 'EDITOR'] as const

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
      lockedUntil: true,
      createdAt: true,
    },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const email = body?.email?.toLowerCase().trim()
  const name = body?.name?.trim() || null
  const password = body?.password as string | undefined
  const role = ROLES.includes(body?.role) ? body.role : 'ADMIN'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name, password: hash, role },
    select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true, createdAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}
