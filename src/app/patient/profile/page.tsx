import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PatientForm } from '@/components/onboarding/patient-form';

export default async function PatientProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'patient') redirect('/dashboard');

    // Fetch existing data to pre-fill (The form component will need updating to accept initialData if we want perfection, 
    // but the current form component manages its own state. 
    // Ideally, we pass the data to the form. 
    // For this iteration, I will reuse the PatientForm but we might need to update it to fetch data or accept props.)

    // Actually, the PatientForm currently initializes with empty state. 
    // I should update PatientForm to fetch data on mount or accept it as specific props.
    // Let's pass the data if possible.

    const { data: patientData } = await supabase.from('patients').select('*').eq('id', user.id).single();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <div className="glass-card p-8 rounded-3xl border border-border">
                {/* To make this truly editing, we need to pass initial data. 
                    I'll update the form component next to accept 'initialData'. */}
                <PatientForm userId={user.id} initialData={patientData} />
            </div>
        </div>
    );
}
