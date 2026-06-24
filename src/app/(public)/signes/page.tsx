import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType } from '@prisma/client'
import type { Metadata } from 'next'
import { SearchIcon, HandIcon, CategoryGlyph } from '@/components/icons'
import { smartSearch } from '@/lib/search'

export const metadata: Metadata = { title: 'Tous les signes' }
export const revalidate = 60

interface Props {
  searchParams: { categorie?: string; q?: string }
}

async function getData(categorie?: string, q?: string) {
  try {
    const [categories, allNotes] = await Promise.all([
      prisma.category.findMany({ orderBy: { order: 'asc' } }),
      prisma.note.findMany({
        where: {
          published: true,
          type: NoteType.SIGN,
          ...(categorie ? { category: { slug: categorie } } : {}),
        },
        orderBy: { title: 'asc' },
        include: {
          category: true,
          media: { where: { type: { in: ['IMAGE', 'GIF', 'VIDEO'] } }, take: 1 },
        },
      }),
    ])

    // Recherche intelligente (pertinence) côté serveur quand une requête existe.
    const notes = q && q.trim() ? smartSearch(q, allNotes).map((h) => h.item) : allNotes
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
          <div className="flex overflow-hidden rounded-xl border-2 border-[var(--border-strong)] bg-[var(--surface)] focus-within:border-[var(--brand-700)]">
            <span className="flex items-center pl-3 text-[var(--muted)]" aria-hidden>
              <SearchIcon width={20} height={20} />
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q || ''}
              placeholder="Chercher un signe…"
              className="h-12 w-full border-0 bg-transparent px-3 text-base font-semibold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
              aria-label="Chercher un signe"
            />
            <button type="submit" className="bg-[var(--brand-700)] px-4 text-white hover:bg-[var(--brand-800)]" aria-label="Rechercher">
              <SearchIcon width={20} height={20} stroke="white" />
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
