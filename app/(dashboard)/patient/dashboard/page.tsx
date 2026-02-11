

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
import { createServiceRoleClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { Notifications } from '@/components/layout/Notifications'

export default async function PatientDashboard() {
    const { userId } = await auth()
    const supabase = await createServiceRoleClient()

    let profile = null
    if (userId) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
        profile = data
    }

    const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'there'

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                        Good Morning, {firstName}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>Wednesday, October 25th</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Notifications />
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
