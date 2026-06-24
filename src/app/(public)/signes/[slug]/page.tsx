import { prisma } from '@/lib/prisma'
import { parseObsidianLinks } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NoteType } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'
import { CategoryGlyph, HomeIcon } from '@/components/icons'
import { findBacklinks } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await prisma.note.findUnique({ where: { slug: params.slug } })
  if (!note) return { title: 'Signe introuvable' }
  return { title: note.title, description: note.excerpt || undefined }
}

export async function generateStaticParams() {
  return []
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

  // Backlinks (Obsidian) : notes qui mentionnent celle-ci via [[...]].
  const candidates = await prisma.note.findMany({
    where: { published: true, id: { not: note.id }, content: { contains: '[[' } },
    select: { id: true, title: true, slug: true, content: true, category: { select: { color: true, icon: true, slug: true } } },
  })
  const backlinks = findBacklinks(note, candidates)

  const parsedContent = parseObsidianLinks(note.content)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]" aria-label="Fil d'Ariane">
        <Link href="/" className="inline-flex items-center hover:text-[var(--brand-700)]" aria-label="Accueil">
          <HomeIcon width={18} height={18} />
        </Link>
        <span aria-hidden>/</span>
        <Link href="/signes" className="hover:text-[var(--brand-700)]">Signes</Link>
        {note.category && (
          <>
            <span aria-hidden>/</span>
            <Link
              href={`/signes?categorie=${note.category.slug}`}
              className="hover:text-[var(--brand-700)]"
            >
              {note.category.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="font-bold text-[var(--ink)]" aria-current="page">{note.title}</span>
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
                aria-label={`Vidéo du signe Main Verte: ${note.title}`}
                poster={images[0]?.url}
              >
                <track kind="captions" label="Sous-titres français" srcLang="fr" />
                Votre navigateur ne supporte pas la vidéo HTML5.
              </video>
            </div>
          ) : images[0] ? (
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <img
                src={images[0].url}
                alt={images[0].alt || `Signe Main Verte: ${note.title}`}
                className="w-full bg-[var(--brand-soft)] object-contain"
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--brand-soft)]" style={{ color: note.category?.color || 'var(--brand-700)' }}>
              <CategoryGlyph icon={note.category?.icon} slug={note.category?.slug} size={96} />
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
            <Link
              href={`/signes?categorie=${note.category.slug}`}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: note.category.color + '1a', color: note.category.color }}
            >
              <CategoryGlyph icon={note.category.icon} slug={note.category.slug} size={18} />
              {note.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">{note.title}</h1>

          {note.excerpt && (
            <p className="text-lg font-semibold text-[var(--ink-soft)]">{note.excerpt}</p>
          )}

          {note.content && (
            <div className="prose prose-green max-w-none text-[var(--ink-soft)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedContent}
              </ReactMarkdown>
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-4">
            <Link href="/signes" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-700)] hover:underline">
              <span aria-hidden>←</span> Retour aux signes
            </Link>
          </div>
        </div>
      </div>

      {/* Signes liés */}
      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-4 text-xl font-extrabold text-[var(--ink)]">
            Signes de la même catégorie
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/signes/${rel.slug}`}
                className="sign-card group"
                aria-label={`Voir le signe : ${rel.title}`}
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-[var(--brand-soft)]">
                  {rel.media[0] ? (
                    <img
                      src={rel.media[0].url}
                      alt={rel.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span style={{ color: note.category?.color || 'var(--brand-700)' }}>
                      <CategoryGlyph icon={note.category?.icon} slug={note.category?.slug} size={32} />
                    </span>
                  )}
                </div>
                <div className="p-2 text-center">
                  <p className="truncate text-xs font-bold text-[var(--ink)]">{rel.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Backlinks (façon Obsidian) */}
      {backlinks.length > 0 && (
        <section className="mt-12" aria-labelledby="backlinks-title">
          <h2 id="backlinks-title" className="mb-1 text-xl font-extrabold text-[var(--ink)]">
            Mentionné dans
          </h2>
          <p className="mb-4 text-sm font-semibold text-[var(--muted)]">
            {backlinks.length} page{backlinks.length !== 1 ? 's' : ''} qui renvoie{backlinks.length !== 1 ? 'nt' : ''} vers « {note.title} ».
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {backlinks.map((bl) => (
              <Link
                key={bl.id}
                href={`/signes/${bl.slug}`}
                className="resource-card"
                aria-label={`Voir : ${bl.title}`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: (bl.category?.color || '#1d4ed8') + '1a', color: bl.category?.color || 'var(--brand-700)' }}
                >
                  <CategoryGlyph icon={bl.category?.icon} slug={bl.category?.slug} size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-extrabold text-[var(--ink)]">{bl.title}</span>
                  <span className="block text-xs font-semibold text-[var(--brand-700)]">↩ lien vers cette page</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
