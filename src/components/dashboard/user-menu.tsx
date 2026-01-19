'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface UserMenuProps {
    role: 'patient' | 'doctor';
}

export function UserMenu({ role }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-muted/50 transition-colors outline-none"
            >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl border border-primary/20 text-primary">
                    {role === 'doctor' ? '👨‍⚕️' : '👤'}
                </div>
                {/* <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} /> */}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-16 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-2 space-y-1">
                                <Link
                                    href={`/${role}/profile`}
                                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted text-sm font-medium transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User className="w-4 h-4 text-primary" />
                                    Profile
                                </Link>
                                <button
                                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                                    onClick={() => alert("Settings coming soon!")}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-medium transition-colors text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
