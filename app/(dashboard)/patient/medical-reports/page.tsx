'use client'

import { useState, useEffect } from 'react'
import { FileText, Share2, Search, Filter, Calendar, AlertCircle, ChevronRight, User, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getPatientReports, shareReportWithDoctor } from '@/lib/actions/reports'
import { getDoctors } from '@/lib/actions/doctors'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { Notifications } from '@/components/layout/Notifications'
import Link from 'next/link'

export default function MedicalReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [sharingReport, setSharingReport] = useState<any>(null)
    const [isSharing, setIsSharing] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<string>('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const [reportsRes, doctorsRes] = await Promise.all([
            getPatientReports(),
            getDoctors()
        ])

        if (reportsRes.data) setReports(reportsRes.data)
        if (doctorsRes.data) setDoctors(doctorsRes.data)
        setLoading(false)
    }

    const handleShare = async () => {
        if (!selectedDoctor || !sharingReport) return
        
        setIsSharing(true)
        const res = await shareReportWithDoctor(sharingReport.id, selectedDoctor)
        setIsSharing(false)
        
        if (res.success) {
            toast.success('Report shared successfully!')
            setSharingReport(null)
            setSelectedDoctor('')
            loadData() // Refresh status
        } else {
            toast.error(res.error || 'Failed to share report')
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
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Medical Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Access and share your AI-generated health assessments.</p>
                </div>
                <Notifications />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-surface-dark p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input className="pl-10" placeholder="Search reports..." />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                        <Calendar className="w-4 h-4" /> Date Range
                    </Button>
                </div>
            </div>

            {/* Reports List */}
            <div className="grid gap-4">
                {reports.length === 0 ? (
                    <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-700">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No reports yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Complete an AI Health Checkup to generate your first medical report.</p>
                        <Button className="mt-6" onClick={() => window.location.href='/patient/ai-checkup'}>Go to AI Checkup</Button>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="group bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
                            <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
                                {/* Type Icon */}
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                    report.severity === 'critical' 
                                        ? "bg-red-50 text-red-500 dark:bg-red-900/20" 
                                        : "bg-blue-50 text-blue-500 dark:bg-blue-900/20"
                                )}>
                                    <FileText className="w-7 h-7" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{report.title}</h3>
                                        {report.severity === 'critical' && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Critical
                                            </span>
                                        )}
                                        {report.doctor_id && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Shared
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(report.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 capitalize"><FileText className="w-4 h-4" /> {report.type.replace('-', ' ')}</span>
                                        {report.doctor_id && (
                                            <span className="flex items-center gap-1.5 text-primary font-medium">
                                                <User className="w-4 h-4" /> Shared with Dr. Specialist
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30" onClick={() => setSharingReport(report)}>
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <Link href={`/patient/medical-reports/${report.id}`} className="flex-1 md:flex-none">
                                        <Button className="w-full gap-2">
                                            View Results <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Share Modal Overlay */}
            {sharingReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Share Report</h2>
                            <button onClick={() => setSharingReport(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                    Sharing your "<strong>{sharingReport.title}</strong>" will allow the selected doctor to view your full analysis and medical vitals.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Doctor</label>
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                    {doctors.map((dr) => (
                                        <button
                                            key={dr.id}
                                            onClick={() => setSelectedDoctor(dr.id)}
                                            className={cn(
                                                "w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group",
                                                selectedDoctor === dr.id 
                                                    ? "bg-primary/10 border-primary shadow-sm" 
                                                    : "bg-transparent border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50/50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white dark:border-neutral-surface-dark overflow-hidden">
                                                {dr.avatar_url ? (
                                                    <img src={dr.avatar_url} alt={dr.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-primary">Dr</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">Dr. {dr.full_name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{dr.doctors?.[0]?.specialty || 'General Practitioner'}</p>
                                            </div>
                                            {selectedDoctor === dr.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                        </button>
                                    ))}
                                    {doctors.length === 0 && (
                                        <p className="text-center py-8 text-slate-500 text-sm">No doctors found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-white/2 flex gap-3 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setSharingReport(null)}>Cancel</Button>
                            <Button className="flex-[2] h-12 rounded-xl shadow-lg shadow-primary/30" disabled={!selectedDoctor || isSharing} onClick={handleShare}>
                                {isSharing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                                Share Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
