import { createClient } from '@/lib/supabase/server'
import { Pill, Calendar, Clock, AlertCircle } from 'lucide-react'
import { Notifications } from '@/components/layout/Notifications'

export default async function MedicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please log in to view prescriptions.</div>
    }

    const { data: prescriptions, error } = await supabase
        .from('prescriptions')
        .select(`
            *,
            doctor:doctor_id(full_name, specialty)
        `)
        .eq('patient_id', user.id)
        .order('status', { ascending: true }) // Active first (assuming 'active' < 'completed' alphabetically? No, 'active' comes first)
        .order('end_date', { ascending: false })

    const activePrescriptions = prescriptions?.filter(p => p.status === 'active') || []
    const pastPrescriptions = prescriptions?.filter(p => p.status !== 'active') || []

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Prescriptions</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your medications and refills.</p>
                </div>
                <Notifications />
            </div>

            {/* Active Medications */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Active Medications
                </h3>

                {activePrescriptions.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-slate-500 dark:text-slate-400">No active prescriptions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePrescriptions.map((med) => (
                            <div key={med.id} className="group p-6 rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{med.medication_name}</h4>
                                    <p className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md inline-block mt-1">
                                        {med.dosage}
                                    </p>
                                </div>

                                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>{med.frequency}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <span>Started: {new Date(med.start_date).toLocaleDateString()}</span>
                                    </div>
                                    {med.doctor && (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-4 flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Prescribed by</span>
                                            <span className="text-xs font-bold">{med.doctor.full_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Past Medications */}
            {pastPrescriptions.length > 0 && (
                <section className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 text-slate-500">
                        <Clock className="w-5 h-5" />
                        History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                        {pastPrescriptions.map((med) => (
                            <div key={med.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700">
                                <div className="mb-2">
                                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">{med.medication_name}</h4>
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                        {med.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">{med.dosage}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
