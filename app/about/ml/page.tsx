import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MLLiveMonitor } from '@/components/landing/MLLiveMonitor'

const PIPELINE_STEPS = [
  {
    title: '1) Input normalization',
    description:
      'Patient fields are standardized into a strict schema so all models receive consistent units, enum values, and feature names.',
  },
  {
    title: '2) Multi-model inference',
    description:
      'Each disease model blends multiple learners (LR, XGB, LGBM, NN, HGB, CatBoost) to avoid single-model blind spots.',
  },
  {
    title: '3) Calibration + thresholding',
    description:
      'Raw probabilities are calibrated, then converted into LOW, MODERATE, and HIGH risk buckets based on validated thresholds.',
  },
  {
    title: '4) Explainability layer',
    description:
      'Top risk drivers and protective factors are generated so users see what raised or reduced their risk estimate.',
  },
  {
    title: '5) Delivery + fallback',
    description:
      'Results are returned to the app and, if needed, can be complemented with AI explanations for readability.',
  },
]

export default function AboutMLPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8 mb-6">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">About ML</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">How Health Buddy ML Works</h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              This page teaches the full ML path end-to-end: what happens to input data, how risk is predicted, and how reliability is monitored in production.
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Benefit 1: Keep the model warm</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Periodic pings reduce cold starts and keep response times more stable for real user checkups.
                </p>
              </article>

              <article className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Benefit 2: Observe reliability live</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  The same pings capture latency, uptime, and success rates so performance issues are visible early.
                </p>
              </article>
            </div>
          </section>

          <MLLiveMonitor />

          <section className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Teaching View: What the ML side is doing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PIPELINE_STEPS.map((step) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30"
                >
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
                </article>
              ))}
            </div>

            <section className="mt-5 rounded-xl border border-slate-200/70 dark:border-slate-800 p-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Why this matters clinically</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The output is not only a risk number. It also includes confidence, calibrated probability, and feature-level evidence. This helps turn ML from a black box into a decision-support signal that is easier for users and care teams to interpret.
              </p>
            </section>

            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Back to About
              </Link>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}
