'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User as UserIcon, AlertCircle, Plus, Loader2 } from 'lucide-react'
import { Notifications } from '@/components/layout/Notifications'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader3D } from '@/components/ui/Loader3D'
import { createAppointment } from '@/lib/actions/appointments'
import { getDoctors } from '@/lib/actions/doctors'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AppointmentsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [booking, setBooking] = useState(false)
    const [doctors, setDoctors] = useState<any[]>([])

    const [formData, setFormData] = useState({
        doctor_id: '',
        type: '',
        date: '',
        time: '',
        notes: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch appointments with doctor profile
        const { data: apps } = await supabase
            .from('appointments')
            .select(`
                *,
                doctor:profiles!doctor_id(
                    full_name,
                    doctors(specialty)
                )
            `)
            .eq('patient_id', user.id)
            .order('appointment_date', { ascending: true })

        // Since specialty is in a different table, we'll keep the join simple for now
        // or join through the profiles -> doctors link if possible.
        // For now, let's just make sure the basic data is visible.

        // Fetch doctors for the list
        const doctorsRes = await getDoctors()
        
        if (apps) setAppointments(apps)
        if (doctorsRes.data) setDoctors(doctorsRes.data)
        setLoading(false)
    }

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault()
        setBooking(true)
        
        const appointment_date = `${formData.date}T${formData.time}:00Z`
        
        const res = await createAppointment({
            doctor_id: formData.doctor_id,
            type: formData.type,
            appointment_date,
            notes: formData.notes
        })

        if (res.success) {
            toast.success('Appointment requested successfully')
            setIsModalOpen(false)
            fetchData()
            router.refresh()
        } else {
            toast.error(res.error || 'Failed to book appointment')
        }
        setBooking(false)
    }

    // Use a more lenient 'now' to include today's appointments
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const upcomingAppointments = appointments.filter(app => {
        const appDate = new Date(app.appointment_date)
        return appDate >= startOfToday && app.status !== 'cancelled' && app.status !== 'completed'
    })
    
    const pastAppointments = appointments.filter(app => {
        const appDate = new Date(app.appointment_date)
        return appDate < startOfToday || app.status === 'cancelled' || app.status === 'completed'
    })

    if (loading) {
        return (
            <Loader3D
                compact
                title="Loading Appointments"
                subtitle="Syncing doctor availability, visit history, and upcoming slots..."
            />
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Appointments</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your upcoming visits and view history.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                    </Button>
                    <Notifications />
                </div>
            </div>

            {/* Upcoming Appointments */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Visits
                </h3>

                {upcomingAppointments.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-slate-300" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No upcoming visits</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">You don't have any appointments scheduled. Book your first consultation today.</p>
                        <Button onClick={() => setIsModalOpen(true)}>Book an Appointment</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {upcomingAppointments.map((app) => (
                            <div key={app.id} className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full sm:w-20 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{new Date(app.appointment_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{new Date(app.appointment_date).getDate()}</span>
                                    <span className="text-xs font-bold text-slate-400">{new Date(app.appointment_date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                </div>
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{app.type}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                {app.status === 'pending' ? 'Pending Confirmation' : 'Confirmed'}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                            app.status === 'pending' 
                                            ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' 
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                        }`}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                            <span>{app.doctor?.full_name || 'Assessing...'} • {app.doctor?.doctors?.[0]?.specialty || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 opacity-60">
                        <Clock className="w-5 h-5" />
                        Past Visits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastAppointments.map((app) => (
                            <div key={app.id} className="p-6 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 opacity-70 grayscale-50 hover:opacity-100 hover:grayscale-0 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{app.type}</h4>
                                    <span className={`text-[10px] uppercase tracking-wider font-heavy px-2 py-0.5 rounded ${
                                        app.status === 'completed' ? 'bg-slate-200 text-slate-700' : 'bg-red-50 text-red-600'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">{new Date(app.appointment_date).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-400">{app.doctor?.full_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Book Appointment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Schedule a Visit"
            >
                <form onSubmit={handleBook} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Doctor</label>
                        <select
                            required
                            className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={formData.doctor_id}
                            onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                        >
                            <option value="">Choose a specialist...</option>
                            {doctors.map(dr => {
                                const drData = Array.isArray(dr.doctors) ? dr.doctors[0] : dr.doctors;
                                return (
                                    <option key={dr.id} value={dr.id}>
                                        {dr.full_name} ({drData?.specialty || 'General'})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Appointment Type</label>
                        <Input 
                            required 
                            placeholder="e.g. Heart Checkup, Follow-up" 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date</label>
                            <Input 
                                type="date" 
                                required 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Time</label>
                            <Input 
                                type="time" 
                                required 
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Additional Notes</label>
                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] transition-all"
                            placeholder="Tell the doctor about your symptoms or concerns..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    <Button type="submit" className="w-full py-4 h-auto text-base" disabled={booking}>
                        {booking ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Booking'}
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
