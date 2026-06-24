import PublicContentList from '@/components/PublicContentList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog' }
export const dynamic = 'force-dynamic'

export default function BlogPage() {
  return <PublicContentList contentKey="blog" />
}
