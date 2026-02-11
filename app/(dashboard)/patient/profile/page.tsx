'use client'

import { useState, useEffect } from 'react'
import { User, Shield, Clock, FileText, Settings, Edit2, Loader2, Phone, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Notifications } from '@/components/layout/Notifications'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [patient, setPatient] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const { data: patientData } = await supabase
                .from('patients')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(profileData)
            setPatient(patientData)
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const calculateAge = (dob: string) => {
        if (!dob) return 'Unknown'
        const birthDate = new Date(dob)
        const ageDifMs = Date.now() - birthDate.getTime()
        const ageDate = new Date(ageDifMs)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-purple-500/10"></div>
                <div className="absolute top-4 right-4 lg:hidden">
                    <Notifications />
                </div>

                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-surface-dark bg-slate-200 shadow-md overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-slate-400">{profile?.full_name?.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <Link href="/patient/settings" className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{profile?.full_name}</h1>
                        <p className="text-slate-500 dark:text-slate-400">Patient • {calculateAge(patient?.dob)} Years Old</p>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/patient/settings">
                            <Button variant="outline" className="gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
                {['overview', 'history', 'results'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-3 text-sm font-medium capitalize transition-all border-b-2",
                            activeTab === tab
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                    >
                        {tab === 'results' ? 'Lab Results' : tab === 'history' ? 'Medical History' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col - Overview Info */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            {/* Personal Info */}
                            <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Full Name</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{profile?.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Date of Birth</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{patient?.dob || 'Not set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Blood Type</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{patient?.blood_type || 'Unknown'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Height / Weight</span>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {patient?.height || '-'} / {patient?.weight || '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Email</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{profile?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Phone</span>
                                        <p className="font-medium text-slate-900 dark:text-white">{profile?.phone || 'Not set'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Allergies & Conditions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-red-500" />
                                        Allergies
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patient?.allergies && patient.allergies.length > 0 ? (
                                            patient.allergies.map((allergy: any, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">
                                                    {typeof allergy === 'string' ? allergy : allergy.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-500 text-sm">No known allergies</span>
                                        )}
                                    </div>
                                </section>

                                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-amber-500" />
                                        Conditions
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {patient?.conditions && patient.conditions.length > 0 ? (
                                            patient.conditions.map((condition: any, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">
                                                    {typeof condition === 'string' ? condition : condition.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-500 text-sm">No known conditions</span>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Medical History
                            </h3>
                            <div className="text-center py-8 text-slate-500">
                                No history records found.
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Col - Insurance */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Insurance</h3>
                        {patient?.insurance_provider ? (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                <div className="flex justify-between items-start mb-8">
                                    <span className="font-bold tracking-wider uppercase">{patient.insurance_provider}</span>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="space-y-1 mb-4">
                                    <span className="text-[10px] text-blue-200 uppercase tracking-widest">Member ID</span>
                                    <p className="font-mono text-lg tracking-widest">{patient.insurance_member_id}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-[10px] text-blue-200 uppercase tracking-widest">Plan</span>
                                        <p className="font-medium text-sm">{patient.insurance_plan}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">ACTIVE</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400">
                                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No insurance details added.</p>
                                <Link href="/patient/settings" className="text-xs text-primary mt-2 inline-block">Add in Settings</Link>
                            </div>
                        )}

                    </section>
                </div>
            </div>
        </div>
    )
}
