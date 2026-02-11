'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notifications } from '@/components/layout/Notifications'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Phone, Ruler, Weight, Shield, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        dob: '',
        blood_type: '',
        height: '',
        weight: '',
        insurance_provider: '',
        insurance_member_id: '',
        insurance_plan: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Fetch patient details
        const { data: patient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile && patient) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                dob: patient.dob || '',
                blood_type: patient.blood_type || '',
                height: patient.height || '',
                weight: patient.weight || '',
                insurance_provider: patient.insurance_provider || '',
                insurance_member_id: patient.insurance_member_id || '',
                insurance_plan: patient.insurance_plan || ''
            })
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone
                })
                .eq('id', user.id)

            if (profileError) throw profileError

            // Update Patient
            const { error: patientError } = await supabase
                .from('patients')
                .update({
                    dob: formData.dob || null,
                    blood_type: formData.blood_type,
                    height: formData.height,
                    weight: formData.weight,
                    insurance_provider: formData.insurance_provider,
                    insurance_member_id: formData.insurance_member_id,
                    insurance_plan: formData.insurance_plan
                })
                .eq('id', user.id)

            if (patientError) throw patientError

            toast.success('Profile updated successfully')
            router.refresh()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Update your personal information and preferences.</p>
                </div>
                <Notifications />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-10" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                            <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Blood Type</label>
                            <select
                                name="blood_type"
                                value={formData.blood_type}
                                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Select...</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Height</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input name="height" value={formData.height} onChange={handleChange} className="pl-10" placeholder="e.g. 175cm / 5'9''" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight</label>
                            <div className="relative">
                                <Weight className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input name="weight" value={formData.weight} onChange={handleChange} className="pl-10" placeholder="e.g. 70kg / 154lbs" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Insurance Information */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Insurance Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Insurance Provider</label>
                            <Input name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} placeholder="e.g. BlueCross BlueShield" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Member ID</label>
                            <Input name="insurance_member_id" value={formData.insurance_member_id} onChange={handleChange} placeholder="Member ID" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan Name/ID</label>
                            <Input name="insurance_plan" value={formData.insurance_plan} onChange={handleChange} placeholder="e.g. Gold Premium" />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="min-w-[150px]">
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
