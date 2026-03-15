'use client'

import { useState, useEffect } from 'react'
import { User, Shield, Clock, FileText, Settings, Edit2, Loader2, Phone, Briefcase, ChevronRight, AlertCircle, CheckCircle2, Calendar, Brain, Info, Activity, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Notifications } from '@/components/layout/Notifications'
import { AvatarUpload } from '@/components/features/AvatarUpload'
import HealthReport from '@/components/features/HealthReport'

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [patient, setPatient] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)
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

            const { data: reportsData } = await supabase
                .from('reports')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            const { data: assessmentsData } = await supabase
                .from('health_assessments')
                .select('*')
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            // Create a set of assessment IDs already linked to reports to avoid duplicates
            const linkedAssessmentIds = new Set((reportsData || [])
                .filter((r: any) => r.assessment_id)
                .map((r: any) => r.assessment_id))

            // Combine and sort by date
            const combinedHistory = [
                ...(reportsData || []).map((r: any) => {
                    const typeLower = (r.type || '').toLowerCase();
                    const isAI = typeLower.includes('ai') || typeLower.includes('assessment') || !!r.assessment_id;
                    
                    // Find matching assessment data if linked
                    const linkedAssessment = r.assessment_id 
                        ? (assessmentsData || []).find((a: any) => a.id === r.assessment_id)
                        : null;

                    // Source technical data from the assessment if available, fallback to report content
                    const health_score = r.health_score || linkedAssessment?.health_score || r.content?.health_score;
                    const summary = r.summary || linkedAssessment?.explanation?.summary || r.content?.summary || r.content?.overallAssessment;
                    const probabilities = linkedAssessment?.probabilities || r.content?.probabilities || (r.top_risks ? Object.fromEntries(r.top_risks.map((p: any) => [p.disease || p.name, p.probability || p.risk])) : {});
                    
                    // Force generated if we have any actual results
                    const hasResults = !!health_score || !!summary || (probabilities && Object.keys(probabilities).length > 0);
                    const status = hasResults ? 'generated' : (r.status || linkedAssessment?.status || 'pending');
                    
                    const shap = linkedAssessment?.explanation?.shap || r.content?.shap;
                    const confidence = linkedAssessment?.explanation?.confidence || r.content?.confidence;

                    // Reconstruct factors and recommendations from all possible sources
                    const rawFactors = r.content?.factors || r.top_risks || linkedAssessment?.explanation?.predictions || [];
                    const factors = rawFactors.map((p: any) => ({
                        title: p.disease || p.name || p.title || 'Risk Factor',
                        body: p.reasoning || p.details || p.body || 'Identified risk factor.'
                    }));

                    const rawRecs = r.content?.recommendations || r.recommendations || linkedAssessment?.explanation?.recommendations || linkedAssessment?.explanation?.suggestions || [];
                    const recommendations = rawRecs.map((s: any) => ({
                        priority: s.priority || 'HIGH',
                        title: typeof s === 'string' ? s.split(':')[0] : (s.title || 'Advice'),
                        body: typeof s === 'string' ? (s.split(':')[1] || s) : (s.body || s)
                    }));

                    return { 
                        ...r, 
                        status,
                        health_score,
                        entryType: isAI ? 'assessment' : 'report',
                        title: r.title || (isAI ? 'AI Health Assessment' : 'Medical Report'),
                        // Consolidate data for HealthReport component
                        content: {
                            ...(typeof r.content === 'object' ? r.content : {}),
                            inputs: r.content?.inputs || linkedAssessment?.inputs || {},
                            summary,
                            probabilities,
                            confidence,
                            shap,
                            factors,
                            recommendations
                        },
                        explanation: linkedAssessment?.explanation || {
                            overallAssessment: summary,
                            predictions: rawFactors.map((p: any) => ({
                                disease: p.disease || p.name || 'Unknown',
                                probability: p.probability || p.risk || '0%',
                                riskLevel: p.riskLevel || (parseFloat(p.probability) > 50 ? 'High' : 'Low'),
                                reasoning: p.reasoning || p.details || ''
                            })),
                            suggestions: rawRecs
                        }
                    };
                }),
                ...(assessmentsData || [])
                    .filter((a: any) => !linkedAssessmentIds.has(a.id))
                    .map((a: any) => {
                        const summary = a.explanation?.summary || a.explanation?.overallAssessment;
                        const hasResults = !!a.health_score || !!summary || (a.probabilities && Object.keys(a.probabilities).length > 0);
                        
                        return { 
                            ...a, 
                            status: hasResults ? 'generated' : (a.status || 'pending'),
                            entryType: 'assessment',
                            title: `AI Health Assessment (${a.severity})`,
                            type: 'ai-assessment',
                            explanation: a.explanation ? { 
                                overallAssessment: summary || "No summary available.",
                                predictions: a.probabilities ? Object.entries(a.probabilities).map(([k, v]: [string, any]) => ({ 
                                    disease: k.replace('_', ' '), 
                                    probability: `${((v || 0) * 100).toFixed(0)}%`,
                                    riskLevel: (v || 0) > 0.3 ? 'High' : 'Low'
                                })) : [],
                                suggestions: a.explanation.recommendations || a.explanation.suggestions || []
                            } : {
                                overallAssessment: "No summary available.",
                                predictions: [],
                                suggestions: []
                            }
                        };
                    })
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            setProfile(profileData)
            setPatient(patientData)
            setHistory(combinedHistory)
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
                    <AvatarUpload 
                        userId={profile?.id} 
                        currentUrl={profile?.avatar_url} 
                        onUploadSuccess={(url) => setProfile({ ...profile, avatar_url: url })}
                    />

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
                            <div className="space-y-4">
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <div key={item.id} className="group bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                                                    item.severity === 'critical' 
                                                        ? "bg-red-50 text-red-500 dark:bg-red-900/20" 
                                                        : item.entryType === 'assessment'
                                                            ? "bg-purple-50 text-purple-500 dark:bg-purple-900/20"
                                                            : "bg-blue-50 text-blue-500 dark:bg-blue-900/20"
                                                )}>
                                                    {item.entryType === 'assessment' ? <Brain className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                                                        {item.severity === 'critical' && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                                                <AlertCircle className="w-3 h-3" /> Critical
                                                            </span>
                                                        )}
                                                        {item.status === 'pending' && !item.health_score && !item.summary && (
                                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Processing
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1.5 capitalize"><FileText className="w-4 h-4" /> {item.type.replace('-', ' ')}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="gap-2 group-hover:bg-primary group-hover:text-white transition-all whitespace-nowrap" 
                                                    onClick={() => setSelectedItem(item)}
                                                >
                                                    Details <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50/50 dark:bg-white/2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300 opacity-50" />
                                        <p className="text-slate-500">No history records found.</p>
                                        <Button variant="ghost" className="mt-2 text-primary text-sm font-semibold" onClick={() => window.location.href='/patient/ai-checkup'}>
                                            Start your first AI Checkup
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'results' && (
                        <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Laboratory Results
                            </h3>
                            <div className="space-y-4">
                                {history.filter(item => item.entryType === 'report' && item.type === 'lab-report').length > 0 ? (
                                    history.filter(item => item.entryType === 'report' && item.type === 'lab-report').map((item) => (
                                        <div key={item.id} className="group bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-900/20 flex items-center justify-center shrink-0 shadow-inner">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white truncate mb-1">{item.title}</h4>
                                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-white transition-all whitespace-nowrap" onClick={() => setSelectedItem(item)}>
                                                    View Report <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50/50 dark:bg-white/2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300 opacity-50" />
                                        <p className="text-slate-500">No lab results found.</p>
                                    </div>
                                )}
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

            {/* History Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 print:relative print:p-0 print:bg-white print:backdrop-blur-none">
                    <div className="bg-white dark:bg-neutral-surface-dark w-full max-w-4xl max-h-[95vh] rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 print:max-h-none print:rounded-none print:shadow-none print:border-none print:static">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 print:hidden">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                    selectedItem.entryType === 'assessment' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {selectedItem.entryType === 'assessment' ? <Brain className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedItem.title}</h2>
                                    <p className="text-xs text-slate-500">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 pb-8 print:overflow-visible print:pb-0">
                            {selectedItem.entryType === 'assessment' ? (
                                <HealthReport data={{
                                    ...selectedItem.content,
                                    patient_name: profile?.full_name,
                                    patient_email: profile?.email,
                                    report_id: selectedItem.id,
                                    report_date: selectedItem.created_at,
                                    severity: selectedItem.severity,
                                    health_score: selectedItem.health_score,
                                    explanation: selectedItem.explanation,
                                    status: selectedItem.status
                                }} />
                            ) : (
                                <div className="p-6 md:p-8 space-y-8">
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Report Details</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Report Type</span>
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold capitalize">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {selectedItem.type.replace('-', ' ')}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Content</span>
                                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none">
                                                    {typeof selectedItem.content === 'string' ? selectedItem.content : JSON.stringify(selectedItem.content, null, 2)}
                                                </div>
                                            </div>
                                            {selectedItem.doctor_id && (
                                                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-green-800 dark:text-green-400">Consultation Shared</p>
                                                        <p className="text-xs text-green-600">This report has been shared with your assigned specialist.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedItem.file_url && (
                                        <Button className="w-full h-14 rounded-2xl gap-3" onClick={() => window.open(selectedItem.file_url)}>
                                            <FileText className="w-5 h-5" />
                                            View Original Document
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:p-8 bg-slate-50 dark:bg-white/2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 print:hidden">
                            <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setSelectedItem(null)}>
                                Close View
                            </Button>
                            <Button className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/20" onClick={() => window.open(`/api/reports/${selectedItem.id}/pdf`, '_blank')}>
                                <FileText className="w-5 h-5 mr-2" />
                                Download Official PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
