'use client'

import { useState, useEffect } from 'react'
import { Phone, Save, X, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfile } from '@/lib/actions/profiles'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface PhoneVerificationPopupProps {
    currentPhone: string | null | undefined
}

export function PhoneVerificationPopup({ currentPhone }: PhoneVerificationPopupProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        // Only show if phone is missing and not dismissed in this session
        if (!currentPhone && !dismissed) {
            const timer = setTimeout(() => setIsOpen(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [currentPhone, dismissed])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number')
            return
        }

        setLoading(true)
        try {
            const res = await updateProfile({ phone })
            if (res.success) {
                toast.success('Phone number updated successfully')
                setIsOpen(false)
                // We don't need to set dismissed here as the parent will re-render with the new phone
            } else {
                toast.error(res.error || 'Failed to update phone number')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" />
            
            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-surface-dark rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <Phone className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Information Required</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Please provide your phone number to ensure patients can reach you for urgent consultations and appointment updates.
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button type="submit" disabled={loading} className="h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Save & Continue
                            </Button>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false)
                                    setDismissed(true)
                                }}
                                className="h-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold transition-colors"
                            >
                                Remind Me Later
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                            Mandatory for all medical professionals to maintain an active contact line on Health Buddy 2.0.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
