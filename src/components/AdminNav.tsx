'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊', exact: true },
  { href: '/admin/notes', label: 'Notes & contenus', icon: '📝', type: '' },
  { href: '/admin/notes?type=BLOG', label: 'Blog', icon: '📰', type: 'BLOG' },
  { href: '/admin/notes?type=TRAINING', label: 'Formations', icon: '🎓', type: 'TRAINING' },
  { href: '/admin/notes?type=GUIDE', label: 'Guides', icon: '🧭', type: 'GUIDE' },
  { href: '/admin/categories', label: 'Catégories', icon: '🗂️' },
  { href: '/admin/media', label: 'Médias', icon: '🖼️' },
  { href: '/admin/import', label: 'Import Obsidian', icon: '📥' },
  { href: '/admin/utilisateurs', label: 'Administrateurs', icon: '👥' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || ''
  const { data: session } = useSession()
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN'

  // Le lien « Administrateurs » donne accès à la gestion des comptes et au
  // journal : réservé aux ADMIN. Les éditeurs gardent l'accès à leur 2FA via
  // la page elle-même, mais on masque l'entrée de menu pour rester simple.
  const visibleLinks = links.filter((l) => l.href !== '/admin/utilisateurs' || isAdmin)

  return (
    <>
      {visibleLinks.map(({ href, label, icon, exact, type }) => {
        const active = type !== undefined
          ? pathname.startsWith('/admin/notes') && currentType === type
          : exact
            ? pathname === href
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-green-50 text-green-800'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="text-base" aria-hidden>{icon}</span>
            {label}
          </Link>
        )
      })}

      <div className="pt-4 mt-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
        >
          <span className="text-base" aria-hidden>🚪</span>
          Déconnexion
        </button>
      </div>
    </>
  )
}
