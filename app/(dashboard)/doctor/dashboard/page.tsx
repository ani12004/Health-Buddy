

import { PatientList } from '@/components/features/PatientList'
import { CriticalAlerts } from '@/components/features/CriticalAlerts'
import { Users, UserPlus, Search, Activity, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function DoctorDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">Overview Dashboard</h1>
                    <p className="text-slate-500 text-sm">Welcome back, Dr. Smith</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <Button className="flex-shrink-0">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Patient
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Patients</h4>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Critical Alerts</h4>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Appointments</h4>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-neutral-surface-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg. Wait Time</h4>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">14m</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="lg:col-span-2 xl:col-span-3">
                    <PatientList />
                </div>
                <div className="lg:col-span-1 xl:col-span-1">
                    <CriticalAlerts />
                </div>
            </div>
        </div>
    )
}
