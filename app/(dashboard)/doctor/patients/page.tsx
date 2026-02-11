import { PatientList } from '@/components/features/PatientList'

export default function PatientsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Patients</h1>
            <PatientList />
        </div>
    )
}
