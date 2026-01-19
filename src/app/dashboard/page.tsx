import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Ideally we would fetch the user's role from a 'profiles' table here.
    // For now, we'll assume everyone is a patient or check metadata.
    const role = user.user_metadata.role || 'patient';

    if (role === 'doctor') {
        redirect('/doctor');
    } else {
        redirect('/patient');
    }
}
