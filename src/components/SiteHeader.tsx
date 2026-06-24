'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  HandIcon,
  InfoIcon,
  AdminIcon,
  AccessibilityIcon,
} from '@/components/icons'

const links = [
  { href: '/', label: 'Accueil', Icon: HomeIcon, exact: true },
  { href: '/signes', label: 'Signes', Icon: HandIcon },
  { href: '/information', label: 'Information', Icon: InfoIcon },
  { href: '/admin', label: 'Administration', Icon: AdminIcon },
]

export default function SiteHeader() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="no-highlight inline-flex items-center gap-3"
          aria-label="Accueil PILIFS LFSB"
        >
          <span className="brand-mark" aria-hidden>
            <HandIcon width={26} height={26} stroke="white" />
          </span>
          <span className="leading-none">
            <span className="block text-xl font-extrabold tracking-tight text-[var(--ink)]">
              PILIFS
            </span>
            <span className="block text-xs font-bold tracking-[0.2em] text-[var(--brand-700)]">
              LFSB
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navigation principale"
        >
          {links.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                data-active={active}
                aria-current={active ? 'page' : undefined}
              >
                <Icon width={22} height={22} />
                <span>{label}</span>
                {active && (
                  <span
                    className="absolute -bottom-[13px] left-3 right-3 h-0.5 rounded-full bg-[var(--brand-700)]"
                    aria-hidden
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-a11y'))}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-800)] px-4 py-2 text-[15px] font-bold text-white shadow-sm transition hover:bg-[var(--brand-900)] focus:outline-none"
          aria-label="Ouvrir les options d'accessibilité"
        >
          <AccessibilityIcon width={20} height={20} stroke="white" />
          <span className="hidden sm:inline">Accessibilité</span>
        </button>
      </div>

      {/* Navigation mobile */}
      <nav
        className="flex items-center justify-around border-t border-[var(--border)] px-2 py-1 md:hidden"
        aria-label="Navigation principale mobile"
      >
        {links.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-bold"
              data-active={active}
              style={{ color: active ? 'var(--brand-700)' : 'var(--muted)' }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon width={22} height={22} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
