'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

interface CardMedia {
  url: string
  type: string
  alt: string
}

interface Flashcard {
  id: string
  title: string
  slug: string
  excerpt: string
  category: { name: string; color: string } | null
  media: CardMedia[]
}

export default function FlashcardTrainer({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seed, setSeed] = useState(0)

  const orderedCards = useMemo(() => {
    if (seed === 0) return cards
    return [...cards].sort((a, b) => {
      const left = `${a.id}-${seed}`
      const right = `${b.id}-${seed}`
      return left.localeCompare(right)
    })
  }, [cards, seed])

  const card = orderedCards[index]
  const media = card?.media[0]

  function go(nextIndex: number) {
    setFlipped(false)
    setIndex((nextIndex + orderedCards.length) % orderedCards.length)
  }

  if (!card) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <p className="text-lg font-bold text-[var(--ink)]">Aucune carte disponible.</p>
        <Link href="/signes" className="btn-secondary mt-5">Voir les signes</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="group block w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left shadow-lift transition hover:-translate-y-1"
          aria-label={flipped ? 'Masquer la réponse' : 'Afficher la réponse'}
        >
          <div className="grid min-h-[520px] lg:grid-cols-2">
            <div className="relative flex items-center justify-center bg-[var(--brand-soft)]">
              {media?.type === 'VIDEO' ? (
                <video src={media.url} className="h-full max-h-[520px] w-full object-cover" muted playsInline autoPlay loop preload="metadata" />
              ) : media ? (
                <img src={media.url} alt={media.alt || card.title} className="h-full max-h-[520px] w-full object-cover" />
              ) : (
                <div className="text-7xl" aria-hidden>🌿</div>
              )}
              {card.category && (
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-extrabold shadow" style={{ color: card.category.color }}>
                  {card.category.name}
                </span>
              )}
            </div>

            <div className="flex min-h-[320px] flex-col justify-center p-8 sm:p-10">
              <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--brand-700)]">
                {flipped ? 'Réponse' : 'Carte mémoire'}
              </p>
              <div className="mt-4">
                {flipped ? (
                  <>
                    <h2 className="text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">{card.title}</h2>
                    {card.excerpt && <p className="mt-4 text-lg font-semibold leading-8 text-[var(--ink-soft)]">{card.excerpt}</p>}
                    <span className="mt-6 inline-flex text-sm font-bold text-[var(--brand-700)]">Ouvrir la fiche complète →</span>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">Quel est ce signe ?</h2>
                    <p className="mt-4 text-lg font-semibold leading-8 text-[var(--muted)]">
                      Observe l’image ou la vidéo, puis retourne la carte pour vérifier.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <button type="button" onClick={() => go(index - 1)} className="btn-secondary">← Précédente</button>
            <button type="button" onClick={() => go(index + 1)} className="btn-primary">Suivante →</button>
          </div>
          <Link href={`/signes/${card.slug}`} className="btn-secondary">Fiche complète</Link>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-soft">
          <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--brand-700)]">Progression</p>
          <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{index + 1}/{orderedCards.length}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--brand-soft)]">
            <div className="h-full rounded-full bg-[var(--brand-700)]" style={{ width: `${((index + 1) / orderedCards.length) * 100}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSeed((value) => value + 1)
            setIndex(0)
            setFlipped(false)
          }}
          className="btn-secondary w-full"
        >
          Mélanger
        </button>
        <button type="button" onClick={() => setFlipped((value) => !value)} className="btn-secondary w-full">
          {flipped ? 'Masquer la réponse' : 'Retourner la carte'}
        </button>
      </aside>
    </div>
  )
}
