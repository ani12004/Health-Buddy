'use client'

import { useState } from 'react'
import { analyzeHealthData } from '@/lib/actions/gemini/checkup'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Notifications } from '@/components/layout/Notifications'
import { Brain, Activity, Heart, AlertTriangle, CheckCircle, Loader2, Info, ChevronRight, ChevronLeft, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

const STEPS = [
    { id: 1, title: 'Basics', description: 'Personal information' },
    { id: 2, title: 'Vitals', description: 'Physical health markers' },
    { id: 3, title: 'Lab Results', description: 'Blood & glucose levels' },
    { id: 4, title: 'Lifestyle', description: 'Habits & history' }
]

export default function AICheckupPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(1)

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

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

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
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary" />
                        AI Health Checkup
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Professional health assessment powered by Gemini 2.5 Flash.
                    </p>
                </div>
                <Notifications />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Multi-Step Form Container */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-neutral-surface-dark rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                        
                        {/* Progress Stepper */}
                        <div className="flex justify-between mb-8 relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-0"></div>
                            {STEPS.map((step) => (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                        currentStep >= step.id 
                                            ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" 
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    )}>
                                        {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase mt-2 tracking-tighter opacity-0 sm:opacity-100",
                                        currentStep === step.id ? "text-primary" : "text-slate-400"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="min-h-[320px]">
                                {currentStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">The Basics</h3>
                                            <p className="text-sm text-slate-500">Core information needed for baseline assessment.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Age</label>
                                                <Input name="age" placeholder="25" type="number" value={formData.age} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Gender</label>
                                                <select name="sex" value={formData.sex} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm h-12 w-full focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">BMI Value</label>
                                            <Input name="bmi" placeholder="Body Mass Index (e.g. 22.5)" type="number" step="0.1" value={formData.bmi} onChange={handleChange} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Waist Circumference (cm)</label>
                                            <Input name="waist_circumference" placeholder="Waist measurement" type="number" value={formData.waist_circumference} onChange={handleChange} />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Vitals & History</h3>
                                            <p className="text-sm text-slate-500">Cardiovascular and physiological markers.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase ml-1 text-primary">Systolic BP</label>
                                                <Input name="systolic_bp" placeholder="Value" type="number" value={formData.systolic_bp} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase ml-1 text-primary">Diastolic BP</label>
                                                <Input name="diastolic_bp" placeholder="Value" type="number" value={formData.diastolic_bp} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Resting Heart Rate (BPM)</label>
                                            <Input name="resting_heart_rate" placeholder="e.g. 72" type="number" value={formData.resting_heart_rate} onChange={handleChange} />
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 pt-2">
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                                <span className="text-sm font-semibold">Hypertension History?</span>
                                                <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                                <span className="text-sm font-semibold">Heart Disease?</span>
                                                <input type="checkbox" name="heart_disease" checked={formData.heart_disease} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Lab Values</h3>
                                            <p className="text-sm text-slate-500">Submit your latest blood report markers.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Total Cholesterol</label>
                                                <Input name="total_cholesterol" placeholder="mg/dL" type="number" value={formData.total_cholesterol} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Triglycerides</label>
                                                <Input name="triglycerides" placeholder="mg/dL" type="number" value={formData.triglycerides} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">LDL (Bad)</label>
                                                <Input name="ldl" placeholder="mg/dL" type="number" value={formData.ldl} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">HDL (Good)</label>
                                                <Input name="hdl" placeholder="mg/dL" type="number" value={formData.hdl} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Glucose</label>
                                                <Input name="fasting_glucose" placeholder="mg/dL" type="number" value={formData.fasting_glucose} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">HbA1c (%)</label>
                                                <Input name="hba1c" placeholder="7.0" type="number" step="0.1" value={formData.hba1c} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Lifestyle & Habits</h3>
                                            <p className="text-sm text-slate-500">Daily habits that impact your long-term health.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Smoking Habit</label>
                                            <select name="smoker" value={formData.smoker} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm h-12 w-full outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                                <option value="No">Non-Smoker</option>
                                                <option value="Yes">Regular Smoker</option>
                                                <option value="Former">Former Smoker</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Physical Activity</label>
                                            <select name="physical_activity_level" value={formData.physical_activity_level} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm h-12 w-full outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                                <option value="Sedentary">Sedentary</option>
                                                <option value="Light">Lightly Active</option>
                                                <option value="Moderate">Moderately Active</option>
                                                <option value="Active">Very Active</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Stress Level</label>
                                                <select name="stress_level" value={formData.stress_level} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm h-12 w-full outline-none">
                                                    <option value="Low">Low</option>
                                                    <option value="Moderate">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Salt Intake</label>
                                                <select name="salt_intake" value={formData.salt_intake} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-sm h-12 w-full outline-none">
                                                    <option value="Low">Low</option>
                                                    <option value="Moderate">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                {currentStep > 1 && (
                                    <Button type="button" variant="ghost" onClick={prevStep} className="flex-1 h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                                        <ChevronLeft className="w-5 h-5 mr-2" />
                                        Back
                                    </Button>
                                )}
                                
                                {currentStep < 4 ? (
                                    <Button type="button" onClick={nextStep} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/20">
                                        Continue
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={loading} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/30">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Analyzing Health...
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="w-5 h-5 mr-2" />
                                                Finish & Analyze
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results Display Area */}
                <div className="lg:col-span-7">
                    {!result ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                                <ClipboardList className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">AI Consultation Ready</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Complete the 4-step assessment to the left. Gemini will then process your data to predict potential health risks.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Overall Assessment */}
                            <section className="bg-white dark:bg-neutral-surface-dark rounded-3xl p-8 md:p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient"></div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Info className="w-6 h-6 text-primary" />
                                    Summary of Findings
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
                                    {result.overallAssessment}
                                </p>
                            </section>

                            {/* Predictions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.predictions.map((pred: any, idx: number) => (
                                    <div key={idx} className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">{pred.disease}</h4>
                                            <span className={cn(
                                                "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                pred.riskLevel === 'High' ? "bg-red-500 text-white" :
                                                    pred.riskLevel === 'Medium' ? "bg-amber-500 text-white" :
                                                        "bg-emerald-500 text-white"
                                            )}>
                                                {pred.riskLevel}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-4xl font-black text-primary leading-none">{pred.probability}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Level</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                                            <div className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                pred.riskLevel === 'High' ? "bg-red-500" : pred.riskLevel === 'Medium' ? "bg-amber-500" : "bg-emerald-500"
                                            )} style={{ width: pred.probability }}></div>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            "{pred.reasoning}"
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Recommendations */}
                            <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 border border-slate-800 shadow-2xl">
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                                    AI-Recommended Care Plan
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {result.suggestions.map((suggestion: string, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <p className="text-slate-300 text-sm md:text-base font-medium pt-1">
                                                {suggestion}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-dashed border-white/20">
                                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                                        {result.disclaimer}
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
