'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Trace côté serveur dans les logs (utile sur Railway).
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--page-bg)] px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-extrabold text-[var(--ink)]">
          Une erreur est survenue
        </h1>
        <p className="mt-3 text-base font-semibold text-[var(--muted)]">
          Le site a rencontré un problème. Tu peux réessayer.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-primary">
            Réessayer
          </button>
          <Link href="/" className="btn-secondary">Retour à l’accueil</Link>
        </div>
      </div>
    </main>
  )
}
