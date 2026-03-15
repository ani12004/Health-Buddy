'use client'

import { motion } from 'framer-motion'

interface HealthScoreMeterProps {
    score: number // 0 to 100
}

export function HealthScoreMeter({ score }: HealthScoreMeterProps) {
    const radius = 90
    const stroke = 12
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (score / 100) * circumference

    const getScoreColor = (s: number) => {
        if (s >= 80) return '#22c55e' // Excellent
        if (s >= 60) return '#84cc16' // Good
        if (s >= 40) return '#eab308' // Moderate
        return '#ef4444' // Poor
    }

    const color = getScoreColor(score)

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
            <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Health Score</h3>
            <div className="relative">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#f1f5f9"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <motion.circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl font-black text-slate-800"
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs font-bold text-slate-400">OPTIMAL</span>
                </div>
            </div>
            
            <div className="mt-6 flex gap-4 text-center">
                <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                    Status: {score >= 60 ? 'Healthy' : 'Needs Attention'}
                </div>
            </div>
        </div>
    )
}
