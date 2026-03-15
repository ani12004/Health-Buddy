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

export default function AssessmentPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [formData, setFormData] = useState<any>(null)

    const handleAnalyze = async (data: any) => {
        setLoading(true)
        setResult(null)
        try {
            const response = await analyzeHealth(data)
            if (response.error) {
                toast.error(response.error)
            } else {
                setResult(response.data)
                setFormData(data)
                toast.success('Professional Analysis Complete')
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
                        </div>

                        {/* RIGHT: Gemini Medical Interpretation */}
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
