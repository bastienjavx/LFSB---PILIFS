import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import NoteEditor from '@/components/NoteEditor'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await prisma.note.findUnique({ where: { id: params.id } })
  return { title: note ? `Éditer: ${note.title}` : 'Note introuvable' }
}

export default async function EditNotePage({ params }: Props) {
  const [note, categories] = await Promise.all([
    prisma.note.findUnique({
      where: { id: params.id },
      include: { media: { orderBy: { createdAt: 'asc' } } },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  if (!note) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Éditer: {note.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                note.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {note.published ? '✓ Publié' : '○ Brouillon'}
            </span>
            <span className="text-gray-400 text-sm">/{note.slug}</span>
          </div>
        </div>
        {note.published && (
          <Link
            href={`/signes/${note.slug}`}
            target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <span aria-hidden>↗</span> Voir sur le site
          </Link>
        )}
      </div>

      <NoteEditor
        categories={categories.map((c) => ({ ...c, icon: c.icon ?? null }))}
        initialNote={{
          ...note,
          media: note.media.map((m) => ({
            ...m,
            type: m.type as string,
            alt: m.alt ?? '',
          })),
          categoryId: note.categoryId ?? null,
        }}
      />
    </div>
  )
}
