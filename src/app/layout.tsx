import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Main Verte - LFSB aux Pilifs',
    template: '%s | Main Verte',
  },
  description: 'Apprendre les signes LFSB dans l’univers inclusif et vivant de la Ferme Nos Pilifs.',
  keywords: ['Main Verte', 'LFSB', 'langue des signes', 'Nos Pilifs', 'ferme', 'Belgique', 'accessibilité'],
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
