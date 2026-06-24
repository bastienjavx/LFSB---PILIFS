import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Pilifs LFSB - Ferme Nos Pilifs',
    template: '%s | Pilifs LFSB',
  },
  description: 'Signes LFSB (Langue Française des Signes de Belgique) de la Ferme Nos Pilifs',
  keywords: ['LFSB', 'langue des signes', 'Nos Pilifs', 'ferme', 'Belgique', 'accessibilité'],
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
