'use client'

import { motion } from 'framer-motion'

interface ShapXaiChartProps {
    shapValues: Record<string, number>
    title: string
}

export function ShapXaiChart({ shapValues, title }: ShapXaiChartProps) {
    // Sort and take top 5 contributing factors
    const factors = Object.entries(shapValues)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 5)
        .map(([name, val]) => ({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            value: val,
            impact: val > 0 ? 'Increase Risk' : 'Decrease Risk'
        }))

    const maxVal = Math.max(...factors.map(f => Math.abs(f.value)))

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="mb-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
            
            <div className="space-y-4">
                {factors.map((factor, i) => {
                    const width = (Math.abs(factor.value) / maxVal) * 100
                    const isPositive = factor.value > 0

                    return (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-700">{factor.name}</span>
                                <span className={isPositive ? 'text-rose-500' : 'text-emerald-500'}>
                                    {isPositive ? '+' : ''}{factor.value.toFixed(2)}
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className={`absolute top-0 h-full rounded-full ${isPositive ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                    style={{ left: isPositive ? '50%' : 'auto', right: isPositive ? 'auto' : '50%' }}
                                />
                                <div className="absolute left-1/2 top-0 w-px h-full bg-slate-200" />
                            </div>
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-8 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Supports Health</span>
                <span>Impact</span>
                <span>Increases Risk</span>
            </div>
        </div>
    )
}
