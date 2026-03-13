'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Code, ChevronRight, Home, Shield } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const sidebarItems = [
  {
    title: 'Overview',
    href: '/docs',
    icon: Home,
  },
  {
    title: 'General Docs',
    href: '/docs/general',
    icon: FileText,
  },
  {
    title: 'Developer Docs',
    href: '/docs/developer',
    icon: Code,
  },
]

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">Health Buddy <span className="text-primary">Docs</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 flex-1 flex flex-col md:flex-row gap-8 py-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Documentation
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                    pathname === item.href
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4",
                    pathname === item.href ? "text-primary" : ""
                  )} />
                  {item.title}
                  {pathname === item.href && (
                    <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  )
}
