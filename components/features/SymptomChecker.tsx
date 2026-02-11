'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { analyzeSymptoms } from '@/lib/actions/gemini'
import { Sparkles, ArrowRight, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function SymptomChecker() {
    const [symptoms, setSymptoms] = useState('')
    const [result, setResult] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return

        setIsLoading(true)
        setResult(null)

        try {
            const data = await analyzeSymptoms(symptoms)
            setResult(data)
        } catch (error) {
            console.error(error)
            // Todo: show error toast
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none group p-8">
            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How are you feeling today?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Describe your symptoms and let AI analyze them for you.</p>

                <div className="relative mb-6">
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. I have a throbbing headache and sensitivity to light..."
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium"
                    />
                    <div className="absolute bottom-4 right-4">
                        <Button
                            onClick={handleAnalyze}
                            isLoading={isLoading}
                            disabled={!symptoms.trim()}
                            className="shadow-lg shadow-primary/20"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Symptoms
                        </Button>
                    </div>
                </div>

                {/* Result Area */}
                {result && (
                    <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                result.severity === 'High' ? "bg-red-100 text-red-600" :
                                    result.severity === 'Moderate' ? "bg-amber-100 text-amber-600" :
                                        "bg-green-100 text-green-600"
                            )}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{result.title}</h4>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-1 rounded uppercase tracking-wider",
                                        result.severity === 'High' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                            result.severity === 'Moderate' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    )}>
                                        {result.severity} Severity
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm leading-relaxed">{result.summary}</p>
                                <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    <Info className="w-4 h-4" />
                                    <span>Recommendation: {result.advice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
        </div>
    )
}
