import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { 
    User, 
    Calendar, 
    Pill, 
    FileText, 
    Activity, 
    Clock, 
    ArrowLeft, 
    Plus,
    Phone,
    Mail,
    MapPin,
    HeartPulse,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { DoctorActions } from '@/components/features/DoctorActions'
import { AppointmentStatusActions } from '@/components/features/AppointmentStatusActions'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface PatientDetailProps {
    params: Promise<{
        id: string
    }>
}

export default async function PatientDetailPage({ params }: PatientDetailProps) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch profile first; do not fail the whole page if optional relations are missing.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (profileError || !profile) {
        return notFound()
    }

    // Patient row can be absent for legacy users; handle gracefully instead of 404.
    const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle()

    // Fetch medical history (reports)
    const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })

    // Fetch prescriptions
    const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false })

    // Fetch upcoming appointments for THIS doctor
    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id)
        .eq('doctor_id', user.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })

    const age = patientData?.dob ? new Date().getFullYear() - new Date(patientData.dob).getFullYear() : 'N/A'

    return (
        <div className="space-y-8 pb-12">
            {/* Back Button & Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href="/doctor/patients" 
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Patient List
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-4 border-white dark:border-neutral-surface-dark shadow-xl">
                            {profile.full_name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{profile.full_name}</h1>
                            <div className="flex items-center gap-3 mt-1 text-slate-500">
                                <span className="font-medium">{age} years • {patientData?.blood_type || 'Unknown Type'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">Stable</span>
                            </div>
                        </div>
                    </div>
                    <DoctorActions 
                        patientId={profile.id} 
                        patientName={profile.full_name || 'Patient'} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Vitals */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Height</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{patientData?.height || '--'}</p>
                        </Card>
                        <Card className="p-4 border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Weight</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{patientData?.weight || '--'}</p>
                        </Card>
                        <Card className="p-4 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
                            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Blood Type</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{patientData?.blood_type || '--'}</p>
                        </Card>
                        <Card className="p-4 border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10">
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Age</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{age}</p>
                        </Card>
                    </div>

                    {/* Medical Reports */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Medical History & AI Checkups
                            </h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="grid gap-4">
                            {reports?.length === 0 ? (
                                <p className="p-8 text-center text-slate-500 bg-white dark:bg-neutral-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">No medical reports found.</p>
                            ) : (
                                reports?.slice(0, 3).map((report) => (
                                    <div key={report.id} className="p-4 bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{report.title}</p>
                                                <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleDateString()} • AI Generated</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                                report.severity === 'critical' ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                            )}>
                                                {report.severity}
                                            </div>
                                            <a 
                                                href={`/api/reports/${report.id}/pdf`} 
                                                target="_blank"
                                                className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileText className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Prescriptions */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Pill className="w-5 h-5 text-primary" />
                                Current Medications
                            </h3>
                            <Button size="sm" variant="outline">Schedule Refill</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {prescriptions?.length === 0 ? (
                                <p className="col-span-full p-8 text-center text-slate-500 bg-white dark:bg-neutral-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">No active prescriptions.</p>
                            ) : (
                                prescriptions?.map((med) => (
                                    <div key={med.id} className="p-5 bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-900 dark:text-white">{med.medication_name}</h4>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 uppercase tracking-widest">{med.status}</span>
                                        </div>
                                        <div className="space-y-1 text-sm text-slate-500">
                                            <p>{med.dosage} • {med.frequency}</p>
                                            <p className="text-xs text-slate-400 italic">Started: {new Date(med.start_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Contact, Insurance & Schedule */}
                <div className="space-y-8">
                    {/* Contact Info */}
                    <Card className="p-6 space-y-6">
                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            Contact Information
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Phone Number</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Email Address</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile.email}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Insurance Card */}
                    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <Shield className="w-8 h-8 text-primary" />
                                <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-1 rounded uppercase tracking-[0.2em]">Verified Provider</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Insurance Provider</p>
                                <p className="text-lg font-bold">{patientData?.insurance_provider || 'Self-Insured'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Member ID</p>
                                    <p className="text-sm font-mono tracking-wider">{patientData?.insurance_member_id || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Plan ID</p>
                                    <p className="text-sm font-mono uppercase">{patientData?.insurance_plan || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Appointments Schedule */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Schedule
                            </h4>
                            <Plus className="w-4 h-4 text-primary cursor-pointer" />
                        </div>
                        <div className="space-y-4">
                            {appointments?.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No upcoming appointments.</p>
                            ) : (
                                appointments?.map((app) => (
                                    <div key={app.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-10 text-xs shrink-0 border-r border-slate-200 dark:border-slate-700 pr-3">
                                                <span className="font-bold text-slate-900 dark:text-white">{new Date(app.appointment_date).getDate()}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{new Date(app.appointment_date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{app.type}</p>
                                                    <span className={cn(
                                                        "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                                        app.status === 'pending' ? "bg-amber-50 text-amber-600" :
                                                        app.status === 'scheduled' ? "bg-emerald-50 text-emerald-600" :
                                                        "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500">{new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <AppointmentStatusActions appointmentId={app.id} status={app.status} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
