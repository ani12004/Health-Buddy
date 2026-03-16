'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMLFeedback(data: {
    assessment_id: string;
    rating: number;
    comment: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('ml_feedback')
            .insert({
                assessment_id: data.assessment_id,
                patient_id: user.id,
                rating: data.rating,
                comment: data.comment
            })

        if (error) {
            // If table doesn't exist, we might need a fallback or silent failure 
            // but for now we expect table to be created
            console.error('Feedback Error:', error)
            return { error: 'Failed to submit feedback. Database might be updating.' }
        }

        revalidatePath('/patient/assessment')
        return { success: true }
    } catch (e) {
        console.error('Feedback Error:', e)
        return { error: 'An unexpected error occurred.' }
    }
}
