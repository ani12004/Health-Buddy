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

export async function getLatestCheckupResult() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Get latest report of type 'ai-checkup'
        const { data, error } = await supabase
            .from('reports')
            .select('content')
            .eq('patient_id', user.id)
            .eq('type', 'ai-checkup')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) return null
        
        // The ml_raw results are stored inside content
        return data.content?.ml_raw || null
    } catch (error) {
        console.error('Failed to fetch latest checkup result:', error)
        return null
    }
}
