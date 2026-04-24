type Loader3DProps = {
  title?: string
  subtitle?: string
  compact?: boolean
}

export function Loader3D({
  title = 'Preparing your workspace',
  subtitle = 'Rendering secure health modules and syncing context...',
  compact = false,
}: Loader3DProps) {
  return (
    <div className={`relative flex w-full items-center justify-center px-6 ${compact ? 'min-h-[72vh]' : 'min-h-screen'}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.1),transparent_34%),radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.12),transparent_45%)]" />

      <div className={`loader-crystal-shell relative z-10 w-full ${compact ? 'max-w-xl' : 'max-w-2xl'} rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70 ${compact ? 'md:p-8' : 'md:p-10'}`}>
        <div className="mb-6 flex items-center justify-center" aria-hidden>
          <div className="loader-orbit-3d">
            <div className="loader-ring loader-ring-a" />
            <div className="loader-ring loader-ring-b" />
            <div className="loader-ring loader-ring-c" />
            <div className="loader-core" />
          </div>
        </div>

        <div className="text-center">
          <h2 className={`font-black tracking-tight text-slate-900 dark:text-white ${compact ? 'text-2xl' : 'text-3xl'}`}>{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-300">{subtitle}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3" aria-hidden>
          <StatusTile label="Pipeline" value="INITIALIZING" />
          <StatusTile label="Data Channels" value="SYNCING" />
          <StatusTile label="Render Engine" value="READYING" />
        </div>
      </div>
    </div>
  )
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/40">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="loader-pulse-dot" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </article>
  )
}
