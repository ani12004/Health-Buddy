import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { UserProfile } from '@/types'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch full profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display transition-colors duration-300">
            <Sidebar profile={profile as UserProfile} />

            {/* Main Content Area */}
            <main className="lg:ml-72 flex-1 w-full max-w-7xl mx-auto p-6 lg:p-10">
                {children}
            </main>
        </div>
    )
}
