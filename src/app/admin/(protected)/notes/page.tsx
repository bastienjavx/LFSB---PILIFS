import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'
import { NoteType } from '@prisma/client'
import { NOTE_TYPE_ICONS, NOTE_TYPE_LABELS, publicHrefForType } from '@/lib/content-types'

export const metadata: Metadata = { title: 'Notes | Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { type?: string; q?: string; categorie?: string }
}

export default async function AdminNotesPage({ searchParams }: Props) {
  const { type, q, categorie } = searchParams

  const [notes, categories] = await Promise.all([
    prisma.note.findMany({
      where: {
        ...(type ? { type: type as NoteType } : {}),
        ...(categorie ? { category: { slug: categorie } } : {}),
        ...(q
          ? { OR: [{ title: { contains: q, mode: 'insensitive' } }] }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: { category: true, media: { take: 1 } },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notes & contenus</h1>
        <Link href={`/admin/notes/new${type ? `?type=${type}` : ''}`} className="btn-primary flex items-center gap-2">
          <span aria-hidden>➕</span> Nouveau
        </Link>
      </div>

      {/* Filtres */}
      <form method="GET" className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="🔍 Rechercher..."
          className="input-field max-w-xs"
        />
        <select name="type" defaultValue={type || ''} className="input-field max-w-xs">
          <option value="">Tous les types</option>
          {Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {NOTE_TYPE_ICONS[value as keyof typeof NOTE_TYPE_ICONS]} {label}
            </option>
          ))}
        </select>
        <select name="categorie" defaultValue={categorie || ''} className="input-field max-w-xs">
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Filtrer</button>
        {(type || q || categorie) && (
          <Link href="/admin/notes" className="btn-secondary">✕ Effacer</Link>
        )}
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </div>

        {notes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3" aria-hidden>📝</div>
            <p className="text-gray-400">Aucune note trouvée</p>
            <Link href={`/admin/notes/new${type ? `?type=${type}` : ''}`} className="btn-primary inline-flex items-center gap-2 mt-4">
              <span aria-hidden>➕</span> Créer une note
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-8"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Modifié</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    {note.media[0] ? (
                      <img
                        src={note.media[0].url}
                        alt=""
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <span className="text-lg" aria-hidden>
                        {note.category?.icon || NOTE_TYPE_ICONS[note.type]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
                    <span className="truncate block">{note.title}</span>
                    <span className="text-xs text-gray-400 font-normal">/{note.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {note.category ? `${note.category.icon} ${note.category.name}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {NOTE_TYPE_ICONS[note.type]} {NOTE_TYPE_LABELS[note.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        note.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {note.published ? '✓ Publié' : '○ Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(note.updatedAt).toLocaleDateString('fr-BE')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/notes/${note.id}`}
                        className="text-green-700 hover:underline text-sm font-medium"
                      >
                        Éditer
                      </Link>
                      <Link
                        href={publicHrefForType(note.type, note.slug)}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600 text-sm"
                        aria-label={`Voir ${note.title} sur le site`}
                      >
                        ↗
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
