import { prisma } from '@/lib/prisma'
import FlashcardTrainer from '@/components/FlashcardTrainer'
import type { Metadata } from 'next'
import { NoteType } from '@prisma/client'

export const metadata: Metadata = { title: 'Cartes mémoire' }
export const dynamic = 'force-dynamic'

export default async function CartesPage() {
  const cards = await prisma.note.findMany({
    where: { published: true, type: NoteType.SIGN },
    orderBy: { title: 'asc' },
    include: {
      category: { select: { name: true, color: true } },
      media: { where: { type: { in: ['IMAGE', 'GIF', 'VIDEO'] } }, take: 1 },
    },
  })

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">Cartes mémoire</h1>
        <p className="mt-2 text-base font-semibold leading-7 text-[var(--muted)]">
          Révise les signes avec des cartes visuelles. Les images et vidéos ajoutées dans l’admin sont utilisées automatiquement.
        </p>
      </div>
      <FlashcardTrainer cards={cards} />
    </div>
  )
}
