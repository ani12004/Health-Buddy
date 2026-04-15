'use client'

import { Brain, Sparkles, Activity, ShieldCheck, HeartPulse, Microscope } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

const PHASES = [
    { id: 'data', label: 'Processing medical data...', icon: Activity, color: 'text-blue-500' },
    { id: 'ml', label: 'Running predictive ensemble...', icon: Microscope, color: 'text-purple-500' },
    { id: 'reasoning', label: 'Gemini AI generating reasoning...', icon: Brain, color: 'text-pink-500' },
    { id: 'validation', label: 'Finalizing clinical report...', icon: ShieldCheck, color: 'text-emerald-500' }
]

export function AILoadingAnimation() {
    const [currentPhase, setCurrentPhase] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPhase(prev => (prev + 1) % PHASES.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-12">
            <div className="relative flex items-center justify-center">
                {/* Orbital Rings */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-48 h-48 border-2 border-dashed border-blue-500/20 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-64 h-64 border-2 border-dashed border-purple-500/10 rounded-full"
                />
                
                {/* Main Logo Hexagon Container */}
                <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotateY: [0, 180, 360] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-2xl shadow-blue-500/20 flex items-center justify-center border border-white/50"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPhase}
                            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.5, type: "spring" }}
                            className={cn("p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20", PHASES[currentPhase].color)}
                        >
                            {(() => {
                                const Icon = PHASES[currentPhase].icon
                                return <Icon className="w-16 h-16" />
                            })()}
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Pulsing Sparkle Overlay */}
                    <motion.div 
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 text-yellow-400"
                    >
                        <Sparkles className="w-8 h-8 fill-current" />
                    </motion.div>
                </motion.div>
                
                {/* Scanning Beam */}
                <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -left-10 -right-10 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent blur-sm z-20"
                />
            </div>

            <div className="space-y-6 text-center max-w-sm">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPhase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {PHASES[currentPhase].label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                             Wait while our AI conducts a deep clinical analysis...
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3">
                    {PHASES.map((_, idx) => (
                        <div 
                            key={idx}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-500",
                                idx === currentPhase ? "w-8 bg-blue-500 shadow-sm shadow-blue-500/50" : "w-2 bg-gray-200 dark:bg-gray-700"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
