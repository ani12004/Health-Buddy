'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveMessage(content: string, role: 'user' | 'ai', sessionId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // Insert using the authenticated user's client (RLS will automatically restrict)
        await supabase.from('chats').insert({
            user_id: user.id,
            session_id: sessionId,
            sender: role,
            message: content
        })

    } catch (error) {
        console.error('Failed to save chat message:', error)
        // We don't throw here to avoid breaking the chat flow if saving fails
    }
}
