'use client'

import { AlertTriangle, Clock } from 'lucide-react'

export function CriticalAlerts() {
    return (
        <div className="bg-white dark:bg-neutral-surface-dark rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Critical Alerts
                </h3>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400">3 New</span>
            </div>

            <div className="space-y-4">
                {/* Alert Item */}
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">James Rodriquez</span>
                        <span className="text-[10px] text-red-500 font-bold bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">HIGH PRIORITY</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        Abnormal heart rhythm detected. Heart rate exceeding 140bpm for 5 mins.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>2 mins ago</span>
                    </div>
                </div>

                {/* Alert Item 2 */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Michael Chen</span>
                        <span className="text-[10px] text-amber-500 font-bold bg-white dark:bg-black/20 px-1.5 py-0.5 rounded">Warning</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                        Skipped daily insulin log for 2 days consecutively.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>2 hours ago</span>
                    </div>
                </div>
            </div>

            <button className="w-full mt-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                View All Alerts
            </button>
        </div>
    )
}
