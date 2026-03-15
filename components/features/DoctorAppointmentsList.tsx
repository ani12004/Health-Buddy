'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

export function DoctorAppointmentsList() {
    const supabase = createClient()
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('all')

    useEffect(() => {
        fetchAppointments()
    }, [filter])

    const fetchAppointments = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let query = supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id(full_name, email)
            `)
            .eq('doctor_id', user.id)
            .order('appointment_date', { ascending: true })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query
        if (data) setAppointments(data)
        setLoading(false)
    }

    const handleStatusUpdate = async (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
        const res = await updateAppointmentStatus(id, newStatus)
        if (res.success) {
            toast.success(`Appointment marked as ${newStatus}`)
            fetchAppointments()
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    {(['all', 'pending', 'scheduled', 'completed'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={cn(
                                "px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize",
                                filter === s 
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {appointments.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-neutral-surface-dark rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">No appointments found</h4>
                        <p className="text-slate-500 text-sm">Create a follow-up or check back later.</p>
                    </div>
                ) : (
                    appointments.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-neutral-surface-dark rounded-3xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:shadow-lg transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50">
                                <span className="text-[10px] font-black uppercase text-slate-400">{new Date(app.appointment_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{new Date(app.appointment_date).getDate()}</span>
                            </div>
                            
                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{app.patient?.full_name}</h4>
                                    <span className={cn(
                                        "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                                        app.status === 'pending' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                                        app.status === 'scheduled' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                                        "bg-slate-100 text-slate-600 dark:bg-slate-800"
                                    )}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1.5 font-medium text-primary"><Search className="w-4 h-4" /> {app.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                                {app.status === 'pending' && (
                                    <>
                                        <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-500 hover:text-red-600" onClick={() => handleStatusUpdate(app.id, 'cancelled')}>
                                            <XCircle className="w-4 h-4 mr-2" /> Decline
                                        </Button>
                                        <Button size="sm" className="flex-1 md:flex-none" onClick={() => handleStatusUpdate(app.id, 'scheduled')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm
                                        </Button>
                                    </>
                                )}
                                {app.status === 'scheduled' && (
                                    <Button size="sm" className="w-full md:w-auto" onClick={() => handleStatusUpdate(app.id, 'completed')}>
                                        Mark Completed
                                    </Button>
                                )}
                                {app.status === 'completed' && (
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" /> Finished
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
