import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType } from '@prisma/client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tous les signes' }
export const revalidate = 60

interface Props {
  searchParams: { categorie?: string; q?: string }
}

export default async function SignesPage({ searchParams }: Props) {
  const { categorie, q } = searchParams

  const [categories, notes] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.note.findMany({
      where: {
        published: true,
        type: NoteType.SIGN,
        ...(categorie ? { category: { slug: categorie } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { excerpt: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { title: 'asc' },
      include: {
        category: true,
        media: { where: { type: { in: ['IMAGE', 'GIF', 'VIDEO'] } }, take: 1 },
      },
    }),
  ])

  const activeCat = categories.find((c) => c.slug === categorie)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>👐</span>
          {activeCat ? `${activeCat.icon || ''} ${activeCat.name}` : 'Tous les signes'}
        </h1>

        {/* Recherche */}
        <form method="GET" className="flex-1 max-w-sm" role="search">
          {categorie && <input type="hidden" name="categorie" value={categorie} />}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>🔍</span>
            <input
              type="search"
              name="q"
              defaultValue={q || ''}
              placeholder="Chercher un signe..."
              className="input-field pl-10"
              aria-label="Chercher un signe"
            />
          </div>
        </form>
      </div>

      {/* Filtre catégories */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Filtrer par catégorie">
        <Link
          href="/signes"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categorie
              ? 'bg-green-700 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          role="listitem"
        >
          Tout
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/signes?categorie=${cat.slug}${q ? `&q=${q}` : ''}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorie === cat.slug
                ? 'text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            style={categorie === cat.slug ? { backgroundColor: cat.color } : {}}
            role="listitem"
            aria-current={categorie === cat.slug ? 'page' : undefined}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {/* Grille de signes */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4" role="img" aria-label="Rien trouvé">🔍</div>
          <p className="text-gray-500 text-lg">Aucun signe trouvé</p>
          <Link href="/signes" className="text-green-700 hover:underline mt-2 inline-block">
            Voir tous les signes
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm">{notes.length} signe{notes.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {notes.map((note) => {
              const media = note.media[0]
              const isVideo = media?.type === 'VIDEO'
              return (
                <Link
                  key={note.id}
                  href={`/signes/${note.slug}`}
                  className="sign-card group"
                  aria-label={`Signe: ${note.title}`}
                >
                  <div className="aspect-square bg-green-50 flex items-center justify-center overflow-hidden relative">
                    {media ? (
                      <>
                        {isVideo ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            muted
                            playsInline
                            preload="metadata"
                            aria-label={`Vidéo du signe ${note.title}`}
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={media.alt || note.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                              <span className="text-green-700 text-lg" aria-hidden>▶</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-5xl" role="img" aria-hidden>
                        {note.category?.icon || '👐'}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-bold text-gray-800 text-center text-sm leading-tight">{note.title}</h2>
                    {note.category && (
                      <div
                        className="text-xs text-center mt-1.5 px-2 py-0.5 rounded-full mx-auto w-fit"
                        style={{ backgroundColor: note.category.color + '20', color: note.category.color }}
                      >
                        {note.category.icon}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
