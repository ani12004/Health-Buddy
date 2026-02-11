'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/Button'
import { Menu, X, Shield, Activity, FileText } from 'lucide-react' // Replacements for Material Icons
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export function Navbar() {
    const { user, profile } = useUser()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 glass-panel border-b border-white/50 dark:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <img src="/logo_navi_health_buddy.png" alt="Health Buddy" className="h-10 w-auto object-contain" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-10">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">Features</Link>
                        <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">How it Works</Link>
                        {/* <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors">Pricing</Link> */}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <Link href={profile?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>
                                <Button variant="primary">Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors">Log in</Link>
                                <Link href="/login">
                                    <Button variant="primary" className="shadow-lg shadow-primary/25 hover:shadow-primary/40">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-200 hover:text-primary p-2">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel border-t border-slate-100 dark:border-white/5">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Features</Link>
                        <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">How it Works</Link>
                        <div className="pt-4 flex flex-col gap-3">
                            {user ? (
                                <Link href={profile?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>
                                    <Button className="w-full">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" className="w-full justify-start">Log in</Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button className="w-full">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
