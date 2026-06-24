import { prisma } from '@/lib/prisma'
import { parseObsidianLinks } from '@/lib/utils'
import Link from 'next/link'
import { NoteType } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Metadata } from 'next'

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-green-700">🏠</Link>
        <span aria-hidden>/</span>
        <span className="text-gray-800 font-medium" aria-current="page">Informations</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <span aria-hidden>📖</span> Informations
      </h1>

      {main ? (
        <article className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
          {main.media[0] && (
            <img
              src={main.media[0].url}
              alt={main.media[0].alt || main.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{main.title}</h2>
            <div className="prose prose-green max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parseObsidianLinks(main.content)}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <span className="text-5xl mb-4 block" aria-hidden>🏡</span>
          <p className="text-gray-500">Pas encore de contenu d'information.</p>
        </div>
      )}

      {others.length > 0 && (
        <section aria-labelledby="other-pages">
          <h2 id="other-pages" className="text-xl font-bold text-gray-800 mb-4">
            Autres informations
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {others.map((page) => (
              <Link
                key={page.id}
                href={`/signes/${page.slug}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-start"
              >
                {page.media[0] ? (
                  <img
                    src={page.media[0].url}
                    alt={page.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <span className="text-3xl shrink-0" aria-hidden>📄</span>
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{page.title}</h3>
                  {page.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{page.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
