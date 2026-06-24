import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUploadDir, ensureUploadDir, getMediaType } from '@/lib/utils'
import { writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg',
]
const MAX_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const noteId = form.get('noteId') as string | null

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Type non autorisé: ${file.type}` }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 100 MB)' }, { status: 400 })
  }

  ensureUploadDir()
  const uploadDir = getUploadDir()

  const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
  const hash = crypto.randomBytes(8).toString('hex')
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_')
  const filename = `${Date.now()}-${hash}-${safeName}`
  const filepath = path.join(uploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || '/uploads'
  const url = `${baseUrl}/${filename}`
  const mediaType = getMediaType(file.type)

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url,
      mimeType: file.type,
      size: file.size,
      type: mediaType,
      noteId: noteId || null,
    },
  })

  return NextResponse.json({ media }, { status: 201 })
}
