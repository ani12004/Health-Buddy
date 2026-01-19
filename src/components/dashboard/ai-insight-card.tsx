'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getDailyHealthTip } from '@/app/actions';

export function AIInsightCard() {
    const [tip, setTip] = useState<string>('Consulting Health Buddy...');
    const [loading, setLoading] = useState(true);

    const fetchTip = async () => {
        setLoading(true);
        try {
            const result = await getDailyHealthTip();
            setTip(result);
        } catch (error) {
            setTip('Stay hydrated and get enough rest!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTip();
    }, []);

    return (
        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-6 h-6 text-primary" />
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    🧠
                </div>
                <h2 className="text-xl font-semibold">Gemini Insight</h2>
            </div>

            <div className="min-h-[60px]">
                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating insight...
                    </div>
                ) : (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground leading-relaxed"
                    >
                        {tip}
                    </motion.p>
                )}
            </div>

            <button
                onClick={fetchTip}
                disabled={loading}
                className="mt-4 text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh Insight
            </button>
        </div>
    );
}
