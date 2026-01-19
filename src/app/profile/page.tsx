import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role === 'doctor') {
        redirect('/doctor/profile');
    } else {
        redirect('/patient/profile');
    }
}
