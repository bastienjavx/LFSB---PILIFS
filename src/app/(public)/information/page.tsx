import { prisma } from '@/lib/prisma'
import { parseObsidianLinks } from '@/lib/utils'
import Link from 'next/link'
import { NoteType } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'
import { HomeIcon, InfoIcon } from '@/components/icons'

export const metadata: Metadata = { title: 'Informations' }
export const revalidate = 60

async function getInformationPages() {
  // La DB n'est pas joignable pendant le build (Railway/Docker) : on renvoie
  // une liste vide, l'ISR (`revalidate`) remplira la page au premier accès.
  try {
    return await prisma.note.findMany({
      where: { published: true, type: NoteType.INFORMATION },
      orderBy: { updatedAt: 'desc' },
      include: {
        media: { where: { type: 'IMAGE' }, take: 1 },
      },
    })
  } catch {
    return []
  }
}

export default async function InformationPage() {
  const pages = await getInformationPages()

  const main = pages.find((p) => p.slug === 'bienvenue-a-nos-pilifs') || pages[0]
  const others = pages.filter((p) => p.id !== main?.id)

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <nav className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]" aria-label="Fil d'Ariane">
        <Link href="/" className="inline-flex items-center hover:text-[var(--brand-700)]" aria-label="Accueil">
          <HomeIcon width={18} height={18} />
        </Link>
        <span aria-hidden>/</span>
        <span className="font-bold text-[var(--ink)]" aria-current="page">Information</span>
      </nav>

      <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
        <InfoIcon width={32} height={32} className="text-[var(--brand-700)]" /> Information
      </h1>

      {main ? (
        <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-soft">
          {main.media[0] && (
            <img
              src={main.media[0].url}
              alt={main.media[0].alt || main.title}
              className="h-48 w-full object-cover"
            />
          )}
          <div className="p-6 sm:p-8">
            <h2 className="mb-4 text-2xl font-extrabold text-[var(--ink)]">{main.title}</h2>
            <div className="prose prose-blue max-w-none text-[var(--ink-soft)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parseObsidianLinks(main.content)}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-soft">
          <InfoIcon width={48} height={48} className="mx-auto text-[var(--muted)]" />
          <p className="mt-4 font-semibold text-[var(--muted)]">Pas encore de contenu d'information.</p>
        </div>
      )}

      {others.length > 0 && (
        <section aria-labelledby="other-pages">
          <h2 id="other-pages" className="mb-4 text-xl font-extrabold text-[var(--ink)]">
            Autres informations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((page) => (
              <Link
                key={page.id}
                href={`/signes/${page.slug}`}
                className="resource-card"
              >
                {page.media[0] ? (
                  <img
                    src={page.media[0].url}
                    alt={page.title}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-700)]">
                    <InfoIcon width={28} height={28} />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[var(--ink)]">{page.title}</h3>
                  {page.excerpt && <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--muted)]">{page.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
