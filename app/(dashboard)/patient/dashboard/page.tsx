import { SymptomChecker } from '@/components/features/SymptomChecker'
import { VitalCard } from '@/components/features/VitalCard'
import { DailyTipCard, RecentReportsList, UpcomingAppointments } from '@/components/features/DashboardWidgets'
import {
    Heart,
    Activity,
    Droplet,
    Thermometer,
    Calendar,
    Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Notifications } from '@/components/layout/Notifications'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function PatientDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let profile = null
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    profile = data

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

                <div className="flex items-center gap-3">
                    <Link href="/patient/health-update">
                        <Button variant="outline" className="hidden sm:flex rounded-xl">
                            <Activity className="w-4 h-4 mr-2" />
                            Daily Update
                        </Button>
                    </Link>
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
                    <UpcomingAppointments />
                    
                    {/* Vitals Quick View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                My Vitals
                            </h3>
                            <Link href="/patient/ai-checkup" className="text-xs font-bold text-primary hover:underline">Update</Link>
                        </div>
                        <Link href="/patient/ai-checkup" className="block space-y-3 group">
                            <VitalCard
                                label="Heart Rate"
                                value="72"
                                unit="bpm"
                                icon={Heart}
                                color="red"
                                className="group-hover:border-red-500/30 transition-all"
                            />
                            <VitalCard
                                label="Blood Pressure"
                                value="118/75"
                                unit="mmHg"
                                icon={Activity}
                                color="blue"
                                className="group-hover:border-blue-500/30 transition-all"
                            />
                            <VitalCard
                                label="Glucose"
                                value="95"
                                unit="mg/dL"
                                icon={Droplet}
                                color="purple"
                                className="group-hover:border-purple-500/30 transition-all"
                            />
                            <VitalCard
                                label="Temperature"
                                value="98.6"
                                unit="°F"
                                icon={Thermometer}
                                color="orange"
                                className="group-hover:border-orange-500/30 transition-all"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
