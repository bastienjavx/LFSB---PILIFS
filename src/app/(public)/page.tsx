import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType } from '@prisma/client'

export const revalidate = 60

async function getHomeData() {
  const [categories, recentSigns] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { notes: { where: { published: true } } } },
      },
    }),
    prisma.note.findMany({
      where: { published: true, type: NoteType.SIGN },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: {
        category: true,
        media: { where: { type: { in: ['IMAGE', 'GIF'] } }, take: 1 },
      },
    }),
  ])
  return { categories, recentSigns }
}

export default async function HomePage() {
  const { categories, recentSigns } = await getHomeData()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-6">
        <div className="text-6xl mb-4" role="img" aria-label="Ferme">🌾</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-3">
          Ferme Nos Pilifs
        </h1>
        <p className="text-lg text-green-700 max-w-xl mx-auto">
          Découvre les signes LFSB de la ferme
        </p>
      </section>

      {/* Catégories */}
      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>🗂️</span> Catégories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/signes?categorie=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border-2 transition-all hover:scale-105 cursor-pointer"
              style={{ borderColor: cat.color }}
              aria-label={`${cat.name} - ${cat._count.notes} signe${cat._count.notes !== 1 ? 's' : ''}`}
            >
              <span className="text-4xl" role="img" aria-hidden>{cat.icon || '📁'}</span>
              <span className="font-semibold text-gray-800 text-sm text-center">{cat.name}</span>
              <span className="text-xs text-gray-500">{cat._count.notes}</span>
            </Link>
          ))}
          <Link
            href="/signes"
            className="flex flex-col items-center gap-2 p-4 bg-green-700 rounded-2xl shadow-sm hover:shadow-md hover:bg-green-800 transition-all hover:scale-105 text-white cursor-pointer"
            aria-label="Voir tous les signes"
          >
            <span className="text-4xl" role="img" aria-hidden>👐</span>
            <span className="font-semibold text-sm text-center">Tous les signes</span>
          </Link>
        </div>
      </section>

      {/* Signes récents */}
      {recentSigns.length > 0 && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>✨</span> Signes récents
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentSigns.map((note) => {
              const thumb = note.media[0]
              return (
                <Link
                  key={note.id}
                  href={`/signes/${note.slug}`}
                  className="sign-card group"
                  aria-label={`Voir le signe: ${note.title}`}
                >
                  <div className="aspect-square bg-green-100 flex items-center justify-center overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb.url}
                        alt={thumb.alt || note.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-5xl" role="img" aria-hidden>
                        {note.category?.icon || '👐'}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-center truncate">{note.title}</h3>
                    {note.category && (
                      <div
                        className="text-xs text-center mt-1 px-2 py-0.5 rounded-full inline-block mx-auto"
                        style={{ backgroundColor: note.category.color + '20', color: note.category.color }}
                      >
                        {note.category.icon} {note.category.name}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-6">
            <Link href="/signes" className="btn-primary inline-flex items-center gap-2">
              <span>👐</span> Voir tous les signes
            </Link>
          </div>
        </section>
      )}

      {/* Info section */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0" role="img" aria-label="Information">📖</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">À propos</h2>
            <p className="text-gray-600">
              Ce site présente les signes de la{' '}
              <strong>Langue Française des Signes de Belgique (LFSB)</strong>{' '}
              utilisés à la Ferme Nos Pilifs.
            </p>
            <Link href="/information" className="text-green-700 font-semibold hover:underline mt-2 inline-flex items-center gap-1">
              En savoir plus <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
