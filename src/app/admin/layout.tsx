import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/AdminNav'
import SessionProvider from '@/components/SessionProvider'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-40 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <img
                src="/main-verte-logo.svg"
                alt=""
                style={{ height: 42, width: 'auto' }}
                aria-hidden
              />
              <div>
                <div className="font-bold text-green-800 text-sm">Main Verte</div>
                <div className="text-xs text-gray-400">Administration</div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1" aria-label="Navigation admin">
            <AdminNav />
          </nav>

          <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
            <p className="truncate">{session.user?.email}</p>
          </div>
        </aside>

        {/* Main content */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="text-sm text-gray-500">Administration</div>
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-green-700 flex items-center gap-1">
                <span aria-hidden>↗</span> Voir le site
              </Link>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
