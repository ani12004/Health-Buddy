'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDoctors() {
    const supabase = await createClient()
    
    // Fetch profiles that have the role 'doctor' join with doctor details
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            avatar_url,
            doctors (
                specialty,
                hospital_affiliation
            )
        `)
        .eq('role', 'doctor')

    if (error) {
        console.error('Error fetching doctors:', error)
        return { error: 'Failed to load doctors' }
    }

    return { data }
}
