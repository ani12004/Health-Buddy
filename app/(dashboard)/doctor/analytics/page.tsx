import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
    Users, 
    Activity, 
    Calendar, 
    TrendingUp, 
    Heart, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Brain,
    Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Notifications } from '@/components/layout/Notifications'
import { cn } from '@/lib/utils/cn'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch aggregated data
    const { count: totalPatients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient')
    const { count: criticalReports } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('severity', 'critical')
    const { count: totalAppointments } = await supabase.from('appointments').select('*', { count: 'exact', head: true })
    const { count: activeMedications } = await supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')

    const stats = [
        { 
            label: 'Total Patients', 
            value: totalPatients || 0, 
            change: '+12%', 
            trend: 'up', 
            icon: Users, 
            color: 'text-blue-500', 
            bg: 'bg-blue-50 dark:bg-blue-900/10' 
        },
        { 
            label: 'Critical Reports', 
            value: criticalReports || 0, 
            change: '-5%', 
            trend: 'down', 
            icon: AlertCircle, 
            color: 'text-rose-500', 
            bg: 'bg-rose-50 dark:bg-rose-900/10' 
        },
        { 
            label: 'Appointments', 
            value: totalAppointments || 0, 
            change: '+18%', 
            trend: 'up', 
            icon: Calendar, 
            color: 'text-amber-500', 
            bg: 'bg-amber-50 dark:bg-amber-900/10' 
        },
        { 
            label: 'Active Prescriptions', 
            value: activeMedications || 0, 
            change: '+2%', 
            trend: 'up', 
            icon: Activity, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-50 dark:bg-emerald-900/10' 
        },
    ]

    // Condition Distribution (Mock data for visualization)
    const conditions = [
        { name: 'Cardiovascular', count: 42, color: 'bg-rose-500' },
        { name: 'Respiratory', count: 28, color: 'bg-blue-500' },
        { name: 'Neurological', count: 15, color: 'bg-amber-500' },
        { name: 'Endocrine', count: 12, color: 'bg-emerald-500' },
        { name: 'Orthopedic', count: 8, color: 'bg-slate-400' },
    ]

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clinical Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health trends and clinic performance.</p>
                </div>
                <Notifications />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, idx) => (
                    <Card key={idx} className="p-6 overflow-hidden relative group">
                        <div className="flex justify-between items-start">
                            <div className={cn("p-3 rounded-2xl", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                                item.trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                            )}>
                                {item.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {item.change}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Condition Distribution Chart */}
                <Card className="lg:col-span-1 p-6 space-y-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Patient Demographics
                    </h3>
                    <div className="space-y-4">
                        {conditions.map((c, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{c.count}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", c.color)} 
                                        style={{ width: `${c.count}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 italic">Data based on AI assessment tags and diagnostic reports from the last 30 days.</p>
                    </div>
                </Card>

                {/* Health Trends / Performance */}
                <Card className="lg:col-span-2 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Clinical Performance
                        </h3>
                        <select className="bg-slate-50 dark:bg-white/5 border-none text-xs font-bold rounded-lg px-3 py-1.5 outline-none text-slate-500 hover:text-slate-900 transition-colors">
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                    
                    <div className="h-64 flex items-end justify-between gap-4 pt-4">
                        {[45, 62, 38, 55, 75, 50, 42, 58, 65, 48, 72, 80].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full relative">
                                    <div 
                                        className="w-full bg-slate-100 dark:bg-white/5 rounded-t-lg group-hover:bg-primary/20 transition-all" 
                                        style={{ height: '16rem' }} 
                                    />
                                    <div 
                                        className="absolute bottom-0 w-full bg-primary/40 group-hover:bg-primary rounded-t-lg transition-all" 
                                        style={{ height: `${(h/100) * 16}rem` }} 
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap">
                                            {h} Assessments
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Health Score</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">84/100</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Accuracy</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">99.2%</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
