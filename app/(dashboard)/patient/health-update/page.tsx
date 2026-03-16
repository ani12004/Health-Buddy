'use client'

import { useState } from 'react'
import { getHealthUpdate } from '@/lib/actions/gemini/healthUpdate'
import { Button } from '@/components/ui/Button'
import { Sparkles, MessageSquare, Loader2, Heart, CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export default function HealthUpdatePage() {
    const [feeling, setFeeling] = useState('')
    const [response, setResponse] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!feeling.trim() || loading) return

        setLoading(true)
        setResponse(null)

        try {
            const aiResponse = await getHealthUpdate(feeling)
            setResponse(aiResponse)
            toast.success('Update received')
        } catch (error) {
            console.error('Health Update Error:', error)
            toast.error('Could not process update. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const suggestions = [
        "I'm feeling a bit tired today.",
        "I have a slight headache.",
        "I'm feeling very energetic and happy!",
        "My back is aching after work.",
        "I'm feeling stressed about my upcoming busy week."
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                    Daily Health Update
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Tell HealthBuddy how you're feeling today for empathetic advice and wellness tips.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <section className="bg-white dark:bg-neutral-surface-dark rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">
                            How are you feeling?
                        </label>
                        <textarea
                            value={feeling}
                            onChange={(e) => setFeeling(e.target.value)}
                            placeholder="e.g., I've been feeling a bit sluggish this morning and have a minor headache..."
                            className="w-full h-40 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-700 dark:text-slate-200 text-base focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setFeeling(s)}
                                className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading || !feeling.trim()} 
                        className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Get Wellness Advice
                            </>
                        )}
                    </Button>
                </section>

                {/* Response Section */}
                <section className="min-h-[400px]">
                    {!response && !loading ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <MessageSquare className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Awaiting Your Update</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                                Share your current physical or mental state to receive personalized care suggestions.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 space-y-4 bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <p className="text-slate-500 font-medium animate-pulse">Gemini is reflecting on your update...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-neutral-surface-dark rounded-[2.5rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-primary to-purple-500"></div>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">HealthBuddy's Insight</h3>
                            </div>

                            <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap italic">
                                "{response}"
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                                    <Info className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        This provides wellness guidance based on your input. It is not an alternative to professional medical advice or diagnosis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
