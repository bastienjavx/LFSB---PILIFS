import Link from 'next/link'
import { HandIcon, ShieldIcon, HeartIcon, MailIcon } from '@/components/icons'

const items = [
  { Icon: HandIcon, label: 'Conçu pour être accessible' },
  { Icon: ShieldIcon, label: 'Respect de la vie privée' },
  { Icon: HeartIcon, label: 'Un site public et inclusif' },
  { Icon: MailIcon, label: 'Nous contacter', href: '/information' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-[var(--brand-900)] text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map(({ Icon, label, href }) => {
          const content = (
            <span className="flex items-center justify-center gap-2.5 text-center text-sm font-semibold">
              <Icon width={22} height={22} stroke="white" className="shrink-0" />
              {label}
            </span>
          )
          return href ? (
            <Link key={label} href={href} className="no-highlight rounded-lg py-1 transition hover:text-blue-200">
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          )
        })}
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-blue-200/80">
        PILIFS — Langue Française des Signes de Belgique · Ferme Nos Pilifs
      </div>
    </footer>
  )
}
