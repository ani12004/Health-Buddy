'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
    Brain, 
    Zap, 
    ShieldCheck, 
    BarChart3, 
    Sparkles, 
    Cpu, 
    History, 
    CheckCircle2,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function WhatsNewPage() {
    const changes = [
        {
            title: "V7 Multi-Model Ensemble",
            description: "We've upgraded our core intelligence to use a 4-model soft-voting ensemble (Neural Networks, XGBoost, HistGradientBoosting, and Logistic Regression).",
            icon: Cpu,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Explainable AI (SHAP)",
            description: "Understand the 'why' behind every risk score. Our new SHAP attribution charts show exactly which biomarkers are driving your results.",
            icon: BarChart3,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        {
            title: "Rules-Based Clinical Reasoning",
            description: "Moving beyond generic AI text, we've implemented a deterministic clinical interpretation engine that links metrics directly to medical guidelines.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Zero-Latency Performance",
            description: "All ML logic now runs locally on our optimized backend, removing dependency on external APIs and providing near-instant results.",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ]

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header section */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
                >
                    <Sparkles className="w-3 h-3" />
                    System Update v8.0.0
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Next-Gen ML Integration
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    We've rebuilt our health intelligence from the ground up to provide clinical-grade accuracy and transparent reasoning.
                </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {changes.map((change, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${change.bg} ${change.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <change.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{change.title}</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">
                            {change.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Comparison Section */}
            <div className="p-10 bg-slate-950 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Evolution of Intelligence</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6 opacity-60">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Previous (v7.x)</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm italic">
                                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                    </div>
                                    Dependent on Gemini Cloud interpreted text
                                </li>
                                <li className="flex gap-3 text-sm italic">
                                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                    </div>
                                    Standard results with simple probability
                                </li>
                                <li className="flex gap-3 text-sm italic">
                                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                    </div>
                                    3-5 second latency per request
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Current (v8.0.0)</h4>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    Autonomous Local Reasoning (No Cloud dependency)
                                </li>
                                <li className="flex gap-3 text-sm font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    4-Model Mathematical Ensemble Consensus
                                </li>
                                <li className="flex gap-3 text-sm font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    Sub-second result generation
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center gap-6">
                <Link href="/patient/ai-checkup" className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all">
                    Test the New Engine
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    Available for all patient assessments today
                </p>
            </div>
        </div>
    )
}
