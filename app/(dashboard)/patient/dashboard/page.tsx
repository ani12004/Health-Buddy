

import { SymptomChecker } from '@/components/features/SymptomChecker'
import { VitalCard } from '@/components/features/VitalCard'
import { DailyTipCard, RecentReportsList } from '@/components/features/DashboardWidgets'
import {
    Heart,
    Activity,
    Droplet,
    Thermometer,
    Calendar,
    Bell
} from 'lucide-react'
// import { useUser } from '@/hooks/useUser'
// We are in a dashboard layout, user is guaranteed. We can fetch specific patient data here.

export default function PatientDashboard() {

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                        Good Morning
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>Wednesday, October 25th</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-3 rounded-full bg-white dark:bg-neutral-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/30 transition-all shadow-sm relative">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-surface-dark"></span>
                    </button>
                </div>
            </header>

            {/* Top Grid: Hero & Tip */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SymptomChecker />
                <DailyTipCard />
            </div>

            {/* Dashboard Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Reports (Left 8 cols) */}
                <div className="lg:col-span-8">
                    <RecentReportsList />
                </div>

                {/* Side Widgets (Right 4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Vitals Quick View */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            My Vitals
                            <span className="text-xs font-normal text-slate-400">Last updated: 10m ago</span>
                        </h3>
                        <div className="space-y-3">
                            <VitalCard
                                label="Heart Rate"
                                value="72"
                                unit="bpm"
                                icon={Heart}
                                color="red" // Using Tailwind color names logic in VitalCard
                            />
                            <VitalCard
                                label="Blood Pressure"
                                value="118/75"
                                unit="mmHg"
                                icon={Activity}
                                color="blue"
                            />
                            <VitalCard
                                label="Glucose"
                                value="95"
                                unit="mg/dL"
                                icon={Droplet}
                                color="purple"
                            />
                            <VitalCard
                                label="Temperature"
                                value="98.6"
                                unit="°F"
                                icon={Thermometer}
                                color="orange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
