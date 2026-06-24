import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType, Prisma } from '@prisma/client'
import type { Metadata } from 'next'
import { SearchIcon, HandIcon, CategoryGlyph } from '@/components/icons'
import { smartSearch } from '@/lib/search'
import { searchSignIds } from '@/lib/search-db'

export const metadata: Metadata = { title: 'Tous les signes' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { categorie?: string; q?: string }
}

const SIGN_INCLUDE = {
  category: true,
  media: { where: { type: { in: ['IMAGE', 'GIF', 'VIDEO'] } }, take: 1 },
} satisfies Prisma.NoteInclude

async function getData(categorie?: string, q?: string) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    const query = q?.trim()

    const baseWhere = {
      published: true,
      type: NoteType.SIGN,
      ...(categorie ? { category: { slug: categorie } } : {}),
    }

    if (query) {
      // 1) Recherche plein-texte PostgreSQL : rapide, indexée (GIN), insensible
      //    aux accents, avec stemming et pondération du ranking.
      let ids: string[] = []
      try {
        ids = await searchSignIds(query, categorie)
      } catch {
        ids = [] // ex: migration pas encore appliquée → on bascule sur le repli.
      }

      if (ids.length > 0) {
        const found = await prisma.note.findMany({
          where: { id: { in: ids } },
          include: SIGN_INCLUDE,
        })
        const rank = new Map(ids.map((id, i) => [id, i]))
        found.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
        return { categories, notes: found }
      }

      // 2) Repli tolérant aux fautes de frappe et aux synonymes quand le
      //    plein-texte ne renvoie rien (utile pour notre public).
      const allNotes = await prisma.note.findMany({
        where: baseWhere,
        orderBy: { title: 'asc' },
        include: SIGN_INCLUDE,
      })
      return { categories, notes: smartSearch(query, allNotes).map((h) => h.item) }
    }

    // Pas de recherche : liste complète (éventuellement filtrée par catégorie).
    const notes = await prisma.note.findMany({
      where: baseWhere,
      orderBy: { title: 'asc' },
      include: SIGN_INCLUDE,
    })
    return { categories, notes }
  } catch {
    return { categories: [], notes: [] }
  }
}

export default async function SignesPage({ searchParams }: Props) {
  const { categorie, q } = searchParams
  const { categories, notes } = await getData(categorie, q)
  const activeCat = categories.find((c) => c.slug === categorie)

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            {activeCat ? (
              <span style={{ color: activeCat.color }}>
                <CategoryGlyph icon={activeCat.icon} slug={activeCat.slug} size={34} />
              </span>
            ) : (
              <HandIcon width={34} height={34} className="text-[var(--brand-700)]" />
            )}
            {activeCat ? activeCat.name : 'Tous les signes'}
          </h1>
          <p className="mt-1 text-base font-semibold text-[var(--muted)]">
            {notes.length} signe{notes.length !== 1 ? 's' : ''}
            {q ? ` pour « ${q} »` : ''}
          </p>
        </div>

        <form method="GET" className="w-full max-w-md" role="search">
          {categorie && <input type="hidden" name="categorie" value={categorie} />}
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] py-1.5 pl-4 pr-1.5 shadow-soft transition focus-within:border-[var(--brand-700)] focus-within:ring-2 focus-within:ring-[var(--brand-200)]">
            <SearchIcon width={20} height={20} className="shrink-0 text-[var(--muted)]" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q || ''}
              placeholder="Chercher un signe…"
              className="h-9 w-full border-0 bg-transparent text-base font-semibold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              aria-label="Chercher un signe"
            />
            <button
              type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-700)] text-white transition hover:bg-[var(--brand-800)]"
              aria-label="Lancer la recherche"
            >
              <SearchIcon width={18} height={18} stroke="white" />
            </button>
          </div>
        </form>
      </div>

      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Filtrer par catégorie">
        <Link
          href="/signes"
          role="listitem"
          className="rounded-full px-4 py-2 text-sm font-bold transition"
          style={{
            background: !categorie ? 'var(--brand-700)' : 'var(--surface)',
            color: !categorie ? '#fff' : 'var(--ink-soft)',
            border: '1px solid var(--border-strong)',
          }}
        >
          Tout
        </Link>
        {categories.map((cat) => {
          const active = categorie === cat.slug
          return (
            <Link
              key={cat.id}
              href={`/signes?categorie=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              role="listitem"
              aria-current={active ? 'page' : undefined}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition"
              style={{
                background: active ? cat.color : 'var(--surface)',
                color: active ? '#fff' : 'var(--ink-soft)',
                border: `1px solid ${active ? cat.color : 'var(--border-strong)'}`,
              }}
            >
              <CategoryGlyph icon={cat.icon} slug={cat.slug} size={18} />
              {cat.name}
            </Link>
          )
        })}
      </div>

      {/* Grille */}
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-20 text-center">
          <SearchIcon width={48} height={48} className="mx-auto text-[var(--muted)]" />
          <p className="mt-4 text-lg font-bold text-[var(--ink)]">Aucun signe trouvé</p>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
            Essaie un autre mot ou explore les catégories.
          </p>
          <Link href="/signes" className="btn-secondary mt-5">
            Voir tous les signes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {notes.map((note) => {
            const media = note.media[0]
            const isVideo = media?.type === 'VIDEO'
            return (
              <Link
                key={note.id}
                href={`/signes/${note.slug}`}
                className="sign-card group"
                aria-label={`Signe : ${note.title}`}
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[var(--brand-soft)]">
                  {media ? (
                    isVideo ? (
                      <>
                        <video
                          src={media.url}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          muted
                          playsInline
                          preload="metadata"
                          aria-label={`Vidéo du signe ${note.title}`}
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--brand-700)] shadow" aria-hidden>▶</span>
                        </span>
                      </>
                    ) : (
                      <img
                        src={media.url}
                        alt={media.alt || note.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )
                  ) : (
                    <span style={{ color: note.category?.color || 'var(--brand-700)' }}>
                      <CategoryGlyph icon={note.category?.icon} slug={note.category?.slug} size={48} />
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="text-center text-[15px] font-extrabold leading-tight text-[var(--ink)]">
                    {note.title}
                  </h2>
                  {note.category && (
                    <p className="mt-1.5 text-center text-xs font-bold" style={{ color: note.category.color }}>
                      {note.category.name}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
