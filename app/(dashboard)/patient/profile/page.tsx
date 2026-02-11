'use client'

import { useState } from 'react'
import { User, Shield, Clock, FileText, Settings, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-purple-500/10"></div>

                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-neutral-surface-dark bg-slate-200 shadow-md overflow-hidden">
                            {/* Placeholder for avatar */}
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <User className="w-12 h-12 text-slate-400" />
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Sarah Johnson</h1>
                        <p className="text-slate-500 dark:text-slate-400">Patient ID: #883492 • 34 Years Old</p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
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
                                        <p className="font-medium text-slate-900 dark:text-white">Sarah Marie Johnson</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Date of Birth</span>
                                        <p className="font-medium text-slate-900 dark:text-white">March 15, 1989</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Blood Type</span>
                                        <p className="font-medium text-slate-900 dark:text-white">A+</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Height / Weight</span>
                                        <p className="font-medium text-slate-900 dark:text-white">168cm / 62kg</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Email</span>
                                        <p className="font-medium text-slate-900 dark:text-white">sarah.j@example.com</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Phone</span>
                                        <p className="font-medium text-slate-900 dark:text-white">+1 (555) 123-4567</p>
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
                                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">Penicillin</span>
                                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30">Peanuts</span>
                                    </div>
                                </section>

                                <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-amber-500" />
                                        Conditions
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30">Asthma</span>
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Medical History Timeline
                            </h3>

                            <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8 pl-8 pb-4">
                                {/* Timeline Item */}
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-white dark:border-neutral-surface-dark"></span>
                                    <span className="text-xs font-bold text-slate-400 mb-1 block">Oct 24, 2023</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">General Checkup</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                                        Routine annual physical. Blood pressure normal. Recommended flu shot.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-slate-500">Dr. Smith</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-slate-500">Clinic A</span>
                                    </div>
                                </div>

                                {/* Timeline Item */}
                                <div className="relative">
                                    <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-slate-300 border-4 border-white dark:border-neutral-surface-dark dark:bg-slate-600"></span>
                                    <span className="text-xs font-bold text-slate-400 mb-1 block">Aug 12, 2023</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Dermatology Consult</h4>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                                        Consultation for rash on forearm. Prescribed topical cream.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Col - Insurance / Devices */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Insurance</h3>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <div className="flex justify-between items-start mb-8">
                                <span className="font-bold tracking-wider">BLUECROSS</span>
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 mb-4">
                                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Member ID</span>
                                <p className="font-mono text-lg tracking-widest">8842 1902 4421</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[10px] text-blue-200 uppercase tracking-widest">Plan</span>
                                    <p className="font-medium text-sm">Gold Premium</p>
                                </div>
                                <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-bold">ACTIVE</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
