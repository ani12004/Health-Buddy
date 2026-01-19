import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DoctorForm } from '@/components/onboarding/doctor-form';

export default async function DoctorProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'doctor') redirect('/dashboard');

    const { data: doctorData } = await supabase.from('doctors').select('*').eq('id', user.id).single();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Doctor Profile</h1>
            <div className="glass-card p-8 rounded-3xl border border-border">
                <DoctorForm userId={user.id} initialData={doctorData} />
            </div>
        </div>
    );
}
