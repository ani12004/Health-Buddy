import { Quote, Activity, Calendar, Clock, MapPin, User, FileText } from 'lucide-react'
import Link from 'next/link'

// This would connect to Supabase 'tips' table if it existed, or 'reports'
// For now, adhering to the plan to make it dynamic but simulated via RSC if DB is empty
import { createClient } from '@/lib/supabase/server'

export async function DailyTipCard() {
    const supabase = await createClient()

    // Get count of tips
    const { count } = await supabase
        .from('daily_tips')
        .select('*', { count: 'exact', head: true })

    let tip = {
        title: "Hydration boosts brain function.",
        content: "Drinking water helps maintain focus and energy levels throughout the day. Aim for 8 glasses daily.",
        category: "General"
    }

    if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count)
        const { data } = await supabase
            .from('daily_tips')
            .select('*')
            .range(randomIndex, randomIndex)
            .single()

        if (data) {
            tip = data
        }
    }

    return (
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-amber-50 to-primary/10 dark:from-amber-900/20 dark:to-primary/20 border border-amber-100/50 dark:border-white/5 p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="w-20 h-20 bg-amber-400/20 rounded-full blur-xl"></div>
            </div>

            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-black/30 backdrop-blur-md border border-amber-200/50 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                    Daily Tip
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 leading-snug">{tip.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {tip.content}
                </p>
            </div>
            <div className="mt-6">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    {tip.category || 'General'}
                </span>
            </div>
        </div>
    )
}

export async function RecentReportsList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch reports for this patient
    const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3)

    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Reports</h3>
                <Link href="/patient/medical-reports" className="text-sm font-semibold text-primary hover:text-primary-dark">View All</Link>
            </div>

            <div className="space-y-4">
                {reports && reports.length > 0 ? (
                    reports.map((report: any) => (
                        <Link href={`/api/reports/${report.id}/pdf`} target="_blank" key={report.id} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all flex items-center gap-4 cursor-pointer bg-white dark:bg-neutral-surface-dark shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{report.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(report.created_at).toLocaleDateString()}</p>
                                    {report.severity && (
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${report.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                report.severity === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            {report.severity}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-lg border border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-slate-700">
                                {report.severity || 'Normal'}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        No medical reports found.
                    </div>
                )}
            </div>
        </div>
    )
}

export async function UpcomingAppointments() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch upcoming appointments with doctor details
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            doctor:profiles!doctor_id (
                full_name,
                avatar_url,
                doctors (
                    specialty
                )
            )
        `)
        .eq('patient_id', user?.id)
        .gte('appointment_date', new Date(new Date().setHours(0,0,0,0)).toISOString())
        .order('appointment_date', { ascending: true })
        .limit(2)

    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Visits
                </h3>
                <Link href="/patient/appointments" className="text-sm font-semibold text-primary hover:text-primary-dark">View Schedule</Link>
            </div>

            <div className="space-y-4">
                {appointments && appointments.length > 0 ? (
                    appointments.map((apt: any) => (
                        <div key={apt.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {apt.doctor?.full_name || 'Medical Specialist'}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                                                {apt.doctor?.doctors?.[0]?.specialty || 'General Practitioner'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                        apt.status === 'scheduled' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                                        apt.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                    }`}>
                                        {apt.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                                        {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                        <Calendar className="w-3.5 h-3.5 text-primary/60" />
                                        {new Date(apt.appointment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500 mb-4">No upcoming appointments.</p>
                        <Link href="/patient/appointments" className="text-xs font-bold text-primary hover:underline">Book a new appointment</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
