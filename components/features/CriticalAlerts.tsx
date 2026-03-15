'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function getTimeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return new Date(date).toLocaleDateString()
}

export function CriticalAlerts() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchAlerts = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch reports shared with this doctor having critical severity
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    id,
                    title,
                    severity,
                    created_at,
                    patient:patient_id (full_name)
                `)
                .eq('doctor_id', user.id)
                .eq('severity', 'critical')
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) {
                console.error('Error fetching alerts:', error)
            } else {
                setAlerts(data || [])
            }
            setLoading(false)
        }

        fetchAlerts()
    }, [])

    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Critical Alerts
                </h3>
                {alerts.length > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400">
                        {alerts.length} New
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No critical alerts at this time.</p>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{alert.patient?.full_name || 'James Rodriguez'}</span>
                                <span className="text-[10px] text-red-500 font-bold bg-white dark:bg-black/20 px-1.5 py-0.5 rounded uppercase">{alert.severity} PRIORITY</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                                {alert.title}: Potential critical health markers detected in recent AI checkup.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{getTimeAgo(alert.created_at)} ago</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="w-full mt-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                View All Alerts
            </button>
        </div>
    )
}
