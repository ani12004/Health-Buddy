'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Heart, Activity, Check, ArrowRight } from 'lucide-react'
import { updateUserRole } from '@/lib/actions/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@clerk/nextjs'

export default function OnboardingPage() {
    const { userId, isLoaded } = useAuth()
    const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && !userId) {
            toast.error('Please log in to continue.')
            router.push('/login')
        }
    }, [isLoaded, userId, router])

    if (!isLoaded || !userId) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
    }

    const handleNextStep = async () => {
        if (!selectedRole) {
            toast.error('Please select a role to continue.')
            return
        }

        setIsLoading(true)
        try {
            await updateUserRole(selectedRole)
            // If we reach here without redirect, something went wrong
            toast.error('Failed to update role. Please try again.')
            setIsLoading(false)
        } catch (error: any) {
            // Next.js redirect throws a special error that should not be caught
            // Check if this is a redirect error by looking for NEXT_REDIRECT
            if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
                // This is expected behavior - let it propagate
                throw error
            }
            // Only show error toast for actual errors
            toast.error('Failed to update role. Please try again.')
            console.error(error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 transition-colors duration-300">

            {/* Progress */}
            <div className="mb-12 flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-slate-200 dark:text-slate-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="text-primary transition-all duration-1000 ease-out" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.84" strokeDashoffset="117.2" strokeWidth="4"></circle>
                    </svg>
                    <span className="absolute text-sm font-bold text-primary">1/3</span>
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-1">Step 1: Role Selection</h2>
            </div>

            {/* Header */}
            <div className="text-center mb-10 max-w-lg mx-auto">
                <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white leading-tight">Welcome to Health Buddy</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">Let's personalize your AI experience. To get started, please tell us which role describes you best.</p>
            </div>

            {/* Cards */}
            <div className="w-full grid md:grid-cols-2 gap-6 mb-12 max-w-4xl">
                {/* Patient Card */}
                <label className="cursor-pointer group relative">
                    <input
                        type="radio"
                        name="role"
                        value="patient"
                        className="peer sr-only"
                        onChange={() => setSelectedRole('patient')}
                        checked={selectedRole === 'patient'}
                    />
                    <div className={cn(
                        "bg-white dark:bg-slate-800/50 border-2 border-transparent rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1",
                        selectedRole === 'patient' ? "border-primary bg-primary/5" : ""
                    )}>
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <Heart className="text-primary w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">I am a Patient</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            I'm looking for personalized health insights, symptom tracking, and daily care advice tailored to my needs.
                        </p>
                        <div className={cn(
                            "mt-auto opacity-0 transform scale-75 transition-all duration-300 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white",
                            selectedRole === 'patient' ? "opacity-100 scale-100" : ""
                        )}>
                            <Check className="w-5 h-5" />
                        </div>
                    </div>
                </label>

                {/* Doctor Card */}
                <label className="cursor-pointer group relative">
                    <input
                        type="radio"
                        name="role"
                        value="doctor"
                        className="peer sr-only"
                        onChange={() => setSelectedRole('doctor')}
                        checked={selectedRole === 'doctor'}
                    />
                    <div className={cn(
                        "bg-white dark:bg-slate-800/50 border-2 border-transparent rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1",
                        selectedRole === 'doctor' ? "border-primary bg-primary/5" : ""
                    )}>
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                            <Activity className="text-primary w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">I am a Doctor</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            I need advanced tools for patient management, clinical decision support, and AI-driven data analysis.
                        </p>
                        <div className={cn(
                            "mt-auto opacity-0 transform scale-75 transition-all duration-300 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white",
                            selectedRole === 'doctor' ? "opacity-100 scale-100" : ""
                        )}>
                            <Check className="w-5 h-5" />
                        </div>
                    </div>
                </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between w-full max-w-lg mx-auto">
                {/* <Button variant="ghost" onClick={() => router.back()}>Back</Button> */}
                <div className="w-full flex justify-center">
                    <Button
                        onClick={handleNextStep}
                        size="lg"
                        isLoading={isLoading}
                        className="group"
                    >
                        Next Step
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

        </div>
    )
}
