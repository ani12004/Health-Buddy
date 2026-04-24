'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function PendingAppointments() {
    const supabase = createClient()
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id(full_name)
            `)
            .eq('doctor_id', user.id)
            .eq('status', 'pending')
            .order('appointment_date', { ascending: true })

        if (data) setAppointments(data)
        setLoading(false)
    }

    const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({})

    const handleUpdate = async (id: string, newStatus: 'scheduled' | 'cancelled') => {
        const link = meetingLinks[id]
        const res = await updateAppointmentStatus(id, newStatus, link)
        if (res.success) {
            toast.success(`Appointment ${newStatus === 'scheduled' ? 'confirmed' : 'declined'}`)
            fetchPending()
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    if (loading) return null
    if (appointments.length === 0) return null

    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/10">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Pending Requests ({appointments.length})
                </h3>
                <Link href="/doctor/appointments" className="text-[10px] font-bold text-primary hover:underline uppercase">View All</Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {appointments.map((app) => (
                    <div key={app.id} className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{app.patient?.full_name}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(app.appointment_date).toLocaleDateString()} at {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 text-[10px] font-bold rounded uppercase">{app.type}</span>
                        </div>
                        
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Meeting Link (Zoom, Meet, WA...)"
                                className="w-full px-3 py-1.5 text-[11px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary/30"
                                value={meetingLinks[app.id] || ''}
                                onChange={(e) => setMeetingLinks(prev => ({ ...prev, [app.id]: e.target.value }))}
                            />
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-red-500 text-[11px]" onClick={() => handleUpdate(app.id, 'cancelled')}>
                                    <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                                </Button>
                                <Button size="sm" className="flex-1 h-8 text-[11px]" onClick={() => handleUpdate(app.id, 'scheduled')}>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
