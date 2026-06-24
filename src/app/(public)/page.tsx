import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType } from '@prisma/client'

export const revalidate = 60

const fallbackCategories = [
  { id: 'demo-animaux', name: 'Animaux', slug: 'animaux', icon: '🐄', color: '#0f766e', order: 1, createdAt: new Date(), updatedAt: new Date(), _count: { notes: 12 } },
  { id: 'demo-potager', name: 'Potager', slug: 'potager', icon: '🥕', color: '#ca8a04', order: 2, createdAt: new Date(), updatedAt: new Date(), _count: { notes: 9 } },
  { id: 'demo-actions', name: 'Actions', slug: 'actions', icon: '🤲', color: '#2563eb', order: 3, createdAt: new Date(), updatedAt: new Date(), _count: { notes: 15 } },
  { id: 'demo-lieux', name: 'Lieux', slug: 'lieux', icon: '🏡', color: '#be123c', order: 4, createdAt: new Date(), updatedAt: new Date(), _count: { notes: 7 } },
]

async function getHomeData() {
  // Garde une page lisible pendant le build ou en local sans DATABASE_URL.
  try {
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
  } catch {
    return { categories: fallbackCategories, recentSigns: [] }
  }
}

export default async function HomePage() {
  const { categories, recentSigns } = await getHomeData()
  const totalSigns = categories.reduce((sum, cat) => sum + cat._count.notes, 0)

  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="mx-auto grid min-h-[calc(100vh-148px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black leading-[1.05] text-emerald-950 sm:text-5xl lg:text-6xl">
              Trouver un signe LFSB devient simple, visuel et accueillant.
            </h1>
            <p className="mt-6 text-xl font-semibold leading-8 text-slate-700">
              Cherche les signes de la Ferme Nos Pilifs avec des mots simples,
              des images grandes, des vidéos lisibles et des repères faciles.
            </p>

            <form method="GET" action="/signes" className="mt-8 max-w-2xl" role="search">
              <label htmlFor="home-search" className="mb-3 block text-lg font-black text-emerald-950">
                Rechercher un signe
              </label>
              <div className="flex flex-col gap-3 rounded-lg border-2 border-emerald-950/10 bg-white p-2 shadow-lg sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl" aria-hidden>
                    🔎
                  </span>
                  <input
                    id="home-search"
                    type="search"
                    name="q"
                    placeholder="Tomate, poule, bonjour..."
                    className="h-14 w-full rounded-md border-0 bg-transparent pl-14 pr-4 text-lg font-bold text-emerald-950 placeholder:text-slate-500 focus:outline-none"
                    aria-label="Rechercher un signe"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Explorer les signes
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signes" className="btn-secondary">
                <span aria-hidden>👐</span>
                Tous les signes
              </Link>
              <Link href="/information" className="btn-secondary">
                <span aria-hidden>📖</span>
                Lire en facile
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-emerald-950/10 bg-white p-5 shadow-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-lg bg-teal-800 p-5 text-white">
                  <div className="text-sm font-black uppercase tracking-normal text-teal-100">Aujourd'hui</div>
                  <div className="mt-2 text-4xl font-black">{totalSigns}</div>
                  <p className="mt-1 font-semibold text-teal-50">signes publiés et classés</p>
                </div>
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/signes?categorie=${cat.slug}`}
                    className="rounded-lg border-2 border-emerald-950/10 bg-[var(--page-bg)] p-4 transition hover:border-teal-700 hover:bg-white"
                    style={{ borderTopColor: cat.color, borderTopWidth: 6 }}
                    aria-label={`${cat.name} - ${cat._count.notes} signe${cat._count.notes !== 1 ? 's' : ''}`}
                  >
                    <span className="text-4xl" role="img" aria-hidden>{cat.icon || '📁'}</span>
                    <span className="mt-3 block text-lg font-black text-emerald-950">{cat.name}</span>
                    <span className="text-sm font-bold text-slate-600">{cat._count.notes} signes</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-950/10 bg-white py-14" aria-labelledby="categories-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="categories-title" className="text-3xl font-black text-emerald-950">
                Catégories visuelles
              </h2>
              <p className="mt-2 text-lg font-semibold text-slate-600">
                Des groupes courts, avec icône et couleur, pour retrouver un signe sans effort.
              </p>
            </div>
            <Link href="/signes" className="btn-secondary">
              Voir tout
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/signes?categorie=${cat.slug}`}
                className="group rounded-lg border-2 border-emerald-950/10 bg-[var(--page-bg)] p-5 transition hover:-translate-y-1 hover:border-teal-700 hover:bg-white hover:shadow-lg"
                style={{ borderTopColor: cat.color, borderTopWidth: 6 }}
                aria-label={`${cat.name} - ${cat._count.notes} signe${cat._count.notes !== 1 ? 's' : ''}`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-4xl shadow-sm ring-1 ring-emerald-950/10" role="img" aria-hidden>
                  {cat.icon || '📁'}
                </span>
                <span className="mt-5 block text-xl font-black text-emerald-950">{cat.name}</span>
                <span className="mt-1 block text-base font-bold text-slate-600">
                  {cat._count.notes} signe{cat._count.notes !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recentSigns.length > 0 && (
        <section className="py-14" aria-labelledby="recent-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="recent-title" className="text-3xl font-black text-emerald-950">
              Signes récents
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentSigns.map((note) => {
                const thumb = note.media[0]
                return (
                  <Link
                    key={note.id}
                    href={`/signes/${note.slug}`}
                    className="sign-card group bg-white"
                    aria-label={`Voir le signe: ${note.title}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-teal-50 flex items-center justify-center">
                      {thumb ? (
                        <img
                          src={thumb.url}
                          alt={thumb.alt || note.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-6xl" role="img" aria-hidden>
                          {note.category?.icon || '👐'}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-black leading-tight text-emerald-950">{note.title}</h3>
                      {note.category && (
                        <p className="mt-2 text-sm font-bold text-slate-600">
                          {note.category.icon} {note.category.name}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
            <div className="mt-8">
              <Link href="/signes" className="btn-primary">
                <span aria-hidden>👐</span> Explorer les signes
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-teal-900 py-14 text-white" aria-labelledby="access-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 id="access-title" className="text-3xl font-black">
              Conçu pour comprendre vite.
            </h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-teal-50">
              Les pages privilégient les mots courts, les grands visuels, les vidéos,
              les contrastes forts et les actions visibles au clavier.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Sous-titres', 'Les contenus vidéo restent utiles sans son.'],
              ['Mots simples', 'Les informations importantes sont directes.'],
              ['Grands boutons', 'Les actions sont faciles à toucher et à viser.'],
              ['Repères visuels', 'Icônes, couleurs et titres guident la lecture.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-white/15 bg-white/10 p-5">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-2 font-semibold leading-7 text-teal-50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-6xl" role="img" aria-label="Information">📖</span>
              <h2 className="mt-4 text-3xl font-black text-emerald-950">À propos</h2>
            </div>
            <div>
              <p className="text-xl font-semibold leading-9 text-slate-700">
                Ce site présente les signes de la{' '}
                <strong className="text-emerald-950">Langue Française des Signes de Belgique</strong>{' '}
                utilisés à la Ferme Nos Pilifs. Il aide chaque personne à chercher,
                regarder et mémoriser les signes avec moins de fatigue.
              </p>
              <Link href="/information" className="btn-secondary mt-6">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
