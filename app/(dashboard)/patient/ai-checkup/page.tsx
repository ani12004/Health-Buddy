'use client'

import { useState } from 'react'
import { analyzeHealthData } from '@/lib/actions/gemini/checkup'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Notifications } from '@/components/layout/Notifications'
import { Brain, Activity, Heart, AlertTriangle, CheckCircle, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function AICheckupPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const [formData, setFormData] = useState({
        age: '',
        sex: 'Male',
        bmi: '',
        waist_circumference: '',
        systolic_bp: '',
        diastolic_bp: '',
        resting_heart_rate: '',
        total_cholesterol: '',
        ldl: '',
        hdl: '',
        triglycerides: '',
        fasting_glucose: '',
        hba1c: '',
        smoker: 'No',
        family_history_heart: 'No',
        physical_activity_level: 'Moderate',
        alcohol_use: 'None',
        salt_intake: 'Moderate',
        stress_level: 'Low',
        heart_disease: false,
        hypertension: false
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const analysis = await analyzeHealthData(formData)
            setResult(analysis)
            toast.success('Analysis complete')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate analysis. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary" />
                        AI Health Checkup
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Enter your health parameters for a personalized AI-driven disease risk assessment.
                    </p>
                </div>
                <Notifications />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Parameters</h3>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Basics */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Demographics</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} required />
                                    <select name="sex" value={formData.sex} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm h-10 w-full focus:outline-primary">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Vitals</label>
                                <Input name="bmi" placeholder="BMI (e.g. 24.5)" type="number" step="0.1" value={formData.bmi} onChange={handleChange} required />
                                <Input name="waist_circumference" placeholder="Waist (cm)" type="number" value={formData.waist_circumference} onChange={handleChange} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input name="systolic_bp" placeholder="Systolic BP" type="number" value={formData.systolic_bp} onChange={handleChange} required />
                                    <Input name="diastolic_bp" placeholder="Diastolic BP" type="number" value={formData.diastolic_bp} onChange={handleChange} required />
                                </div>
                                <Input name="resting_heart_rate" placeholder="Heart Rate (bpm)" type="number" value={formData.resting_heart_rate} onChange={handleChange} />
                            </div>

                            {/* Labs */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Lab Values</label>
                                <Input name="total_cholesterol" placeholder="Total Cholesterol" type="number" value={formData.total_cholesterol} onChange={handleChange} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input name="ldl" placeholder="LDL" type="number" value={formData.ldl} onChange={handleChange} />
                                    <Input name="hdl" placeholder="HDL" type="number" value={formData.hdl} onChange={handleChange} />
                                </div>
                                <Input name="triglycerides" placeholder="Triglycerides" type="number" value={formData.triglycerides} onChange={handleChange} />
                                <Input name="fasting_glucose" placeholder="Fasting Glucose" type="number" value={formData.fasting_glucose} onChange={handleChange} />
                                <Input name="hba1c" placeholder="HbA1c (%)" type="number" step="0.1" value={formData.hba1c} onChange={handleChange} />
                            </div>

                            {/* Lifestyle */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Lifestyle</label>
                                <select name="smoker" value={formData.smoker} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm h-10 w-full mb-2">
                                    <option value="No">Non-Smoker</option>
                                    <option value="Yes">Smoker</option>
                                    <option value="Former">Former Smoker</option>
                                </select>
                                <select name="physical_activity_level" value={formData.physical_activity_level} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm h-10 w-full mb-2">
                                    <option value="Sedentary">Sedentary</option>
                                    <option value="Light">Lightly Active</option>
                                    <option value="Moderate">Moderately Active</option>
                                    <option value="Active">Very Active</option>
                                </select>
                                <select name="alcohol_use" value={formData.alcohol_use} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm h-10 w-full mb-2">
                                    <option value="None">None</option>
                                    <option value="Occasional">Occasional</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Heavy">Heavy</option>
                                </select>
                                <select name="stress_level" value={formData.stress_level} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm h-10 w-full">
                                    <option value="Low">Low Stress</option>
                                    <option value="Moderate">Moderate Stress</option>
                                    <option value="High">High Stress</option>
                                </select>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full mt-4">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Activity className="w-4 h-4 mr-2" />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="lg:col-span-2 space-y-6">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Brain className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Analyze</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Fill out the parameters on the left and click "Run Analysis" to get a detailed health assessment powered by Gemini AI.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Overall Assessment */}
                            <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Assessment Summary
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {result.overallAssessment}
                                </p>
                            </section>

                            {/* Predictions */}
                            <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-amber-500" />
                                    Disease Predictions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.predictions.map((pred: any, idx: number) => (
                                        <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{pred.disease}</h4>
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded-full",
                                                    pred.riskLevel === 'High' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                        pred.riskLevel === 'Medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                )}>
                                                    {pred.riskLevel} Risk
                                                </span>
                                            </div>
                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-2xl font-bold text-primary">{pred.probability}</span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">probability</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                                                {pred.reasoning}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Suggestions */}
                            <section className="bg-white dark:bg-neutral-surface-dark rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500" />
                                    Recommendations
                                </h3>
                                <ul className="space-y-3">
                                    {result.suggestions.map((suggestion: string, idx: number) => (
                                        <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <p className="text-xs text-slate-400 text-center italic mt-8">
                                Disclaimer: {result.disclaimer}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
