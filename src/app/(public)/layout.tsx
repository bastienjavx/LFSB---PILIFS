import Link from 'next/link'
import AccessibilityToolbar from '@/components/AccessibilityToolbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--page-bg)] text-[var(--ink)]">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <header className="site-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="brand-link" aria-label="Accueil Nos Pilifs Signes LFSB">
            <div className="brand-mark" aria-hidden>
              <span>✋</span>
            </div>
            <div>
              <div className="text-base font-black leading-tight tracking-normal sm:text-lg">Nos Pilifs</div>
              <div className="text-xs font-semibold leading-tight text-emerald-950/70 sm:text-sm">Signes LFSB</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Navigation principale">
            <Link
              href="/signes"
              className="nav-link"
              aria-label="Voir tous les signes"
            >
              <span className="text-xl" role="img" aria-hidden>👐</span>
              <span>Signes</span>
            </Link>
            <Link
              href="/information"
              className="nav-link"
              aria-label="Informations sur la ferme"
            >
              <span className="text-xl" role="img" aria-hidden>📖</span>
              <span>Information</span>
            </Link>
            <Link
              href="/admin"
              className="nav-link hidden sm:inline-flex"
              aria-label="Administration"
            >
              <span className="text-xl" role="img" aria-hidden>⚙</span>
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      <AccessibilityToolbar />

      <main id="contenu" className="flex-1">{children}</main>

      <footer className="border-t border-emerald-950/10 bg-white px-4 py-8 text-center text-sm font-semibold text-emerald-950/70">
        <p>Ferme Nos Pilifs - Langue Française des Signes de Belgique</p>
      </footer>
    </div>
  )
}
