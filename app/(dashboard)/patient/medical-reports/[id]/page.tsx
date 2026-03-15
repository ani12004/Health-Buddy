'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
    ArrowLeft, 
    Calendar, 
    FileText, 
    Download, 
    Activity, 
    AlertCircle, 
    ShieldCheck, 
    Loader2,
    CheckCircle2,
    User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getReportById } from '@/lib/actions/reports'
import { HealthScoreMeter } from '@/components/dashboard/HealthScoreMeter'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { ShapXaiChart } from '@/components/dashboard/ShapXaiChart'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function ReportDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            loadReport(params.id as string)
        }
    }, [params.id])

    async function loadReport(id: string) {
        setLoading(true)
        const res = await getReportById(id)
        if (res.data) {
            setReport(res.data)
        } else {
            toast.error(res.error || 'Report not found')
            router.push('/patient/medical-reports')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!report) return null

    // Extract detailed content if available (formatted by health_assessments relation or content JSON)
    const assessment = report.assessment || {}
    const content = report.content || {}
    const healthScore = report.health_score || assessment.health_score || 0
    const probabilities = assessment.probabilities || content.probabilities || report.probabilities || {}
    const shapValues = assessment.shap_values || assessment.explanation?.shap || content.shap || null
    const recommendations = report.recommendations || assessment.explanation?.recommendations || assessment.explanation?.suggestions || []
    const summary = report.summary || assessment.explanation?.summary || assessment.explanation?.overallAssessment || ""
    const factors = assessment.explanation?.factors || assessment.explanation?.predictions || content.factors || []

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to reports
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        {report.title}
                        {report.severity === 'critical' && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold rounded uppercase tracking-widest flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Critical
                            </span>
                        )}
                    </h1>
                    <div className="flex gap-4 mt-2 text-slate-500 text-sm">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(report.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5 capitalize"><FileText className="w-4 h-4" /> {report.type.replace('-', ' ')}</span>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <a 
                        href={`/api/reports/${report.id}/pdf`} 
                        target="_blank"
                        className="flex-1 md:flex-none"
                    >
                        <Button variant="outline" className="w-full gap-2 border-slate-200 dark:border-slate-700">
                            <Download className="w-4 h-4" /> Download PDF
                        </Button>
                    </a>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Overall Score & Risk Gauges */}
                <div className="lg:col-span-1 space-y-8">
                    <HealthScoreMeter score={healthScore} />
                    
                    <div className="p-8 bg-white dark:bg-neutral-surface-dark rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 flex justify-around">
                        <RiskGauge value={probabilities.heart_disease || 0} label="Cardiac Risk" />
                        <div className="w-px bg-slate-100 dark:bg-slate-700 mx-2" />
                        <RiskGauge value={probabilities.hypertension || 0} label="Vascular Risk" />
                    </div>

                    {/* Shared With Stats */}
                    {report.doctor_id && (
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/20 text-emerald-700 dark:text-emerald-400">
                            <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Shared with Practitioner
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center font-bold">
                                    <User className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-medium">Your medical provider has access to this report for review.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* MIDDLE & RIGHT: Deep Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary Section */}
                    <Card className="p-8 text-white relative overflow-hidden bg-slate-900 border-0 shadow-2xl rounded-[32px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Interpretation</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">
                                Clinical Assessment Summary
                            </h2>
                            <p className="text-slate-300 leading-relaxed italic border-l-4 border-blue-500/30 pl-6 py-2">
                                "{summary}"
                            </p>
                        </div>
                    </Card>

                    {/* Features & SHAP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shapValues?.heart_disease && (
                            <ShapXaiChart shapValues={shapValues.heart_disease} title="Cardiac Attribution" />
                        )}
                        {shapValues?.hypertension && (
                            <ShapXaiChart shapValues={shapValues.hypertension} title="Vascular Attribution" />
                        )}
                    </div>

                    {/* Key Findings & Recs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Findings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Key Health Factors
                            </h3>
                            <div className="space-y-3">
                                {factors.length > 0 ? factors.map((f: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                            {typeof f === 'string' ? f : (f.disease || f.title)}: {f.reasoning || f.body}
                                        </p>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400 italic">No specific factors identified.</p>
                                )}
                            </div>
                        </div>

                        {/* Recs */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                Care Plan Steps
                            </h3>
                            <div className="space-y-3">
                                {recommendations.length > 0 ? recommendations.map((r: any, i: number) => (
                                    <div key={i} className="p-4 bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {typeof r === 'string' ? r : (r.title || r)}
                                        </p>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400 italic">No specific recommendations found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
