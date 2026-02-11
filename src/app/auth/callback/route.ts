import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (!sessionError) {
            // Check if user has a completed profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // Check specific table based on role
                    let isComplete = false;
                    if (profile.role === 'patient') {
                        const { data: patient } = await supabase.from('patients').select('id').eq('id', user.id).single();
                        // Assume if record exists and has basic data (e.g. dob) it's likely complete-ish. 
                        // For stricter check: check fields. For now, existence is a good proxy if we insert only on full form submit.
                        // However, our trigger inserts an empty row. So we should check a field like 'date_of_birth'.
                        const { data: pData } = await supabase.from('patients').select('date_of_birth').eq('id', user.id).single();
                        if (pData?.date_of_birth) isComplete = true;
                    } else if (profile.role === 'doctor') {
                        const { data: dData } = await supabase.from('doctors').select('specialization').eq('id', user.id).single();
                        if (dData?.specialization) isComplete = true;
                    }

                    if (!isComplete) {
                        return NextResponse.redirect(`${origin}/onboarding`);
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
