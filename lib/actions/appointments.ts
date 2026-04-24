'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(data: {
    patient_id?: string;
    doctor_id: string;
    appointment_date: string;
    type: string;
    notes?: string;
}) {
    const supabase = await createClient()
    const adminSupabase = await createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get initiator role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isDoctor = profile?.role === 'doctor'

    try {
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: isDoctor ? data.patient_id : user.id,
                doctor_id: isDoctor ? user.id : data.doctor_id,
                appointment_date: data.appointment_date,
                type: data.type,
                notes: data.notes,
                status: isDoctor ? 'scheduled' : 'pending'
            })
            .select()
            .single()

        if (error) throw error

        // Notification target
        const notificationTarget = isDoctor ? (data.patient_id as string) : data.doctor_id
        const message = isDoctor 
            ? `A new appointment has been scheduled for you: ${data.type}`
            : `New appointment request for ${data.type}`

        await adminSupabase.from('notifications').insert({
            user_id: notificationTarget,
            message,
            type: 'info'
        })

        revalidatePath('/patient/appointments')
        revalidatePath('/doctor/dashboard')
        revalidatePath('/doctor/appointments')
        
        return { success: true, data: appointment }
    } catch (error: any) {
        console.error('Error creating appointment:', error)
        return { error: error.message || 'Failed to create appointment' }
    }
}

export async function updateAppointmentStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
    const supabase = await createClient()
    const adminSupabase = await createServiceRoleClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    try {
        const { data: appointment, error } = await supabase
            .from('appointments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, patient_id')
            .single()

        if (error) throw error

        // Notify patient
        await adminSupabase.from('notifications').insert({
            user_id: appointment.patient_id,
            message: `Your appointment status has been updated to ${status}`,
            type: status === 'cancelled' ? 'alert' : 'success'
        })

        revalidatePath('/patient/appointments')
        revalidatePath('/doctor/dashboard')

        return { success: true }
    } catch (error: any) {
        console.error('Error updating appointment:', error)
        return { error: error.message || 'Failed to update appointment' }
    }
}
