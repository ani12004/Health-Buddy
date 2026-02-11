'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Loader2, ClipboardCheck } from 'lucide-react';
import { analyzeSymptoms } from '@/app/actions';

export function HealthCheckupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!symptoms) return;
        setLoading(true);
        try {
            const analysis = await analyzeSymptoms(symptoms);
            setResult(analysis);
        } catch (error) {
            setResult("Unable to analyze at this moment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setSymptoms('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={reset}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-3xl shadow-xl p-6 z-50 border border-border"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Activity />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">AI Health Checkup</h2>
                            </div>
                            <button
                                onClick={reset}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {!result ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Describe your symptoms in detail. Health Buddy will analyze them and provide guidance.
                                </p>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder="E.g., I have a mild headache and feel tired..."
                                    className="w-full h-32 p-4 rounded-xl bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 resize-none outline-none text-foreground placeholder:text-muted-foreground/70"
                                />
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !symptoms}
                                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <ClipboardCheck />}
                                    Analyze Symptoms
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-xl text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto text-foreground border border-border/50">
                                    {result}
                                </div>
                                <button
                                    onClick={reset}
                                    className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
