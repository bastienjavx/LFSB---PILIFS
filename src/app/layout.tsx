import type { Metadata } from 'next'
import './globals.css'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Main Verte - LFSB aux Pilifs',
    template: '%s | Main Verte',
  },
  description: 'Apprendre les signes LFSB dans l’univers inclusif et vivant de la Ferme Nos Pilifs.',
  keywords: ['Main Verte', 'LFSB', 'langue des signes', 'Nos Pilifs', 'ferme', 'Belgique', 'accessibilité'],
  applicationName: 'Main Verte',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    siteName: 'Main Verte',
    title: 'Main Verte - LFSB aux Pilifs',
    description: 'Apprendre les signes LFSB dans l’univers inclusif et vivant de la Ferme Nos Pilifs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Main Verte - LFSB aux Pilifs',
    description: 'Les signes LFSB de la Ferme Nos Pilifs, en clair et accessible.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
