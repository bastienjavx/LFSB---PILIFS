import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NoteType } from '@prisma/client'
import {
  SearchIcon,
  HandIcon,
  KeyboardIcon,
  CameraIcon,
  CategoryGlyph,
  BookIcon,
  VideoIcon,
  PencilIcon,
  QuestionIcon,
} from '@/components/icons'

export const revalidate = 60

const fallbackCategories = [
  { id: 'c1', name: 'Personnes', slug: 'personnes', icon: 'icon:people', color: '#2563eb', order: 1, _count: { notes: 0 } },
  { id: 'c2', name: 'Maison', slug: 'maison', icon: 'icon:home', color: '#16a34a', order: 2, _count: { notes: 0 } },
  { id: 'c3', name: 'Alimentation', slug: 'alimentation', icon: 'icon:food', color: '#ea580c', order: 3, _count: { notes: 0 } },
  { id: 'c4', name: 'Éducation', slug: 'education', icon: 'icon:book', color: '#0d9488', order: 4, _count: { notes: 0 } },
  { id: 'c5', name: 'Santé', slug: 'sante', icon: 'icon:health', color: '#dc2626', order: 5, _count: { notes: 0 } },
  { id: 'c6', name: 'Transports', slug: 'transports', icon: 'icon:bus', color: '#7c3aed', order: 6, _count: { notes: 0 } },
  { id: 'c7', name: 'Autres catégories', slug: 'autres', icon: 'icon:dots', color: '#1e3a8a', order: 7, _count: { notes: 0 } },
]

async function getHomeData() {
  try {
    const [categories, totalSigns] = await Promise.all([
      prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { _count: { select: { notes: { where: { published: true } } } } },
      }),
      prisma.note.count({ where: { published: true, type: NoteType.SIGN } }),
    ])
    return {
      categories: categories.length ? categories : fallbackCategories,
      totalSigns,
    }
  } catch {
    return { categories: fallbackCategories, totalSigns: 0 }
  }
}

const methods = [
  { Icon: HandIcon, title: 'Écrire un mot', sub: 'ou une expression' },
  { Icon: KeyboardIcon, title: 'Utiliser le clavier', sub: 'virtuel' },
  { Icon: CameraIcon, title: 'Rechercher par', sub: 'mouvement' },
]

const resources = [
  { Icon: BookIcon, title: 'Lire en facile', sub: 'Information en langage simplifié.', href: '/information', color: '#2563eb' },
  { Icon: VideoIcon, title: 'Vidéos explicatives', sub: 'Apprendre avec des vidéos claires.', href: '/signes', color: '#16a34a' },
  { Icon: PencilIcon, title: 'Exercices pratiques', sub: "S'entraîner et progresser à son rythme.", href: '/signes', color: '#ea580c' },
  { Icon: QuestionIcon, title: 'Foire aux questions', sub: 'Réponses aux questions fréquentes.', href: '/information', color: '#2563eb' },
]

export default async function HomePage() {
  const { categories, totalSigns } = await getHomeData()

  return (
    <div>
      {/* ---------- Hero + recherche ---------- */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--ink)] sm:text-5xl">
              La langue des signes à portée de toutes et tous.
            </h1>
            <p className="mt-5 text-lg font-semibold text-[var(--ink-soft)]">
              Apprendre, comprendre, communiquer.
              <br />
              Bienvenue sur PILIFS – LFSB.
            </p>
            {totalSigns > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-1.5 text-sm font-bold text-[var(--brand-800)]">
                <HandIcon width={16} height={16} />
                {totalSigns} signe{totalSigns !== 1 ? 's' : ''} dans la base
              </p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[var(--ink)]">
              Rechercher un signe
            </h2>

            <form method="GET" action="/signes" className="mt-4" role="search">
              <label htmlFor="home-search" className="sr-only">
                Rechercher un signe
              </label>
              <div className="flex overflow-hidden rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--surface)] shadow-soft focus-within:border-[var(--brand-700)]">
                <span className="flex items-center pl-4 text-[var(--muted)]" aria-hidden>
                  <SearchIcon width={24} height={24} />
                </span>
                <input
                  id="home-search"
                  type="search"
                  name="q"
                  placeholder="Rechercher un signe…"
                  className="h-16 w-full border-0 bg-transparent px-4 text-lg font-semibold text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
                  aria-label="Rechercher un signe"
                />
                <button
                  type="submit"
                  className="flex w-16 items-center justify-center bg-[var(--brand-700)] text-white transition hover:bg-[var(--brand-800)] sm:w-20"
                  aria-label="Lancer la recherche"
                >
                  <SearchIcon width={26} height={26} stroke="white" />
                </button>
              </div>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {methods.map(({ Icon, title, sub }) => (
                <Link key={title} href="/signes" className="method-card">
                  <Icon width={32} height={32} className="shrink-0 text-[var(--brand-700)]" />
                  <span className="text-sm font-bold leading-tight text-[var(--ink)]">
                    {title}
                    <br />
                    <span className="font-semibold text-[var(--muted)]">{sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Catégories ---------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="cat-title">
        <h2 id="cat-title" className="text-2xl font-extrabold text-[var(--ink)]">
          Explorer les signes par catégorie
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/signes?categorie=${cat.slug}`}
              className="tile"
              aria-label={`${cat.name}${cat._count.notes ? ` — ${cat._count.notes} signes` : ''}`}
            >
              <span style={{ color: cat.color }}>
                <CategoryGlyph icon={cat.icon} slug={cat.slug} size={46} />
              </span>
              <span className="text-[15px] font-extrabold leading-tight text-[var(--ink)]">
                {cat.name}
              </span>
              {cat._count.notes > 0 && (
                <span className="text-xs font-bold text-[var(--muted)]">
                  {cat._count.notes} signe{cat._count.notes !== 1 ? 's' : ''}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Ressources ---------- */}
      <section className="bg-[var(--surface-alt)] py-12" aria-labelledby="res-title">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <h2 id="res-title" className="text-2xl font-extrabold text-[var(--ink)]">
            Des ressources claires pour tous
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map(({ Icon, title, sub, href, color }) => (
              <Link key={title} href={href} className="resource-card">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}14`, color }}
                >
                  <Icon width={30} height={30} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold text-[var(--ink)]">{title}</span>
                  <span className="block text-sm font-semibold text-[var(--muted)]">{sub}</span>
                </span>
                <span className="text-[var(--muted)]" aria-hidden>›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
