'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Notifications } from '@/components/layout/Notifications'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Phone, Save, Loader2, Award, Building2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AvatarUpload } from '@/components/features/AvatarUpload'
import { Loader3D } from '@/components/ui/Loader3D'

export default function DoctorSettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        specialty: '',
        license_number: '',
        hospital_affiliation: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const [profile, setProfile] = useState<any>(null)
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        setProfile(profileData)

        // Fetch doctor details
        const { data: doctor } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                specialty: doctor?.specialty || '',
                license_number: doctor?.license_number || '',
                hospital_affiliation: doctor?.hospital_affiliation || ''
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

            // Update Doctor
            const { error: doctorError } = await supabase
                .from('doctors')
                .update({
                    specialty: formData.specialty,
                    license_number: formData.license_number,
                    hospital_affiliation: formData.hospital_affiliation
                })
                .eq('id', user.id)

            if (doctorError) throw doctorError

            toast.success('Professional profile updated')
            router.refresh()
        } catch (error: any) {
            console.error('Error updating doctor profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Loader3D
                compact
                title="Loading Professional Settings"
                subtitle="Preparing profile credentials, clinic metadata, and account preferences..."
            />
        )
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Professional Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your professional profile and hospital details.</p>
                </div>
                <Notifications />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Basic Information
                    </h3>

                    <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <AvatarUpload 
                            userId={profile?.id} 
                            currentUrl={profile?.avatar_url} 
                            onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
                        />
                        <div className="text-center md:text-left">
                            <h4 className="font-bold text-slate-900 dark:text-white">Profile Photo</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Upload a professional headshot. Max 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Dr. John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input name="phone" value={formData.phone} onChange={handleChange} className="pl-10" placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Read-only)</label>
                            <Input name="email" value={formData.email} disabled className="bg-slate-50 dark:bg-white/5 opacity-60" />
                        </div>
                    </div>
                </section>

                {/* Professional Qualifications */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Professional Qualifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical Specialty</label>
                            <Input name="specialty" value={formData.specialty} onChange={handleChange} placeholder="e.g. Cardiologist" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">License Number</label>
                            <Input name="license_number" value={formData.license_number} onChange={handleChange} placeholder="MD12345678" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hospital/Clinic Affiliation</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <Input name="hospital_affiliation" value={formData.hospital_affiliation} onChange={handleChange} className="pl-10" placeholder="e.g. City General Hospital" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Security Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                            <Input type="password" placeholder="••••••••" />
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
