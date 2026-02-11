'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function syncUser() {
    const { userId } = await auth()
    if (!userId) return null

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    const role = user.publicMetadata.role as string || 'patient'

    const supabase = await createServiceRoleClient()

    // Sync Profile
    await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

    return { success: true, role }
}

export async function updateUserRole(role: 'patient' | 'doctor') {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('Not authenticated')
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'

    const supabase = await createServiceRoleClient()

    // 1. Update Clerk Auth Metadata
    await client.users.updateUser(userId, {
        publicMetadata: { role }
    })

    // 2. Ensure Profile Exists in Supabase (Sync Clerk User to Supabase Profile)
    // We use the Clerk/User ID as the Profile ID
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

    if (profileError) {
        console.error('Profile Sync Error:', profileError)
        throw new Error('Failed to sync profile')
    }

    // 3. Handle specific table migration
    if (role === 'doctor') {
        // Add to doctors
        const { error: doctorError } = await supabase
            .from('doctors')
            .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

        // Remove from patients
        await supabase.from('patients').delete().eq('id', userId)

        if (doctorError) throw doctorError

    } else {
        // Add to patients
        const { error: patientError } = await supabase
            .from('patients')
            .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

        // Remove from doctors
        await supabase.from('doctors').delete().eq('id', userId)

        if (patientError) throw patientError
    }

    revalidatePath('/', 'layout')

    if (role === 'doctor') {
        redirect('/doctor/dashboard')
    } else {
        redirect('/patient/dashboard')
    }
}
