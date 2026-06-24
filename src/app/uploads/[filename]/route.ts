import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getUploadDir } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Params {
  params: { filename: string }
}

const MIME_BY_EXT: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'video/ogg',
  '.png': 'image/png',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
}

export async function GET(_req: NextRequest, { params }: Params) {
  const filename = path.basename(params.filename)
  const filepath = path.join(getUploadDir(), filename)

  try {
    const file = await readFile(filepath)
    const contentType = MIME_BY_EXT[path.extname(filename).toLowerCase()] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 })
  }
}
