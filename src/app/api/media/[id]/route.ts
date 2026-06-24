import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUploadDir } from '@/lib/utils'
import { unlink } from 'fs/promises'
import path from 'path'

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const media = await prisma.media.findUnique({ where: { id: params.id } })
  if (!media) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Supprimer le fichier physique
  const uploadDir = getUploadDir()
  const filename = path.basename(media.url)
  const filepath = path.join(uploadDir, filename)

  try {
    await unlink(filepath)
  } catch {
    // Le fichier peut déjà ne plus exister
  }

  await prisma.media.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const media = await prisma.media.update({
    where: { id: params.id },
    data: {
      ...(body.alt !== undefined ? { alt: body.alt } : {}),
      ...(body.noteId !== undefined ? { noteId: body.noteId || null } : {}),
    },
  })
  return NextResponse.json(media)
}
