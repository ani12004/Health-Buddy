'use client'

import { useEffect, useState } from 'react'
import { analyzeHealthData } from '@/lib/actions/gemini/checkup'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Notifications } from '@/components/layout/Notifications'
import { Brain, Activity, Heart, AlertTriangle, CheckCircle, Loader2, Info, ChevronRight, ChevronLeft, ClipboardList, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { FormFieldHelper } from '@/components/features/FormFieldHelper'
import { AILoadingAnimation } from '@/components/ui/AILoadingAnimation'

const STEPS = [
    { id: 1, title: 'Basics', description: 'Personal information' },
    { id: 2, title: 'Vitals', description: 'Physical health markers' },
    { id: 3, title: 'Lab Results', description: 'Blood & glucose levels' },
    { id: 4, title: 'Lifestyle', description: 'Habits & history' }
]

interface ClinicalFlag {
    field: string
    status: 'danger' | 'warning' | 'normal' | 'protective'
    message: string
}

function getClinicalFlags(input: any): ClinicalFlag[] {
    const flags: ClinicalFlag[] = []
    const safeNum = (v: any) => parseFloat(v) || 0

    if (safeNum(input.systolic_bp) >= 140) flags.push({ field: 'systolic_bp', status: 'danger', message: `Systolic BP critically elevated at ${input.systolic_bp} mmHg` })
    else if (safeNum(input.systolic_bp) >= 130) flags.push({ field: 'systolic_bp', status: 'warning', message: `Systolic BP above normal at ${input.systolic_bp} mmHg` })

    if (safeNum(input.diastolic_bp) >= 90) flags.push({ field: 'diastolic_bp', status: 'danger', message: `Diastolic BP critically elevated at ${input.diastolic_bp} mmHg` })
    else if (safeNum(input.diastolic_bp) >= 80) flags.push({ field: 'diastolic_bp', status: 'warning', message: `Diastolic BP above normal at ${input.diastolic_bp} mmHg` })

    if (safeNum(input.fasting_glucose) >= 126) flags.push({ field: 'fasting_glucose', status: 'danger', message: `Fasting glucose critically elevated at ${input.fasting_glucose} mg/dL` })
    else if (safeNum(input.fasting_glucose) >= 100) flags.push({ field: 'fasting_glucose', status: 'warning', message: `Fasting glucose above normal at ${input.fasting_glucose} mg/dL` })

    if (safeNum(input.hba1c) >= 6.5) flags.push({ field: 'hba1c', status: 'danger', message: `HbA1c critically elevated at ${input.hba1c}%` })
    else if (safeNum(input.hba1c) >= 5.7) flags.push({ field: 'hba1c', status: 'warning', message: `HbA1c above normal at ${input.hba1c}%` })

    if (safeNum(input.ldl) >= 160) flags.push({ field: 'ldl', status: 'danger', message: `LDL critically elevated at ${input.ldl} mg/dL` })
    else if (safeNum(input.ldl) >= 130) flags.push({ field: 'ldl', status: 'warning', message: `LDL above normal at ${input.ldl} mg/dL` })

    if (safeNum(input.hdl) < 40 && input.hdl !== '') flags.push({ field: 'hdl', status: 'danger', message: `HDL critically low at ${input.hdl} mg/dL` })
    else if (safeNum(input.hdl) < 60 && input.hdl !== '') flags.push({ field: 'hdl', status: 'warning', message: `HDL below optimal at ${input.hdl} mg/dL` })
    else if (safeNum(input.hdl) >= 60) flags.push({ field: 'hdl', status: 'protective', message: `HDL protective at ${input.hdl} mg/dL` })

    if (safeNum(input.triglycerides) >= 200) flags.push({ field: 'triglycerides', status: 'danger', message: `Triglycerides critically elevated at ${input.triglycerides} mg/dL` })
    else if (safeNum(input.triglycerides) >= 150) flags.push({ field: 'triglycerides', status: 'warning', message: `Triglycerides above normal at ${input.triglycerides} mg/dL` })

    if (safeNum(input.bmi) >= 30) flags.push({ field: 'bmi', status: 'danger', message: `BMI indicates obesity: ${input.bmi} kg/m²` })
    else if (safeNum(input.bmi) >= 25) flags.push({ field: 'bmi', status: 'warning', message: `BMI indicates overweight: ${input.bmi} kg/m²` })

    if (input.smoker === 'Yes' || input.smoker === 'Regular Smoker') flags.push({ field: 'smoker', status: 'danger', message: `Smoking significantly increases risk` })
    else if (input.smoker === 'Former' || input.smoker === 'Former Smoker') flags.push({ field: 'smoker', status: 'warning', message: 'Former smoker — residual risk remains' })

    if (input.physical_activity_level === 'Sedentary') flags.push({ field: 'physical_activity_level', status: 'danger', message: 'Sedentary lifestyle is a major independent risk factor' })
    else if (input.physical_activity_level === 'Light') flags.push({ field: 'physical_activity_level', status: 'warning', message: 'Low physical activity — exercise recommended' })
    else if (input.physical_activity_level === 'Active' || input.physical_activity_level === 'Very Active') flags.push({ field: 'physical_activity_level', status: 'protective', message: `${input.physical_activity_level} lifestyle is protective` })

    return flags
}

function formatFeatureName(feature: string): string {
    const nameMap: Record<string, string> = {
        'systolic_bp': 'Systolic BP',
        'diastolic_bp': 'Diastolic BP',
        'pulse_pressure': 'Pulse Pressure',
        'heart_rate': 'Heart Rate',
        'total_cholesterol': 'Total Cholesterol',
        'ldl': 'LDL Cholesterol',
        'hdl': 'HDL Cholesterol',
        'triglycerides': 'Triglycerides',
        'fasting_glucose': 'Fasting Glucose',
        'hba1c': 'HbA1c',
        'bmi': 'BMI',
        'waist': 'Waist Circumference',
        'age': 'Age',
        'sex': 'Sex',
        'smoking': 'Smoking Status',
        'activity': 'Physical Activity',
        'stress': 'Stress Level',
        'salt_intake': 'Salt Intake',
        'history': 'Medical History',
        'chol_hdl_ratio': 'Cholesterol/HDL Ratio',
        'glucose_bmi_index': 'Glucose-BMI Index'
    }
    return nameMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function AICheckupPage() {
    const ANALYZE_COOLDOWN_SECONDS = 120
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [cooldown, setCooldown] = useState(0)
    const [language, setLanguage] = useState('English')

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

    const flags = getClinicalFlags(formData)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => {
            setCooldown(prev => Math.max(prev - 1, 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [cooldown])

    const formatCooldown = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const handleAnalyze = async () => {
        if (loading || currentStep !== 4) return
        if (cooldown > 0) {
            toast.warning(`Please wait ${formatCooldown(cooldown)} before next AI checkup.`)
            return
        }

        setLoading(true)
        setResult(null)
        try {
            const res = await analyzeHealthData(formData, language)
            if (res.error) {
                toast.error(res.error)
                if (res.error.toLowerCase().includes('rate limit') || res.error.toLowerCase().includes('quota')) {
                    setCooldown(ANALYZE_COOLDOWN_SECONDS)
                    toast.warning('Gemini is rate-limited. Please wait 2 minutes, then try again.')
                }
                return
            }
            setResult(res.data)
            toast.success('Analysis complete')
            setCooldown(ANALYZE_COOLDOWN_SECONDS)
            toast.info('Please wait 2 minutes before the next AI checkup to avoid API rate limits.')
        } catch (error: any) {
            toast.error('System error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary" />
                        AI Health Checkup
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Professional health assessment.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                            <div className="flex items-center gap-1 px-3 py-2 border-r border-slate-200 dark:border-slate-800 mr-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Language
                                </span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto max-w-[400px] no-scrollbar py-0.5 px-0.5">
                                {[
                                    'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 
                                    'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Assamese', 
                                    'Odia', 'Urdu', 'Kashmiri'
                                ].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 flex items-center justify-center min-w-[80px]",
                                            language === lang 
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-full bg-gradient-to-l from-slate-100 dark:from-[#1a1c2e] to-transparent pointer-events-none rounded-r-2xl" />
                        </div>
                    </div>
                    <Notifications />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6">
                    {loading ? (
                        <div className="bg-white dark:bg-neutral-surface-dark rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[500px] flex items-center justify-center">
                            <AILoadingAnimation />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-neutral-surface-dark rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                            <div className="flex justify-between mb-8 relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-0"></div>
                                {STEPS.map((step) => (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                                            currentStep >= step.id ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        )}>
                                            {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                                <div className="min-h-[320px]">
                                    {currentStep === 1 && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <h3 className="font-bold text-xl">The Basics</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Age</label>
                                                    <Input name="age" type="number" value={formData.age} onChange={handleChange} required />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Gender</label>
                                                    <select name="sex" value={formData.sex} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border rounded-2xl px-4 h-12 w-full outline-none">
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <FormFieldHelper label="BMI" name="bmi" value={formData.bmi} onChange={handleChange} calculatorType="bmi" placeholder="BMI" />
                                            <FormFieldHelper 
                                                label="Waist (cm)" 
                                                name="waist_circumference" 
                                                value={formData.waist_circumference} 
                                                onChange={handleChange} 
                                                calculatorType="waist-height" 
                                                placeholder="Waist" 
                                                description="Measures central adiposity. A healthy ratio (Waist/Height) is usually below 0.5."
                                            />
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <h3 className="font-bold text-xl">Vitals</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Systolic BP</label>
                                                    <Input name="systolic_bp" placeholder="Systolic" value={formData.systolic_bp} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Diastolic BP</label>
                                                    <Input name="diastolic_bp" placeholder="Diastolic" value={formData.diastolic_bp} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Heart Rate</label>
                                                <Input name="resting_heart_rate" value={formData.resting_heart_rate} onChange={handleChange} placeholder="BPM" />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <h3 className="font-bold text-xl">Labs</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Total Chol</label>
                                                    <Input name="total_cholesterol" placeholder="Total Chol" value={formData.total_cholesterol} onChange={handleChange} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Triglycerides</label>
                                                    <Input name="triglycerides" placeholder="Triglycerides" value={formData.triglycerides} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormFieldHelper label="LDL" name="ldl" value={formData.ldl} onChange={handleChange} calculatorType="ldl" />
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">HDL</label>
                                                    <Input name="hdl" value={formData.hdl} onChange={handleChange} placeholder="HDL" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase">HbA1c</label>
                                                <Input name="hba1c" value={formData.hba1c} onChange={handleChange} placeholder="HbA1c" />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <h3 className="font-bold text-xl">Lifestyle</h3>
                                            <select name="smoker" value={formData.smoker} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border rounded-2xl px-4 h-12 w-full">
                                                <option value="No">Non-Smoker</option>
                                                <option value="Yes">Smoker</option>
                                            </select>
                                            <select name="physical_activity_level" value={formData.physical_activity_level} onChange={handleChange} className="bg-slate-50 dark:bg-white/5 border rounded-2xl px-4 h-12 w-full">
                                                <option value="Sedentary">Sedentary</option>
                                                <option value="Light">Light</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Active">Active</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    {currentStep > 1 && (
                                        <Button type="button" variant="ghost" onClick={prevStep} className="flex-1 h-14 rounded-2xl">Back</Button>
                                    )}
                                    {currentStep < 4 ? (
                                        <Button type="button" onClick={nextStep} className="flex-[2] h-14 rounded-2xl">Continue</Button>
                                    ) : (
                                        <Button type="button" onClick={handleAnalyze} disabled={loading || cooldown > 0} className="flex-[2] h-14 rounded-2xl">
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Activity className="mr-2" />}
                                            {cooldown > 0 ? `Wait ${formatCooldown(cooldown)}` : 'Analyze'}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-7">
                    {!result ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed">
                            <ClipboardList className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold">Waiting for Data</h3>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {result.healthScore && (
                                <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Health Score</h3>
                                        <div className="text-5xl font-black text-primary">{result.healthScore}<span className="text-lg text-slate-400">/100</span></div>
                                    </div>
                                    <Zap className="w-12 h-12 text-primary opacity-50" />
                                </div>
                            )}

                            <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-all duration-700" />
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                       <Info className="text-primary w-5 h-5" />
                                    </div>
                                    Clinical Summary
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-bold text-lg italic pr-4">
                                    "{result.overallAssessment}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                {result.predictions.map((pred: any, i: number) => (
                                    <div key={i} className="bg-white dark:bg-neutral-surface-dark p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="font-black text-2xl text-slate-900 dark:text-white mb-1">{pred.disease}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", pred.riskLevel === 'High' ? "bg-red-500" : pred.riskLevel === 'Medium' ? "bg-amber-500" : "bg-emerald-500")} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{pred.riskLevel} Clinical Risk</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl font-black text-primary leading-none mb-1">{pred.probability}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Probability Score</div>
                                                </div>
                                            </div>

                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                                                <div 
                                                    className={cn(
                                                        "h-full transition-all duration-1000 ease-out rounded-full",
                                                        pred.riskLevel === 'High' ? "bg-red-500" : pred.riskLevel === 'Medium' ? "bg-amber-500" : "bg-primary"
                                                    )} 
                                                    style={{ width: pred.probability }} 
                                                />
                                            </div>

                                            {pred.summaryParagraph && (
                                                <div className="mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                        {pred.summaryParagraph}
                                                    </p>
                                                </div>
                                            )}

                                            {pred.precautions && pred.precautions.length > 0 && (
                                                <div className="space-y-4">
                                                    <h5 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-2">
                                                        <Shield className="w-4 h-4" />
                                                        Clinical Precautions
                                                    </h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {pred.precautions.map((p: string, idx: number) => (
                                                            <div key={idx} className="flex gap-3 p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug">{p}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {pred.topRiskDrivers && pred.topRiskDrivers.length > 0 && (
                                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                                    <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-2">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        Risk Driver Breakdown
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {pred.topRiskDrivers.slice(0, 3).map((driver: any, idx: number) => (
                                                            <div key={idx} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{driver.label}</span>
                                                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md italic">HIGH IMPACT</span>
                                                                </div>
                                                                {driver.reason && <p className="text-[11px] text-slate-500 italic leading-snug">{driver.reason}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
