import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface VitalCardProps {
    label: string
    value: string
    unit: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
    color: string // Tailwind color class prefix e.g 'red', 'blue'
}

export function VitalCard({ label, value, unit, icon: Icon, trend, color }: VitalCardProps) {
    return (
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    `bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
                        <span className="text-sm font-medium text-slate-400">{unit}</span>
                    </div>
                </div>
            </div>
            {/* Trend Indicator could go here */}
        </Card>
    )
}
