'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, User, Bell } from 'lucide-react';
import Image from 'next/image';

export function DynamicIsland() {
    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();

    // Hide on login page
    if (pathname === '/login') return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                layout
                className="bg-black text-white rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden"
                initial={{ width: 120, height: 36 }}
                animate={{
                    width: isExpanded ? 300 : 120,
                    height: isExpanded ? 64 : 36,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => setIsExpanded(!isExpanded)}
                onHoverStart={() => setIsExpanded(true)}
                onHoverEnd={() => setIsExpanded(false)}
            >
                {!isExpanded ? (
                    <div className="relative w-24 h-6 mx-auto cursor-pointer">
                        <Image
                            src="/logo.png"
                            alt="Health Buddy"
                            fill
                            className="object-contain brightness-0 invert"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-around w-full px-4 h-full">
                        <Link href="/" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <Home className="w-4 h-4" />
                        </Link>
                        <Link href="/chat" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </Link>
                        <div className="w-px h-6 bg-white/20 mx-1" />

                        {/* Theme Toggle (Mock for now, normally uses next-themes) */}
                        <button
                            onClick={() => document.documentElement.classList.toggle('dark')}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                        >
                            <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-current" />
                            </div>
                        </button>

                        <Link href="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <User className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
