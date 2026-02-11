import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, User as UserIcon, AlertCircle } from 'lucide-react'
import { Notifications } from '@/components/layout/Notifications'

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view appointments.</div>
    }

    // Fetch appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            doctor:doctor_id(full_name, specialty)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true })

    const now = new Date()
    const upcomingAppointments = appointments?.filter(app => new Date(app.appointment_date) >= now && app.status !== 'cancelled' && app.status !== 'completed') || []
    const pastAppointments = appointments?.filter(app => new Date(app.appointment_date) < now || app.status === 'cancelled' || app.status === 'completed') || []

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Appointments</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your upcoming visits and view history.</p>
                </div>
                <Notifications />
            </div>

            {/* Upcoming Appointments */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Visits
                </h3>

                {upcomingAppointments.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No upcoming appointments</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">You don't have any appointments scheduled at the moment.</p>
                        <button className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
                            Book an Appointment
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {upcomingAppointments.map((app) => (
                            <div key={app.id} className="bg-white dark:bg-neutral-surface-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-all relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>

                                {/* Date Box */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full sm:w-20 bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{new Date(app.appointment_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{new Date(app.appointment_date).getDate()}</span>
                                    <span className="text-xs font-bold text-slate-400">{new Date(app.appointment_date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{app.type}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">{app.status === 'pending' ? 'Pending Confirmation' : 'Confirmed'}</p>
                                        </div>
                                        {app.status === 'pending' && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                            <span>{app.doctor?.full_name || 'Unassigned Doctor'} • {app.doctor?.specialty || 'General'}</span>
                                        </div>
                                        {app.notes && (
                                            <div className="flex items-start gap-2 text-slate-500 italic">
                                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                                <span>"{app.notes}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <section className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 opacity-75">
                        <Clock className="w-5 h-5 text-slate-500" />
                        Past Visits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                        {pastAppointments.map((app) => (
                            <div key={app.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300">{app.type}</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${app.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            app.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-slate-200 text-slate-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-1">{new Date(app.appointment_date).toLocaleDateString()}</p>
                                <p className="text-xs text-slate-400">{app.doctor?.full_name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
