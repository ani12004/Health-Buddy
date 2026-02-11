'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function saveMessage(content: string, role: 'user' | 'ai', sessionId: string) {
    try {
        const { userId } = await auth()
        if (!userId) return

        const supabase = await createServiceRoleClient()

        await supabase.from('chats').insert({
            user_id: userId,
            session_id: sessionId,
            sender: role,
            message: content
        })

    } catch (error) {
        console.error('Failed to save chat message:', error)
        // We don't throw here to avoid breaking the chat flow if saving fails
    }
}
