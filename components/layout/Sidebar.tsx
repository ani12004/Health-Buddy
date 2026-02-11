'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { UserProfile } from '@/types'
import {
    LayoutDashboard,
    FileText,
    Calendar,
    Pill,
    Settings,
    LogOut,
    Users,
    MessageSquare,
    Activity,
    BarChart2,
    Shield // For Logo
} from 'lucide-react'
import { useAuth } from '@/components/providers'

interface SidebarProps {
    profile: UserProfile | null
}

export function Sidebar({ profile }: SidebarProps) {
    const pathname = usePathname()
    const { signOut } = useAuth()
    const role = profile?.role || 'patient'

    const patientLinks = [
        { href: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/patient/profile', label: 'Medical Reports', icon: FileText }, // Using profile/reports tab concept
        { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
        { href: '/patient/medications', label: 'Prescriptions', icon: Pill },
        { href: '/patient/chat', label: 'AI Chat', icon: MessageSquare },
    ]

    const doctorLinks = [
        { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/doctor/patients', label: 'Patients', icon: Users },
        // { href: '/doctor/messages', label: 'Messages', icon: MessageSquare },
        { href: '/doctor/analytics', label: 'Analytics', icon: BarChart2 },
    ]

    const links = role === 'doctor' ? doctorLinks : patientLinks

    return (
        <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 dark:bg-neutral-surface-dark/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-700/30 z-50 flex flex-col justify-between hidden lg:flex transition-colors duration-300">
            {/* Logo Area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-10">
                    <Link href="/" className="block">
                        <img src="/logo_navi_health_buddy.png" alt="Health Buddy" className="h-12 w-auto object-contain" />
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full"></div>}
                                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <Link
                    href={role === 'doctor' ? '/doctor/settings' : '/patient/profile'}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium transition-all group"
                >
                    <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span>Settings</span>
                </Link>

                {/* User Profile Snippet */}
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-white/5">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-xs font-bold">{profile?.full_name?.charAt(0) || 'U'}</span>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{role}</p>
                    </div>
                    <button onClick={() => signOut()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    )
}
