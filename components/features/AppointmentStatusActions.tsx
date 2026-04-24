'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateAppointmentStatus } from '@/lib/actions/appointments'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AppointmentStatusActionsProps {
    appointmentId: string;
    status: string;
}

export function AppointmentStatusActions({ appointmentId, status }: AppointmentStatusActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (newStatus: 'scheduled' | 'completed' | 'cancelled') => {
        setLoading(true)
        const res = await updateAppointmentStatus(appointmentId, newStatus)
        if (res.success) {
            toast.success(`Appointment marked as ${newStatus}`)
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    if (status === 'completed' || status === 'cancelled') {
        return null
    }

    return (
        <div className="flex items-center gap-2 mt-2">
            {status === 'pending' && (
                <>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-500 hover:text-red-600 h-8 px-2" 
                        onClick={() => handleUpdate('cancelled')}
                        disabled={loading}
                    >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                    </Button>
                    <Button 
                        size="sm" 
                        className="flex-1 h-8 px-2" 
                        onClick={() => handleUpdate('scheduled')}
                        disabled={loading}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                    </Button>
                </>
            )}
            {status === 'scheduled' && (
                <Button 
                    size="sm" 
                    className="w-full h-8" 
                    onClick={() => handleUpdate('completed')}
                    disabled={loading}
                >
                    Mark Completed
                </Button>
            )}
            {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
    )
}
