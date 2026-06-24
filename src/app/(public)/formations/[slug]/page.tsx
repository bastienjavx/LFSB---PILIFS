import PublicContentDetail from '@/components/PublicContentDetail'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Module de formation' }
export const dynamic = 'force-dynamic'

export default function FormationDetailPage({ params }: { params: { slug: string } }) {
  return <PublicContentDetail contentKey="formations" slug={params.slug} />
}
