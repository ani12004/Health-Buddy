'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pill, Calendar, Clock, Loader2 } from 'lucide-react'
import { issuePrescription } from '@/lib/actions/medications'
import { createAppointment } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DoctorActionsProps {
    patientId: string;
    patientName: string;
}

export function DoctorActions({ patientId, patientName }: DoctorActionsProps) {
    const router = useRouter()
    const [activeModal, setActiveModal] = useState<'prescription' | 'appointment' | null>(null)
    const [loading, setLoading] = useState(false)

    // Prescription Form
    const [prescData, setPrescData] = useState({
        medication_name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    })

    // Appointment Form
    const [appData, setAppData] = useState({
        type: '',
        date: '',
        time: '',
        notes: ''
    })

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await issuePrescription({
            patient_id: patientId,
            ...prescData
        })
        if (res.success) {
            toast.success(`Prescription issued for ${patientName}`)
            setActiveModal(null)
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    const handleAppointmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const appointment_date = `${appData.date}T${appData.time}:00Z`
        const res = await createAppointment({
            patient_id: patientId,
            doctor_id: '', // Action uses current user id if they are a doctor
            appointment_date,
            type: appData.type,
            notes: appData.notes
        })
        
        if (res.success) {
            toast.success(`Appointment scheduled for ${patientName}`)
            setActiveModal(null)
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <>
            <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setActiveModal('appointment')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                </Button>
                <Button className="flex-1 md:flex-none" onClick={() => setActiveModal('prescription')}>
                    <Pill className="w-4 h-4 mr-2" />
                    Prescribe
                </Button>
            </div>

            {/* Prescription Modal */}
            <Modal
                isOpen={activeModal === 'prescription'}
                onClose={() => setActiveModal(null)}
                title={`New Prescription for ${patientName}`}
            >
                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Medication Name</label>
                        <Input required value={prescData.medication_name} onChange={e => setPrescData({...prescData, medication_name: e.target.value})} placeholder="e.g. Amoxicillin" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Dosage</label>
                            <Input required value={prescData.dosage} onChange={e => setPrescData({...prescData, dosage: e.target.value})} placeholder="500mg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Frequency</label>
                            <Input required value={prescData.frequency} onChange={e => setPrescData({...prescData, frequency: e.target.value})} placeholder="Twice daily" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Start Date</label>
                            <Input type="date" required value={prescData.start_date} onChange={e => setPrescData({...prescData, start_date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">End Date (Optional)</label>
                            <Input type="date" value={prescData.end_date} onChange={e => setPrescData({...prescData, end_date: e.target.value})} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Issue Prescription'}
                    </Button>
                </form>
            </Modal>

            {/* Appointment Modal */}
            <Modal
                isOpen={activeModal === 'appointment'}
                onClose={() => setActiveModal(null)}
                title={`Schedule Follow-up: ${patientName}`}
            >
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Visit Type</label>
                        <Input required value={appData.type} onChange={e => setAppData({...appData, type: e.target.value})} placeholder="e.g. Lab Results Review" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Date</label>
                            <Input type="date" required value={appData.date} onChange={e => setAppData({...appData, date: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold">Time</label>
                            <Input type="time" required value={appData.time} onChange={e => setAppData({...appData, time: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Clinical Notes</label>
                        <textarea 
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent min-h-[100px]" 
                            placeholder="Reason for follow-up..."
                            value={appData.notes}
                            onChange={e => setAppData({...appData, notes: e.target.value})}
                        />
                    </div>
                    <Button type="submit" className="w-full h-12" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Schedule Appointment'}
                    </Button>
                </form>
            </Modal>
        </>
    )
}
