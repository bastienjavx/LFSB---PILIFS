'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Tableau de bord', icon: '📊', exact: true },
  { href: '/admin/notes', label: 'Notes & Signes', icon: '📝' },
  { href: '/admin/categories', label: 'Catégories', icon: '🗂️' },
  { href: '/admin/media', label: 'Médias', icon: '🖼️' },
  { href: '/admin/import', label: 'Import Obsidian', icon: '📥' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      {links.map(({ href, label, icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
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
