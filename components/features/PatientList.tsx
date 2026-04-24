'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, MessageSquare, FileText, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DirectMessageModal } from './DirectMessageModal'

export function PatientList() {
    const supabase = createClient()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        fetchPatients()
    }, [])

    async function fetchPatients() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                email,
                patients (
                    dob,
                    conditions,
                    blood_type
                ),
                reports!reports_patient_id_fkey (
                    id,
                    severity,
                    created_at,
                    doctor_id
                )
            `)
            .eq('role', 'patient')
            .limit(10)

        if (error) {
            console.error("Error fetching patients:", error)
        } else {
            const formatted = data?.map(p => {
                const patientData = p.patients && Array.isArray(p.patients) ? p.patients[0] : p.patients;
                const reports = ((p.reports as any[]) || []).slice().sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                const latestReport = reports[0]
                const hasCritical = reports.some(r => r.severity === 'critical')
                const hasAnyReport = reports.length > 0

                let lastVisit = 'No visits yet'
                if (latestReport?.created_at) {
                    const createdAt = new Date(latestReport.created_at)
                    const now = new Date()
                    const diffMs = now.getTime() - createdAt.getTime()
                    const dayMs = 24 * 60 * 60 * 1000
                    const days = Math.floor(diffMs / dayMs)

                    if (days <= 0) lastVisit = 'Today'
                    else if (days === 1) lastVisit = 'Yesterday'
                    else if (days < 7) lastVisit = `${days} days ago`
                    else lastVisit = createdAt.toLocaleDateString()
                }

                return {
                    id: p.id,
                    name: p.full_name || 'Unknown',
                    age: patientData?.dob ? new Date().getFullYear() - new Date(patientData.dob).getFullYear() : 'N/A',
                    condition: patientData?.conditions?.[0] || 'Checkup pending',
                    status: hasCritical ? 'Critical' : hasAnyReport ? 'Stable' : 'Pending',
                    lastVisit
                }
            }) || []
            setPatients(formatted)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Patients</h3>
                    <Link href="/doctor/patients">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Condition</th>
                                <th className="px-6 py-4">Last Visit</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.name}</p>
                                                    <p className="text-xs text-slate-500">{patient.age} yrs</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                patient.status === 'Stable' ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30" :
                                                    patient.status === 'Critical' ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" :
                                                        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30"
                                            )}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">{patient.condition}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{patient.lastVisit}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setSelectedPatient({ id: patient.id, name: patient.name })}
                                                    className="p-2 text-slate-400 hover:text-primary transition-colors" 
                                                    title="Send Message"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <Link href={`/doctor/patients/${patient.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors" title="View Profile">
                                                    <User className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/doctor/patients/${patient.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors" title="View Reports">
                                                    <FileText className="w-4 h-4" />
                                                </Link>
                                                <button className="p-2 text-slate-400 hover:text-primary transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedPatient && (
                <DirectMessageModal
                    isOpen={!!selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                    receiverId={selectedPatient.id}
                    receiverName={selectedPatient.name}
                />
            )}
        </>
    )
}
    )
}
