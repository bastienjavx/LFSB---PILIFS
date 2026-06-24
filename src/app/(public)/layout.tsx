import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
              🌿
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Nos Pilifs</div>
              <div className="text-green-200 text-xs leading-tight">Signes LFSB</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Navigation principale">
            <Link
              href="/signes"
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl hover:bg-green-600 transition-colors text-center"
              aria-label="Voir tous les signes"
            >
              <span className="text-2xl" role="img" aria-hidden>👐</span>
              <span className="text-xs font-medium hidden sm:block">Signes</span>
            </Link>
            <Link
              href="/information"
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl hover:bg-green-600 transition-colors text-center"
              aria-label="Informations sur la ferme"
            >
              <span className="text-2xl" role="img" aria-hidden>📖</span>
              <span className="text-xs font-medium hidden sm:block">Infos</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-green-800 text-green-200 text-center py-4 px-4 text-sm">
        <p>🌿 Ferme Nos Pilifs — LFSB Belgique</p>
      </footer>
    </div>
  )
}
