import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MissionAwarenessContent } from '@/components/landing/MissionAwarenessContent'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <MissionAwarenessContent />

          <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What Makes Health Buddy Different</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Health Buddy focuses on preventive clarity: understandable risk explanations, practical daily actions, and better continuity between patient and doctor workflows.
              </p>
            </article>

            <article className="rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Clinical Boundary</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The platform is intended for screening support and health awareness. It does not replace emergency services, diagnosis by licensed professionals, or personalized treatment plans.
              </p>
            </article>

            <article className="rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Care Continuity Goal</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We aim to shorten the gap between first warning signs and meaningful follow-up by making risk communication easier for both users and care teams.
              </p>
            </article>
          </section>

          <section className="mt-6 rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Product Priorities</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li>Improve preventive education for chronic-risk conditions using language-aware content.</li>
              <li>Increase explainability so users can understand why a risk level is elevated.</li>
              <li>Support clinical teams with clearer summaries and better triage readiness.</li>
              <li>Maintain strong privacy and security fundamentals as the platform scales.</li>
            </ul>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}
