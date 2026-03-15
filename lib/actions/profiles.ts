'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAvatarUrl(url: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ 
            avatar_url: url,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating avatar:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/patient/profile')
    revalidatePath('/patient/settings')
    revalidatePath('/doctor/settings')
    
    return { success: true }
}

export async function updateProfile(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/patient/profile')
    revalidatePath('/patient/settings')
    revalidatePath('/doctor/settings')

    return { success: true }
}
