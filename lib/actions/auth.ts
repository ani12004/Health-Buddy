'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function syncUser() {
    console.log('[DEBUG] syncUser started')
    const { userId } = await auth()
    if (!userId) {
        console.log('[DEBUG] syncUser: No userId')
        return null
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email = user.emailAddresses[0]?.emailAddress
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    const role = user.publicMetadata.role as string || 'patient'

    const supabase = await createServiceRoleClient()

    // Sync Profile
    console.log('[DEBUG] syncUser: Upserting profile')
    await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: fullName,
        role: role,
        updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

    console.log('[DEBUG] syncUser: Finished')
    return { success: true, role }
}

export async function updateUserRole(role: 'patient' | 'doctor') {
    const { userId } = await auth()
    console.log('[DEBUG] 1. updateUserRole started:', { userId, role })

    if (!userId) {
        console.error('[DEBUG] 1. ERROR: No userId found')
        throw new Error('Not authenticated')
    }

    let success = false
    try {
        console.log('[DEBUG] 2. Getting clerkClient...')
        const client = await clerkClient()

        console.log('[DEBUG] 3. Fetching user info from Clerk...')
        const user = await client.users.getUser(userId)
        console.log('[DEBUG] 4. User info fetched:', user.emailAddresses[0]?.emailAddress)

        const email = user.emailAddresses[0]?.emailAddress
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'

        console.log('[DEBUG] 5. Creating Supabase service client...')
        const supabase = await createServiceRoleClient()

        // 1. Update Clerk Auth Metadata
        console.log('[DEBUG] 6. Updating Clerk publicMetadata...')
        await client.users.updateUser(userId, {
            publicMetadata: { role }
        })
        console.log('[DEBUG] 7. Clerk metadata update SUCCESS')

        // 2. Ensure Profile Exists in Supabase
        console.log('[DEBUG] 8. Attempting Supabase upsert for profile...')
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
            console.error('[DEBUG] 9. Supabase Upsert ERROR:', profileError.message)
            throw new Error(`Failed to sync profile: ${profileError.message}`)
        }
        console.log('[DEBUG] 10. Supabase upsert SUCCESS')

        // 3. Handle specific table migration
        if (role === 'doctor') {
            console.log('[DEBUG] 11. Upserting into doctors table...')
            const { error: doctorError } = await supabase
                .from('doctors')
                .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

            if (doctorError) {
                console.error('[DEBUG] 12. Doctors table ERROR:', doctorError.message)
                throw doctorError
            }
            console.log('[DEBUG] 13. Deleting from patients table if exists...')
            await supabase.from('patients').delete().eq('id', userId)

        } else {
            console.log('[DEBUG] 11. Upserting into patients table...')
            const { error: patientError } = await supabase
                .from('patients')
                .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true })

            if (patientError) {
                console.error('[DEBUG] 12. Patients table ERROR:', patientError.message)
                throw patientError
            }
            console.log('[DEBUG] 13. Deleting from doctors table if exists...')
            await supabase.from('doctors').delete().eq('id', userId)
        }

        console.log('[DEBUG] 14. Skipping revalidatePath (for now)')
        // revalidatePath('/', 'layout')

        success = true
        console.log('[DEBUG] 15. Marked as success')

    } catch (error: any) {
        console.error('[DEBUG] CATCH BLOCK:', error)
        throw error
    }

    if (success) {
        const dest = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
        console.log('[DEBUG] FINAL: Redirecting to', dest)
        redirect(dest)
    }
}
