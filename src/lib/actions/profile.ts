'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Efficiently fetches the full profile for a user, including role-specific data and settings.
 * avoiding 3 separate client-side calls.
 */
export async function getFullUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Parallel fetch for efficiency
    const [profileRes, settingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('*').eq('id', user.id).single()
    ]);

    if (profileRes.error) return null;

    const profile = profileRes.data;
    const settings = settingsRes.data;

    // Fetch role specific data
    let roleData = null;
    if (profile.role === 'patient') {
        const { data } = await supabase.from('patients').select('*').eq('id', user.id).single();
        roleData = data;
    } else if (profile.role === 'doctor') {
        const { data } = await supabase.from('doctors').select('*').eq('id', user.id).single();
        roleData = data;
    }

    return {
        user,
        profile,
        roleData,
        settings
    };
}

/**
 * Updates patient profile fields.
 */
/**
 * Updates patient profile fields.
 */
export async function updatePatientProfile(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Separate profile (global) and patient (specific) data
    const { first_name, last_name, ...patientData } = formData;
    const full_name = `${first_name} ${last_name}`.trim();

    // Update Patient Table
    const { error: patientError } = await supabase.from('patients').update({
        ...patientData,
        first_name,
        last_name,
        name: full_name // Keep for backward compat
    }).eq('id', user.id);

    if (patientError) throw patientError;

    // Update Global Profile Table
    if (first_name || last_name) {
        const { error: profileError } = await supabase.from('profiles').update({
            first_name,
            last_name,
            full_name
        }).eq('id', user.id);
        if (profileError) throw profileError;
    }

    revalidatePath('/patient/profile');
    return { success: true };
}

/**
 * Updates doctor profile fields.
 */
export async function updateDoctorProfile(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { first_name, last_name, ...doctorData } = formData;
    const full_name = `${first_name} ${last_name}`.trim();

    // Update Doctor Table
    const { error: doctorError } = await supabase.from('doctors').update({
        ...doctorData,
        first_name,
        last_name,
        name: full_name
    }).eq('id', user.id);

    if (doctorError) throw doctorError;

    // Update Global Profile Table
    if (first_name || last_name) {
        const { error: profileError } = await supabase.from('profiles').update({
            first_name,
            last_name,
            full_name
        }).eq('id', user.id);
        if (profileError) throw profileError;
    }

    revalidatePath('/doctor/profile');
    return { success: true };
}

/**
 * Updates user settings.
 */
export async function updateUserSettings(settings: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('user_settings').upsert({ id: user.id, ...settings });
    if (error) throw error;

    revalidatePath('/patient/settings');
    revalidatePath('/doctor/settings');
    return { success: true };
}
