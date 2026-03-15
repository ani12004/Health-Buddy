'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) return { error: error.message }
    return { data }
}

export async function markNotificationAsRead(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/')
    return { success: true }
}

export async function createNotification(userId: string, message: string, type: 'info' | 'alert' | 'success' = 'info') {
    const supabase = await createClient()
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            message,
            type
        })

    if (error) return { error: error.message }
    return { success: true }
}
