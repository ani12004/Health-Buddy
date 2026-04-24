'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, CheckCircle2, XCircle, Loader2, Search, Video, MessageSquare, MoreVertical, ExternalLink, CalendarDays, Users, AlertCircle, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { DirectMessageModal } from './DirectMessageModal'

export function DoctorAppointmentsList() {
    const supabase = createClient()
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'past'>('upcoming')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string } | null>(null)
    const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id(id, full_name, email)
            `)
            .eq('doctor_id', user.id)
            .order('appointment_date', { ascending: true })

        if (data) setAppointments(data)
        setLoading(false)
    }

    const handleStatusUpdate = async (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
        const meetingLink = meetingLinks[id] || ''
        const res = await updateAppointmentStatus(id, newStatus, meetingLink)
        if (res.success) {
            toast.success(`Appointment marked as ${newStatus}`)
            fetchAppointments()
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const stats = useMemo(() => {
        return {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            upcoming: appointments.filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= today).length,
            completed: appointments.filter(a => a.status === 'completed').length
        }
    }, [appointments])

    const filteredAppointments = useMemo(() => {
        let filtered = appointments
        
        // Tab filtering
        if (activeTab === 'pending') {
            filtered = filtered.filter(a => a.status === 'pending')
        } else if (activeTab === 'upcoming') {
            filtered = filtered.filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= today)
        } else {
            filtered = filtered.filter(a => a.status === 'completed' || a.status === 'cancelled' || (a.status === 'scheduled' && new Date(a.appointment_date) < today))
        }

        // Search filtering
        if (searchQuery) {
            filtered = filtered.filter(a => 
                a.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.type?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }, [appointments, activeTab, searchQuery])

    if (loading) return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-20 flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <CalendarDays className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
                <p className="text-xl font-black text-slate-900 dark:text-white">Organizing your schedule</p>
                <p className="text-slate-500 font-medium">Fetching the latest appointment data...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Upcoming</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.upcoming}</p>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
                    <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Visits</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-full xl:w-fit">
                    {(['upcoming', 'pending', 'past'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 xl:flex-none px-6 py-3 rounded-xl text-sm font-black transition-all capitalize whitespace-nowrap",
                                activeTab === tab 
                                    ? "bg-white dark:bg-slate-800 text-primary shadow-lg shadow-black/5" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                        >
                            {tab === 'past' ? 'Past History' : tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full xl:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by patient name or visit type..."
                        className="w-full pl-12 pr-4 h-14 bg-white dark:bg-neutral-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-900 dark:text-white shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid gap-6">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-neutral-surface-dark rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Inbox className="w-12 h-12 text-slate-300" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No matching appointments</h4>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">We couldn't find any {activeTab} appointments matching your current search criteria.</p>
                        <Button 
                            variant="outline" 
                            className="mt-8 rounded-xl border-slate-200 dark:border-slate-700"
                            onClick={() => {setSearchQuery(''); setActiveTab('upcoming')}}
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    filteredAppointments.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                            {/* Status Indicator */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10",
                                app.status === 'pending' ? "bg-amber-500" : app.status === 'scheduled' ? "bg-primary" : "bg-emerald-500"
                            )} />

                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 relative z-10">
                                {/* Date Display */}
                                <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-700/50 shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{new Date(app.appointment_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                    <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{new Date(app.appointment_date).getDate()}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">{new Date(app.appointment_date).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0 w-full space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{app.patient?.full_name}</h4>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                    app.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20" :
                                                    app.status === 'scheduled' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20" :
                                                    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800"
                                                )}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                                                    <Search className="w-4 h-4" />
                                                    {app.type}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setSelectedPatient({ id: app.patient?.id, name: app.patient?.full_name })}
                                                className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-100 dark:border-slate-700">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
                                        {app.status === 'pending' && (
                                            <>
                                                <div className="relative flex-1 w-full group/input">
                                                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                                                    <input 
                                                        type="text"
                                                        placeholder="Paste meeting link (Zoom, GMeet, WhatsApp)..."
                                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 text-sm transition-all font-medium"
                                                        value={meetingLinks[app.id] || ''}
                                                        onChange={(e) => setMeetingLinks({...meetingLinks, [app.id]: e.target.value})}
                                                    />
                                                </div>
                                                <div className="flex gap-3 w-full sm:w-auto">
                                                    <Button variant="outline" className="flex-1 sm:flex-none border-red-100 text-red-500 hover:bg-red-50 rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-widest" onClick={() => handleStatusUpdate(app.id, 'cancelled')}>
                                                        Decline
                                                    </Button>
                                                    <Button className="flex-1 sm:flex-none rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => handleStatusUpdate(app.id, 'scheduled')}>
                                                        Approve Visit
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                        
                                        {app.status === 'scheduled' && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                                                <div className="flex items-center gap-6">
                                                    {app.meeting_link ? (
                                                        <a 
                                                            href={app.meeting_link.startsWith('http') ? app.meeting_link : `https://${app.meeting_link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 text-sm font-black text-primary bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20 hover:bg-primary/10 transition-all"
                                                        >
                                                            <Video className="w-5 h-5" />
                                                            Launch Virtual Consultation
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-2xl">
                                                            <Video className="w-5 h-5 opacity-50" />
                                                            No link provided
                                                        </div>
                                                    )}
                                                </div>
                                                <Button className="w-full sm:w-auto rounded-2xl px-8 h-12 font-black text-xs uppercase tracking-widest" onClick={() => handleStatusUpdate(app.id, 'completed')}>
                                                    Mark as Completed
                                                </Button>
                                            </div>
                                        )}

                                        {app.status === 'completed' && (
                                            <div className="flex items-center gap-3 text-emerald-600 font-black text-sm bg-emerald-50 dark:bg-emerald-900/10 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Session successfully completed on {new Date(app.updated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </div>
                                        )}

                                        {app.status === 'cancelled' && (
                                            <div className="flex items-center gap-3 text-red-500 font-black text-sm bg-red-50 dark:bg-red-900/10 px-6 py-3 rounded-2xl border border-red-100 dark:border-red-900/20">
                                                <XCircle className="w-5 h-5" />
                                                This appointment was cancelled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedPatient && (
                <DirectMessageModal
                    isOpen={!!selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    receiverId={selectedPatient.id}
                    receiverName={selectedPatient.name}
                />
            )}
        </div>
    )
}
