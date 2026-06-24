import PublicContentDetail from '@/components/PublicContentDetail'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Article' }
export const dynamic = 'force-dynamic'

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <PublicContentDetail contentKey="blog" slug={params.slug} />
}
