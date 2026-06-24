import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tableau de bord | Admin' }

export default async function AdminDashboard() {
  const [noteCount, publishedCount, categoryCount, mediaCount, recentNotes] = await Promise.all([
    prisma.note.count(),
    prisma.note.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.media.count(),
    prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { category: true },
    }),
  ])

  const stats = [
    { label: 'Notes totales', value: noteCount, icon: '📝', href: '/admin/notes' },
    { label: 'Publiées', value: publishedCount, icon: '✅', href: '/admin/notes' },
    { label: 'Catégories', value: categoryCount, icon: '🗂️', href: '/admin/categories' },
    { label: 'Médias', value: mediaCount, icon: '🖼️', href: '/admin/media' },
  ]

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Gestion du vault Pilifs LFSB</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2" aria-hidden>{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/admin/notes/new" className="btn-primary flex items-center justify-center gap-2 py-3">
            <span aria-hidden>➕</span> Nouveau signe
          </Link>
          <Link href="/admin/notes/new?type=INFORMATION" className="btn-secondary flex items-center justify-center gap-2 py-3">
            <span aria-hidden>📖</span> Nouvelle info
          </Link>
          <Link href="/admin/media" className="btn-secondary flex items-center justify-center gap-2 py-3">
            <span aria-hidden>⬆️</span> Uploader un média
          </Link>
        </div>
      </div>

      {/* Notes récentes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes récentes</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {recentNotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>Aucune note pour le moment.</p>
              <Link href="/admin/notes/new" className="text-green-700 hover:underline mt-2 inline-block text-sm">
                Créer la première note →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{note.title}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {note.category ? `${note.category.icon} ${note.category.name}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{note.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          note.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {note.published ? '✓ Publié' : '○ Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/notes/${note.id}`}
                        className="text-green-700 hover:underline text-sm"
                      >
                        Éditer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {recentNotes.length > 0 && (
          <div className="mt-2 text-right">
            <Link href="/admin/notes" className="text-sm text-green-700 hover:underline">
              Voir toutes les notes →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
