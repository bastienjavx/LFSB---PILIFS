import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import AccessibilityToolbar from '@/components/AccessibilityToolbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-[var(--ink)]">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      <SiteHeader />

      <main id="contenu" className="flex-1 pb-28">
        {children}
      </main>

      <SiteFooter />

      <AccessibilityToolbar />
    </div>
  )
}
