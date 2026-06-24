import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { PUBLIC_CONTENT_TYPES, publicHrefForType } from '@/lib/content-types'

const CARD_INCLUDE = {
  media: { where: { type: { in: ['IMAGE', 'GIF', 'VIDEO'] } }, take: 1 },
} satisfies Prisma.NoteInclude

type ContentKey = keyof typeof PUBLIC_CONTENT_TYPES

export default async function PublicContentList({ contentKey }: { contentKey: ContentKey }) {
  const config = PUBLIC_CONTENT_TYPES[contentKey]
  const notes = await prisma.note.findMany({
    where: { published: true, type: config.type },
    orderBy: { updatedAt: 'desc' },
    include: CARD_INCLUDE,
  })

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">{config.title}</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold text-[var(--muted)]">
          Ressources publiées par l’équipe pour accompagner l’apprentissage, la pratique et la vie du projet Main Verte.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-lg font-bold text-[var(--ink)]">{config.empty}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => {
            const media = note.media[0]
            return (
              <Link key={note.id} href={publicHrefForType(note.type, note.slug)} className="sign-card group">
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-soft)]">
                  {media?.type === 'VIDEO' ? (
                    <>
                      <video src={media.url} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--brand-700)] shadow" aria-hidden>▶</span>
                      </span>
                    </>
                  ) : media ? (
                    <img src={media.url} alt={media.alt || note.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl" aria-hidden>🌿</div>
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--brand-700)]">{config.singular}</p>
                  <h2 className="text-xl font-extrabold leading-tight text-[var(--ink)]">{note.title}</h2>
                  {note.excerpt && <p className="line-clamp-3 text-sm font-semibold leading-6 text-[var(--muted)]">{note.excerpt}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
