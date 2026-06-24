import PublicContentDetail from '@/components/PublicContentDetail'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Guide' }
export const dynamic = 'force-dynamic'

export default function GuideDetailPage({ params }: { params: { slug: string } }) {
  return <PublicContentDetail contentKey="guides" slug={params.slug} />
}
