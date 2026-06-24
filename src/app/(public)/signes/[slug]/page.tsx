import { prisma } from '@/lib/prisma'
import { parseObsidianLinks } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NoteType } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await prisma.note.findUnique({ where: { slug: params.slug } })
  if (!note) return { title: 'Signe introuvable' }
  return { title: note.title, description: note.excerpt || undefined }
}

export async function generateStaticParams() {
  // La base de données n'est pas joignable pendant le build (Railway/Docker).
  // On génère les pages à la demande (ISR via `revalidate`) plutôt qu'au build.
  try {
    const notes = await prisma.note.findMany({
      where: { published: true },
      select: { slug: true },
    })
    return notes.map((n) => ({ slug: n.slug }))
  } catch {
    return []
  }
}

export default async function SignePage({ params }: Props) {
  const note = await prisma.note.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      category: true,
      media: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!note) notFound()

  const video = note.media.find((m) => m.type === 'VIDEO')
  const images = note.media.filter((m) => m.type === 'IMAGE' || m.type === 'GIF')

  // Signes liés dans la même catégorie
  const related = note.categoryId
    ? await prisma.note.findMany({
        where: {
          published: true,
          type: NoteType.SIGN,
          categoryId: note.categoryId,
          id: { not: note.id },
        },
        take: 6,
        include: { media: { where: { type: { in: ['IMAGE', 'GIF'] } }, take: 1 } },
      })
    : []

  const parsedContent = parseObsidianLinks(note.content)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-green-700">🏠</Link>
        <span aria-hidden>/</span>
        <Link href="/signes" className="hover:text-green-700">Signes</Link>
        {note.category && (
          <>
            <span aria-hidden>/</span>
            <Link
              href={`/signes?categorie=${note.category.slug}`}
              className="hover:text-green-700"
            >
              {note.category.icon} {note.category.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="text-gray-800 font-medium" aria-current="page">{note.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Vidéo / Image principale */}
        <div className="space-y-4">
          {video ? (
            <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
              <video
                src={video.url}
                controls
                playsInline
                className="w-full h-full"
                aria-label={`Vidéo du signe LFSB: ${note.title}`}
                poster={images[0]?.url}
              >
                <track kind="captions" label="Sous-titres français" srcLang="fr" />
                Votre navigateur ne supporte pas la vidéo HTML5.
              </video>
            </div>
          ) : images[0] ? (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={images[0].url}
                alt={images[0].alt || `Signe LFSB: ${note.title}`}
                className="w-full object-contain bg-green-50"
              />
            </div>
          ) : (
            <div className="aspect-square bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-8xl" role="img" aria-label={note.title}>
                {note.category?.icon || '👐'}
              </span>
            </div>
          )}

          {/* Galerie images supplémentaires */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.slice(1).map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt || note.title}
                  className="rounded-xl object-cover aspect-square w-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="space-y-4">
          {note.category && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ backgroundColor: note.category.color + '20', color: note.category.color }}
            >
              <span aria-hidden>{note.category.icon}</span>
              {note.category.name}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{note.title}</h1>

          {note.excerpt && (
            <p className="text-lg text-gray-600 font-medium">{note.excerpt}</p>
          )}

          {note.content && (
            <div className="prose prose-green max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedContent}
              </ReactMarkdown>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <Link href="/signes" className="text-green-700 hover:underline text-sm flex items-center gap-1">
              <span aria-hidden>←</span> Retour aux signes
            </Link>
          </div>
        </div>
      </div>

      {/* Signes liés */}
      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span aria-hidden>🔗</span> Signes liés
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/signes/${rel.slug}`}
                className="sign-card group"
                aria-label={`Voir le signe: ${rel.title}`}
              >
                <div className="aspect-square bg-green-50 flex items-center justify-center overflow-hidden">
                  {rel.media[0] ? (
                    <img
                      src={rel.media[0].url}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-3xl" aria-hidden>{note.category?.icon || '👐'}</span>
                  )}
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold text-gray-800 truncate">{rel.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
