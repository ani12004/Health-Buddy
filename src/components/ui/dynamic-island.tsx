'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, User, Bell, Activity, LayoutGrid } from 'lucide-react';
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
                className="bg-foreground text-background rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden"
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
                    <div className="relative w-24 h-8 mx-auto cursor-pointer">
                        <Image
                            src="/logo.png"
                            alt="Health Buddy"
                            fill
                            className="object-contain"
                            priority
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

                        <Link href="/dashboard" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <LayoutGrid className="w-4 h-4" />
                        </Link>

                        <Link href="/profile" className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <User className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
