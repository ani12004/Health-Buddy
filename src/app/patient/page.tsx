import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { AIInsightCard } from '@/components/dashboard/ai-insight-card';
import { MedicalReportCard } from '@/components/dashboard/medical-report-card';
import { HealthCheckupModal } from '@/components/dashboard/checkup-modal';
import { UserMenu } from '@/components/dashboard/user-menu';
import { Bell } from 'lucide-react';

export default function PatientDashboard() {
    const [isCheckupOpen, setIsCheckupOpen] = useState(false);
    const [name, setName] = useState('Patient');
    const supabase = createClient();

    useEffect(() => {
        async function fetchName() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (data?.full_name) setName(data.full_name.split(' ')[0]);
            }
        }
        fetchName();
    }, []);

    return (
        <div className="p-8 space-y-8 pb-32">
            <HealthCheckupModal isOpen={isCheckupOpen} onClose={() => setIsCheckupOpen(false)} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Good Morning, {name}</h1>
                    <p className="text-muted-foreground">Here is your daily health summary</p>
                </div>
                <UserMenu role="patient" />
            </div>

            {/* Doctor Updates Section */}
            <div className="glass p-4 rounded-2xl flex items-center gap-4 border-l-4 border-l-primary">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">New Note from Dr. Smith</h3>
                    <p className="text-xs text-muted-foreground">"Your latest vitals look great. Keep up the hydration."</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Health Checkup Card */}
                <div className="glass p-6 rounded-3xl space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        🩺
                    </div>
                    <h2 className="text-xl font-semibold">AI Checkup</h2>
                    <p className="text-sm text-muted-foreground">
                        Run a quick AI analysis of your current symptoms.
                    </p>
                    <button
                        onClick={() => setIsCheckupOpen(true)}
                        className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                        Start Checkup
                    </button>
                </div>

                {/* AI Insight Card */}
                <AIInsightCard />

                {/* Medical Report Card */}
                <MedicalReportCard />
            </div>
        </div>
    );
}
