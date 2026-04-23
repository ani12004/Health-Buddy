export function AppLoadingScreen() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-light dark:bg-background-dark">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(140,43,238,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_36%)]" />

            <div className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-25" aria-hidden>
                <div className="loader-grid h-full w-full" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/65">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                        <div className="relative flex h-10 w-10 items-center justify-center">
                            <span className="loader-ping absolute inline-flex h-full w-full rounded-full bg-primary/35" />
                            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">+</span>
                        </div>
                    </div>

                    <div className="mb-5 text-center">
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Preparing Clinical Dashboard</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Syncing vitals, biomarkers, and personalized care insights...</p>
                    </div>

                    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/45" aria-hidden>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">Live Monitor</p>
                        <div className="loader-ecg-track">
                            <div className="loader-ecg-line" />
                            <div className="loader-ecg-sweep" />
                        </div>
                    </div>

                    <div className="mb-5 flex items-center justify-center gap-4" aria-hidden>
                        <span className="loader-orbit-dot loader-orbit-dot-a" />
                        <span className="loader-orbit-dot loader-orbit-dot-b" />
                        <span className="loader-orbit-dot loader-orbit-dot-c" />
                    </div>

                    <div className="space-y-2.5" aria-hidden>
                        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-700/50 dark:bg-slate-900/55">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Analyzing Cardiovascular Risk</p>
                            <div className="loader-shimmer h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
                        </div>
                        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-700/50 dark:bg-slate-900/55">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Calibrating Metabolic Markers</p>
                            <div className="loader-shimmer loader-shimmer-delay h-2.5 w-5/6 rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
                        </div>
                        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-700/50 dark:bg-slate-900/55">
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Building Personalized Suggestions</p>
                            <div className="loader-shimmer h-2.5 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
