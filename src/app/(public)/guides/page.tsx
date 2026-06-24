import PublicContentList from '@/components/PublicContentList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Guides et tutoriels' }
export const dynamic = 'force-dynamic'

export default function GuidesPage() {
  return <PublicContentList contentKey="guides" />
}
