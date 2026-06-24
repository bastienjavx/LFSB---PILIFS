import { prisma } from '@/lib/prisma'
import { parseObsidianLinks } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PUBLIC_CONTENT_TYPES } from '@/lib/content-types'
import { HomeIcon } from '@/components/icons'

type ContentKey = keyof typeof PUBLIC_CONTENT_TYPES

export default async function PublicContentDetail({ contentKey, slug }: { contentKey: ContentKey; slug: string }) {
  const config = PUBLIC_CONTENT_TYPES[contentKey]
  const note = await prisma.note.findFirst({
    where: { slug, published: true, type: config.type },
    include: { media: { orderBy: { createdAt: 'asc' } } },
  })

  if (!note) notFound()

  const hero = note.media.find((m) => m.type === 'VIDEO') || note.media.find((m) => m.type === 'IMAGE' || m.type === 'GIF')

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]" aria-label="Fil d'Ariane">
        <Link href="/" className="inline-flex items-center hover:text-[var(--brand-700)]" aria-label="Accueil">
          <HomeIcon width={18} height={18} />
        </Link>
        <span aria-hidden>/</span>
        <Link href={config.href} className="hover:text-[var(--brand-700)]">{config.title}</Link>
        <span aria-hidden>/</span>
        <span className="font-bold text-[var(--ink)]" aria-current="page">{note.title}</span>
      </nav>

      <header className="space-y-4">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--brand-700)]">{config.singular}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">{note.title}</h1>
        {note.excerpt && <p className="text-lg font-semibold leading-8 text-[var(--ink-soft)]">{note.excerpt}</p>}
      </header>

      {hero && (
        <div className="my-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-soft">
          {hero.type === 'VIDEO' ? (
            <video src={hero.url} controls playsInline className="aspect-video w-full bg-black object-contain" />
          ) : (
            <img src={hero.url} alt={hero.alt || note.title} className="max-h-[540px] w-full object-cover" />
          )}
        </div>
      )}

      {note.content && (
        <div className="prose prose-green max-w-none text-[var(--ink-soft)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{parseObsidianLinks(note.content)}</ReactMarkdown>
        </div>
      )}

      <div className="mt-10 border-t border-[var(--border)] pt-5">
        <Link href={config.href} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-700)] hover:underline">
          <span aria-hidden>←</span> Retour
        </Link>
      </div>
    </article>
  )
}
