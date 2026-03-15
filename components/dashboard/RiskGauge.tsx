'use client'

import { motion } from 'framer-motion'

interface RiskGaugeProps {
    value: number // 0 to 1
    label: string
    color?: string
}

export function RiskGauge({ value, label, color = '#3b82f6' }: RiskGaugeProps) {
    const percentage = Math.round(value * 100)
    const strokeDasharray = 251.2 // 2 * PI * r (r=40)
    const strokeDashoffset = strokeDasharray - (strokeDasharray * value)

    const getColor = (v: number) => {
        if (v > 0.7) return '#ef4444' // Red
        if (v > 0.4) return '#eab308' // Yellow
        return '#22c55e' // Green
    }

    const activeColor = value > 0 ? getColor(value) : color

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                        cx="64"
                        cy="64"
                        r="40"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    {/* Active Progress Circle */}
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="40"
                        fill="transparent"
                        stroke={activeColor}
                        strokeWidth="8"
                        strokeDasharray={strokeDasharray}
                        initial={{ strokeDashoffset: strokeDasharray }}
                        animate={{ strokeDashoffset: strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{percentage}%</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Risk</span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>
        </div>
    )
}
