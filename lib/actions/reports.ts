'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientReports() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function shareReportWithDoctor(reportId: string, doctorId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    try {
        // Update report to include doctor_id
        const { error: updateError } = await supabase
            .from('reports')
            .update({ doctor_id: doctorId })
            .eq('id', reportId)
            .eq('patient_id', user.id)

        if (updateError) throw updateError

        // Create notification for the doctor
        const { data: patientProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        await supabase.from('notifications').insert({
            user_id: doctorId,
            message: `${patientProfile?.full_name || 'A patient'} has shared a health report with you.`,
            type: 'info'
        })

        revalidatePath('/doctor/dashboard')
        revalidatePath('/patient/medical-reports')
        
        return { success: true }
    } catch (error: any) {
        console.error('Error sharing report:', error)
        return { error: error.message || 'Failed to share report' }
    }
}

export async function getReportById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            patient:patient_id (full_name, email),
            doctor:doctor_id (full_name),
            assessment:assessment_id (*)
        `)
        .eq('id', id)
        .single()

    if (error) return { error: error.message }
    return { data }
}
