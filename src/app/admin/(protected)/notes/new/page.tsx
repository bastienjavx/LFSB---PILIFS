import { prisma } from '@/lib/prisma'
import NoteEditor from '@/components/NoteEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nouvelle note | Admin' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: { type?: string }
}

export default async function NewNotePage({ searchParams }: Props) {
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle note</h1>
        <p className="text-gray-500 mt-1">Créer un nouveau signe ou une page d'information</p>
      </div>
      <NoteEditor
        categories={categories.map((c) => ({ ...c, icon: c.icon ?? null }))}
        initialType={searchParams.type}
      />
    </div>
  )
}
