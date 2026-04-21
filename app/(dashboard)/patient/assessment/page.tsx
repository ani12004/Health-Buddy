'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzeHealth } from '@/lib/actions/assessment'
import { HealthScoreMeter } from '@/components/dashboard/HealthScoreMeter'
import { RiskGauge } from '@/components/dashboard/RiskGauge'
import { ShapXaiChart } from '@/components/dashboard/ShapXaiChart'
import { DemoPatientGenerator } from '@/components/demo/DemoPatientGenerator'
import { Loader2, Plus, Download, ShieldCheck, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { submitMLFeedback } from '@/lib/actions/feedback'
import { Star, MessageSquare as MsgIcon, Send } from 'lucide-react'

export default function AssessmentPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [formData, setFormData] = useState<any>(null)

    const handleAnalyze = async (data: any) => {
        setLoading(true)
        setResult(null)
        try {
            const response = await analyzeHealth(data)
            if ('error' in response) {
                toast.error(response.error)
            } else if ('data' in response) {
                setResult(response.data)
                setFormData(data)
                toast.success('Professional Analysis Complete')
            } else {
                toast.error('Unexpected response from AI engine')
            }
        } catch (err) {
            toast.error('Failed to connect to AI engine')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="text-blue-600" />
                        AI Health Intelligence
                    </h1>
                    <p className="text-slate-500 mt-1">Professional risk assessment & medical interpretation layer</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                        <Download size={18} />
                        Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        <Plus size={18} />
                        New Scan
                    </button>
                </div>
            </div>

            {/* Presentation Mode: Demo Presets */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="text-emerald-500" size={16} />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Presentation Mode</span>
                </div>
                <DemoPatientGenerator onSelect={handleAnalyze} />
            </section>

            {/* Analysis Loading State */}
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-20 bg-white rounded-[32px] border-2 border-dashed border-blue-100"
                    >
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Interrogating AI Models...</h3>
                        <p className="text-slate-500 text-sm mt-2">Computing ensemble risks & SHAP attributions</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Dashboard */}
            <AnimatePresence>
                {result && !loading && (
                    <div className="space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* LEFT: Overall Score & Risk Gauges */}
                            <div className="lg:col-span-1 space-y-6">
                                <HealthScoreMeter score={result.health_score} />
                                
                                <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex justify-around">
                                    <RiskGauge value={result.probabilities.heart_disease} label="Cardiac" />
                                    <div className="w-px bg-slate-100 mx-2" />
                                    <RiskGauge value={result.probabilities.hypertension} label="Vascular" />
                                    <div className="w-px bg-slate-100 mx-2" />
                                    <RiskGauge value={result.probabilities.diabetes} label="Metabolic" />
                                </div>

                                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">Confidence Score</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.confidence_scores.heart_disease * 100}%` }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                        <span className="text-sm font-black text-blue-700">{(result.confidence_scores.heart_disease * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE: Explainable AI & Detailed Risks */}
                            <div className="lg:col-span-1 space-y-6">
                                <ShapXaiChart shapValues={result.shap_values.heart_disease} title="Cardiac Risk Attribution" />
                                <ShapXaiChart shapValues={result.shap_values.hypertension} title="Vascular Risk Attribution" />
                                <ShapXaiChart shapValues={result.shap_values.diabetes} title="Metabolic Risk Attribution" />
                            </div>

                            {/* RIGHT: Medical Interpretation */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl h-full border border-slate-800">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Medical interpretation</span>
                                    </div>
                                    
                                    <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">
                                        Clinical Assessment Summary
                                    </h2>
                                    
                                    <p className="text-slate-300 leading-relaxed text-sm italic mb-8">
                                        "{result.explanation.summary}"
                                    </p>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">Key Insights</h4>
                                            <ul className="space-y-3">
                                                {result.explanation.factors.map((f: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm">
                                                        <span className="text-blue-400 font-bold">•</span>
                                                        <span className="text-slate-300">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-widest">Recommendations</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {result.explanation.recommendations.map((r: string, i: number) => (
                                                    <div key={i} className="px-3 py-2 bg-slate-800 rounded-xl text-xs text-slate-200 border border-slate-700 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                                        {r}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-800">
                                            <div className="p-4 bg-rose-900/40 rounded-2xl border border-rose-800/50">
                                                <h4 className="text-[10px] font-bold uppercase text-rose-300 mb-1">Clinic Consultation Trigger</h4>
                                                <p className="text-xs text-rose-100 leading-relaxed font-medium">
                                                    {result.explanation.consultation_trigger}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-8 text-[9px] text-slate-500 leading-relaxed uppercase font-bold text-center">
                                        Medical Disclaimer: AI risk estimates are for informational purposes only.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ML Feedback Section (NEW) */}
                        <MLFeedbackForm assessmentId={result.id || "manual-v8"} />
                    </div>
                )}
            </AnimatePresence>
            
            {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
                   <Activity className="w-16 h-16 text-slate-300 mb-4" />
                   <h3 className="text-xl font-bold text-slate-800">Ready for Health Scan</h3>
                   <p className="text-slate-500 text-sm mt-2">Select a demo patient or enter data to begin AI analysis</p>
                </div>
            )}
        </div>
    )
}

function MLFeedbackForm({ assessmentId }: { assessmentId: string }) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }

        setSubmitting(true)
        try {
            const res = await submitMLFeedback({ assessment_id: assessmentId, rating, comment })
            if (res.error) {
                toast.error(res.error)
            } else {
                setSubmitted(true)
                toast.success('Thank you for your feedback!')
            }
        } catch (err) {
            toast.error('Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 text-center space-y-4"
            >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Feedback Received</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    Your insights help us calibrate our V8 ensemble for better medical accuracy. Thank you for contributing to the community.
                </p>
            </motion.div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <MsgIcon className="text-blue-500 w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rate AI Accuracy</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">How accurate was this checkup?</h3>
                    <p className="text-slate-500 text-sm">Help us improve our local ML ensemble with your real-world feedback.</p>
                </div>

                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="p-1 transition-transform hover:scale-125"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star 
                                size={32} 
                                className={cn(
                                    "transition-colors",
                                    (hover || rating) >= star 
                                        ? "fill-amber-400 text-amber-400" 
                                        : "text-slate-200"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe any discrepancies or insights... (Optional)"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 placeholder:text-slate-400 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px] resize-none"
                    disabled={submitting}
                />
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    Submit Model Feedback
                </button>
            </form>
        </motion.div>
    )
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}
