'use client'

import { useState } from 'react'
import { analyzeHealthData } from '@/lib/actions/gemini/checkup'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Notifications } from '@/components/layout/Notifications'
import { Brain, Activity, Heart, AlertTriangle, CheckCircle, Loader2, Info, ChevronRight, ChevronLeft, ClipboardList, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

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

// Helper to beautify ML feature names for display
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
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [cooldown, setCooldown] = useState(0)

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
    const getFieldFlag = (field: string) => flags.find(f => f.field === field)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const handleAnalyze = async () => {
        if (loading || cooldown > 0 || currentStep !== 4) return
        
        setLoading(true)
        setResult(null)

        try {
            console.log('Sending health data to AI...')
            const result = await analyzeHealthData(formData)
            console.log('AI Response:', result)
            
            if (result.error) {
                toast.error(result.error)
                if (result.error.toLowerCase().includes('rate limit')) {
                    setCooldown(30)
                    const timer = setInterval(() => {
                        setCooldown(prev => {
                            if (prev <= 1) {
                                clearInterval(timer)
                                return 0
                            }
                            return prev - 1
                        })
                    }, 1000)
                }
                return
            }

            setResult(result.data)
            toast.success('Analysis complete')
        } catch (error: any) {
            console.error('Analyze Error:', error)
            toast.error('A system error occurred. Please try again.')
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
                        Professional health assessment powered by Gemini AI.
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

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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

                            {/* Live Clinical Flags Feed */}
                            {flags.length > 0 && currentStep > 1 && (
                                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-bold text-xs uppercase tracking-wider">
                                        <AlertTriangle className="w-4 h-4" />
                                        Clinical Observations
                                    </div>
                                    <div className="space-y-1">
                                        {flags.slice(0, 3).map((flag, i) => (
                                            <div key={i} className={cn(
                                                "text-[11px] font-medium leading-tight flex items-start gap-1.5",
                                                flag.status === 'danger' ? "text-red-600 dark:text-red-400" :
                                                flag.status === 'warning' ? "text-amber-600 dark:text-amber-400" :
                                                "text-emerald-600 dark:text-emerald-400"
                                            )}>
                                                • {flag.message}
                                            </div>
                                        ))}
                                        {flags.length > 3 && (
                                            <div className="text-[10px] text-amber-500/70 font-bold ml-3">
                                                + {flags.length - 3} more markers detected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                    <Button type="button" onClick={handleAnalyze} disabled={loading || cooldown > 0} className="flex-[2] h-14 rounded-2xl shadow-xl shadow-primary/30">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Analyzing Health...
                                            </>
                                        ) : cooldown > 0 ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Retry in {cooldown}s
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
                            {/* Health Score Card */}
                            {result.healthScore > 0 && (
                                <section className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 dark:from-primary/20 dark:via-purple-500/20 dark:to-primary/10 rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Overall Health Score</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className={cn(
                                                    "text-6xl font-black",
                                                    result.healthScore >= 70 ? "text-emerald-500" : result.healthScore >= 50 ? "text-amber-500" : "text-red-500"
                                                )}>{result.healthScore}</span>
                                                <span className="text-2xl font-bold text-slate-400">/100</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                                {result.healthScore >= 70 ? 'Good health indicators' : result.healthScore >= 50 ? 'Moderate risk factors detected' : 'Multiple risk factors require attention'}
                                            </p>
                                        </div>
                                        {/* Circular Progress Indicator */}
                                        <div className="relative w-28 h-28">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                {/* Background circle */}
                                                <circle
                                                    cx="50" cy="50" r="42"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    className="text-slate-200 dark:text-slate-700"
                                                />
                                                {/* Progress circle */}
                                                <circle
                                                    cx="50" cy="50" r="42"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${result.healthScore * 2.64} 264`}
                                                    className={cn(
                                                        "transition-all duration-1000",
                                                        result.healthScore >= 70 ? "text-emerald-500" : result.healthScore >= 50 ? "text-amber-500" : "text-red-500"
                                                    )}
                                                />
                                            </svg>
                                            {/* Center icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-full flex items-center justify-center",
                                                    result.healthScore >= 70 ? "bg-emerald-100 dark:bg-emerald-900/30" : result.healthScore >= 50 ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"
                                                )}>
                                                    <Zap className={cn("w-7 h-7", result.healthScore >= 70 ? "text-emerald-600 dark:text-emerald-400" : result.healthScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

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

                            {/* Predictions with SHAP Drivers */}
                            <div className="space-y-4">
                                {result.predictions.map((pred: any, idx: number) => (
                                    <div key={idx} className="bg-white dark:bg-neutral-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-all duration-300 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{pred.disease}</h4>
                                                {pred.confidence > 0 && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <BarChart3 className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Model Agreement: {pred.confidence.toFixed(0)}%</span>
                                                    </div>
                                                )}
                                            </div>
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

                                        {/* ML Summary */}
                                        {pred.summaryParagraph && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 border-l-2 border-primary/30 pl-3">
                                                {pred.summaryParagraph}
                                            </p>
                                        )}

                                        {/* SHAP Drivers Grid */}
                                        <div className="grid grid-cols-2 gap-3 mt-4">
                                            {/* Risk Drivers */}
                                            {pred.topRiskDrivers && pred.topRiskDrivers.length > 0 && (
                                                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 border border-red-100 dark:border-red-900/20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <TrendingUp className="w-4 h-4 text-red-500" />
                                                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Risk Drivers</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {pred.topRiskDrivers.slice(0, 4).map((driver: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatFeatureName(driver.feature)}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-12 h-1.5 bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(driver.shap * 100, 100)}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Protective Factors */}
                                            {pred.protectiveFactors && pred.protectiveFactors.length > 0 && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Shield className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Protective</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {pred.protectiveFactors.slice(0, 4).map((factor: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatFeatureName(factor.feature)}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-12 h-1.5 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(factor.shap * 100, 100)}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Individual Model Predictions */}
                                        {pred.individualModels && Object.keys(pred.individualModels).length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ensemble Model Breakdown</span>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {Object.entries(pred.individualModels).map(([model, prob]: [string, any]) => (
                                                        <div key={model} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{model.toUpperCase()}</span>
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{prob.toFixed(1)}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
