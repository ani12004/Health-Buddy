'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function issuePrescription(data: {
    patient_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    start_date: string;
    end_date?: string;
}) {
    const supabase = await createClient()
    const adminSupabase = await createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    try {
        const { error } = await supabase
            .from('prescriptions')
            .insert({
                patient_id: data.patient_id,
                doctor_id: user.id,
                medication_name: data.medication_name,
                dosage: data.dosage,
                frequency: data.frequency,
                start_date: data.start_date,
                end_date: data.end_date,
                status: 'active'
            })

        if (error) throw error

        // Notify patient
        await adminSupabase.from('notifications').insert({
            user_id: data.patient_id,
            message: `New prescription issued: ${data.medication_name}`,
            type: 'success'
        })

        revalidatePath('/patient/medications')
        revalidatePath('/doctor/dashboard')
        revalidatePath(`/doctor/patients/${data.patient_id}`)

        return { success: true }
    } catch (error: any) {
        console.error('Error issuing prescription:', error)
        return { error: error.message || 'Failed to issue prescription' }
    }
}

export async function updatePrescriptionStatus(id: string, status: 'completed' | 'discontinued') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    try {
        const { error } = await supabase
            .from('prescriptions')
            .update({ status })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/patient/medications')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating prescription:', error)
        return { error: error.message || 'Failed to update prescription' }
    }
}
