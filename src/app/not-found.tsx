import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--page-bg)] px-6 text-center">
      <div className="max-w-md">
        <p className="text-6xl font-extrabold text-[var(--brand-700)]">404</p>
        <h1 className="mt-4 text-2xl font-extrabold text-[var(--ink)]">
          Cette page n’existe pas
        </h1>
        <p className="mt-3 text-base font-semibold text-[var(--muted)]">
          Le signe ou la page que tu cherches a peut-être été déplacé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Retour à l’accueil</Link>
          <Link href="/signes" className="btn-secondary">Voir tous les signes</Link>
        </div>
      </div>
    </main>
  )
}
