'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateUserRole(role: 'patient' | 'doctor') {
    const supabase = await createClient()
    // Force refresh of auth state
    await supabase.auth.refreshSession()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error("Auth Error in updateUserRole:", error)
        throw new Error('Not authenticated')
    }

    // 1. Update Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({
        data: { role }
    })

    if (authError) throw authError

    // 2. Update Profiles Table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id)

    if (profileError) throw profileError

    // 3. Handle specific table migration
    // Logic: verification of existing record prevents duplicates, delete from other table
    if (role === 'doctor') {
        // Add to doctors if not exists
        const { error: doctorError } = await supabase
            .from('doctors')
            .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

        // Remove from patients
        await supabase.from('patients').delete().eq('id', user.id)

        if (doctorError) throw doctorError

    } else {
        // Add to patients if not exists
        const { error: patientError } = await supabase
            .from('patients')
            .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })

        // Remove from doctors
        await supabase.from('doctors').delete().eq('id', user.id)

        if (patientError) throw patientError
    }

    revalidatePath('/', 'layout')

    if (role === 'doctor') {
        redirect('/doctor/dashboard')
    } else {
        redirect('/patient/dashboard')
    }
}
