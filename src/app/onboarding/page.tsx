import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PatientForm } from '@/components/onboarding/patient-form';
import { DoctorForm } from '@/components/onboarding/doctor-form';
import { Sparkles } from 'lucide-react';

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    if (!profile) {
        // If no basic profile exists, something is wrong with auth trigger, or it's slow.
        // For now, let's assume it exists or redirect to login.
        return <div>Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-2xl">
                <div className="text-center mb-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Welcome to Health Buddy</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Let's set up your profile
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        We need a few more details to provide you with the best {profile.role === 'doctor' ? 'practice' : 'care'} experience.
                    </p>
                </div>

                <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/20 shadow-xl">
                    {profile.role === 'patient' ? (
                        <PatientForm userId={user.id} />
                    ) : (
                        <DoctorForm userId={user.id} />
                    )}
                </div>
            </div>
        </div>
    );
}
