'use server'

import { createClient } from '@/lib/supabase/server'

export async function saveMessage(content: string, role: 'user' | 'ai', sessionId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        await supabase.from('chats').insert({
            user_id: user.id,
            session_id: sessionId,
            sender: role,
            message: content
        })

    } catch (error) {
        console.error('Failed to save chat message:', error)
    }
}

export async function getChatMessages(sessionId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return []

        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (error) throw error

        return data.map(msg => ({
            id: msg.id,
            role: msg.sender as 'user' | 'ai',
            content: msg.message,
            created_at: msg.created_at
        }))

    } catch (error) {
        console.error('Failed to fetch chat messages:', error)
        return []
    }
}
