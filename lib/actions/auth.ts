'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function syncUser() {
    // With Supabase and the DB trigger handle_new_user, 
    // the profile is created automatically on signup.
    // This function can just fetch the current role if needed, or we just rely on session data.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const role = user.user_metadata?.role || 'patient'
    return { success: true, role }
}

export async function updateUserRole(role: 'patient' | 'doctor') {
    // Now that we have role selection on registration, we don't need a separate onboarding.
    // However, if we ever needed to update it:
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase.auth.updateUser({
        data: { role: role }
    })

    if (error) {
        throw new Error(`Failed to update user role: ${error.message}`)
    }

    // You would also need to update the profile table here manually using service role 
    // since the trigger only runs on INSERT.
    
    const dest = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
    redirect(dest)
}
