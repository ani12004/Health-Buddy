'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(receiverId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    // Fetch sender name for notification
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const { error } = await supabase
        .from('messages')
        .insert({
            sender_id: user.id,
            receiver_id: receiverId,
            content
        })

    if (error) {
        console.error('Error sending message:', error)
        return { success: false, error: error.message }
    }

    // Create notification for receiver (async, don't wait to speed up response)
    supabase.from('notifications').insert({
        user_id: receiverId,
        message: `New message from ${profile?.full_name || 'Health Buddy Contact'}`,
        type: 'info'
    }).then(({ error: nError }) => {
        if (nError) console.error('Failed to create notification:', nError)
    })

    revalidatePath('/messages')
    revalidatePath('/doctor/dashboard')
    
    return { success: true }
}

export async function getConversation(otherId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching conversation:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function markAsRead(messageId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('receiver_id', user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
}
