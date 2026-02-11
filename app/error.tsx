'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                An unexpected error occurred. Our team has been notified.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => { if (typeof window !== 'undefined') window.location.href = '/' }} variant="outline">
                    Go Home
                </Button>
                <Button onClick={() => reset()}>
                    Try Again
                </Button>
            </div>
        </div>
    )
}
