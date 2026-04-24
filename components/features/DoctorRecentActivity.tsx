'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, FileText, Calendar, Activity, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ActivityItem {
    id: string
    type: 'message' | 'report' | 'appointment'
    title: string
    description: string
    time: string
    link: string
}

export function DoctorRecentActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchActivity = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch recent messages, reports, and appointments
            const [
                { data: messages },
                { data: reports },
                { data: appointments }
            ] = await Promise.all([
                supabase.from('messages').select('id, content, created_at, sender:sender_id(full_name)').eq('receiver_id', user.id).order('created_at', { ascending: false }).limit(3),
                supabase.from('reports').select('id, title, created_at, patient:patient_id(full_name)').eq('doctor_id', user.id).order('created_at', { ascending: false }).limit(3),
                supabase.from('appointments').select('id, type, appointment_date, patient:patient_id(full_name)').eq('doctor_id', user.id).order('created_at', { ascending: false }).limit(3)
            ])

            const items: ActivityItem[] = []

            messages?.forEach(m => {
                const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender;
                items.push({
                    id: m.id,
                    type: 'message',
                    title: `Message from ${sender?.full_name || 'Patient'}`,
                    description: m.content.length > 40 ? m.content.substring(0, 40) + '...' : m.content,
                    time: m.created_at,
                    link: '/doctor/patients'
                });
            });

            reports?.forEach(r => {
                const patient = Array.isArray(r.patient) ? r.patient[0] : r.patient;
                items.push({
                    id: r.id,
                    type: 'report',
                    title: `New Report: ${patient?.full_name || 'Patient'}`,
                    description: r.title,
                    time: r.created_at,
                    link: `/doctor/patients`
                });
            });

            appointments?.forEach(a => {
                const patient = Array.isArray(a.patient) ? a.patient[0] : a.patient;
                items.push({
                    id: a.id,
                    type: 'appointment',
                    title: `Booking: ${patient?.full_name || 'Patient'}`,
                    description: `${a.type} on ${new Date(a.appointment_date).toLocaleDateString()}`,
                    time: a.appointment_date,
                    link: '/doctor/appointments'
                });
            });

            setActivities(items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5))
            setLoading(false)
        }

        fetchActivity()
    }, [])

    if (loading) return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-3xl border border-slate-100 dark:border-slate-700 p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                </h3>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 text-sm font-medium">No recent activity found.</p>
                    </div>
                ) : (
                    activities.map((item) => (
                        <Link href={item.link} key={item.id} className="block p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                    item.type === 'message' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" :
                                    item.type === 'report' ? "bg-red-50 text-red-600 dark:bg-red-900/20" :
                                    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20"
                                )}>
                                    {item.type === 'message' && <MessageSquare className="w-5 h-5" />}
                                    {item.type === 'report' && <FileText className="w-5 h-5" />}
                                    {item.type === 'appointment' && <Calendar className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</p>
                                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{item.description}</p>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            
            {activities.length > 0 && (
                <div className="p-4 bg-slate-50/50 dark:bg-white/5 text-center">
                    <Link href="/doctor/patients" className="text-xs font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                        Refresh Feed
                    </Link>
                </div>
            )}
        </div>
    )
}
