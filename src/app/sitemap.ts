import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { NoteType } from '@prisma/client'

// Généré à la requête : la DB n'est pas joignable pendant le build Docker.
export const dynamic = 'force-dynamic'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/signes`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/information`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const notes = await prisma.note.findMany({
      where: { published: true, type: NoteType.SIGN },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const signRoutes: MetadataRoute.Sitemap = notes.map((note) => ({
      url: `${siteUrl}/signes/${note.slug}`,
      lastModified: note.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...signRoutes]
  } catch {
    return staticRoutes
  }
}
