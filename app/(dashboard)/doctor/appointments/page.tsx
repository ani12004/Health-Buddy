import { DoctorAppointmentsList } from '@/components/features/DoctorAppointmentsList'
import { Notifications } from '@/components/layout/Notifications'
import { Calendar } from 'lucide-react'

export default function DoctorAppointmentsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Appointments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your schedule and patient visits.</p>
                </div>
                <Notifications />
            </div>

            <DoctorAppointmentsList />
        </div>
    )
}
