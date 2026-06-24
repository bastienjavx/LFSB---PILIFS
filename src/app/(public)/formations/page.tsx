import PublicContentList from '@/components/PublicContentList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Modules de formation' }
export const dynamic = 'force-dynamic'

export default function FormationsPage() {
  return <PublicContentList contentKey="formations" />
}
