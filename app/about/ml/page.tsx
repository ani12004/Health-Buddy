import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MLLiveMonitor } from '@/components/landing/MLLiveMonitor'

const PIPELINE_STEPS = [
  {
    title: '1) Input contract + engineered features',
    description:
      'The app sends 18 core clinical fields. The ML pipeline computes engineered markers like TyG index, HOMA-IR proxy, VFI, atherogenic index, and syndrome scores.',
  },
  {
    title: '2) Disease-specific feature spaces',
    description:
      'Each disease uses its own feature space: Heart 29 features, Hypertension 22 features (BP-leakage safe), and Diabetes 25 features.',
  },
  {
    title: '3) 6 base models + stacked ensemble',
    description:
      'For every disease, 6 models run in parallel: ElasticNet LR, XGBoost (DART), LightGBM, Residual NN, HistGradientBoosting, and CatBoost. A logistic meta-learner stacks them using out-of-fold predictions.',
  },
  {
    title: '4) Calibration + F1 thresholding',
    description:
      'Probabilities are calibrated using Platt, Isotonic, and Beta calibration, then the best method is selected per disease by ECE. Decision cutoffs are F1-optimized per disease.',
  },
  {
    title: '5) Explainability + clinical language',
    description:
      'The pipeline returns risk %, confidence, model agreement, top drivers, protective factors, and guideline-style recommendations.',
  },
]

const ARCHITECTURE_BLOCKS = [
  {
    title: 'Data Layer',
    points: [
      '20 dataset sources aggregated in training notebook',
      'v10 scale target: ~1.5M+ records across sources',
      'Cross-population mix: BRFSS, NHANES, clinical and regional cohorts',
    ],
  },
  {
    title: 'Model Layer',
    points: [
      '6 base learners per disease: LR, XGB, LGBM, NN, HGB, CatBoost',
      'NN upgraded to 6-layer residual design with mixup + label smoothing',
      'XGBoost tuned with Optuna trials and early stopping',
    ],
  },
  {
    title: 'Decision Layer',
    points: [
      'Stacked logistic meta-learner trained on 5-fold OOF predictions',
      'Per-disease F1-optimal thresholds for actionable classification',
      'BP leakage assertion in hypertension pipeline for label safety',
    ],
  },
  {
    title: 'Trust Layer',
    points: [
      'Calibration reliability curves and ECE-based calibrator selection',
      'SHAP explainability with permutation fallback',
      'Clinical narrative generator for user-readable guidance',
    ],
  },
]

const EFFICIENCY_FACTS = [
  { label: 'T4 GPU Runtime', value: '~55 to 80 min' },
  { label: 'A100 Runtime', value: '~30 to 45 min' },
  { label: 'CPU Runtime', value: '~3 to 5 hrs' },
  { label: 'Expected AUC Band', value: '0.85 to 0.91' },
  { label: 'Validation Strategy', value: '5-fold stratified CV' },
  { label: 'Imbalance Handling', value: 'pos_weight + SMOTE' },
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
              This page is aligned to the v10 training notebook architecture. It explains how data becomes predictions, how efficiency is managed at scale, and how calibration and explainability keep output clinically interpretable.
            </p>

            <article className="mt-5 rounded-xl border border-amber-300/70 dark:border-amber-500/40 bg-amber-50/80 dark:bg-amber-900/20 p-4">
              <h2 className="text-sm font-extrabold text-amber-900 dark:text-amber-200 mb-1">Important Medical Note</h2>
              <p className="text-sm text-amber-800 dark:text-amber-100 leading-relaxed">
                Health Buddy provides ML-based risk predictions and educational guidance. It is not a final diagnosis, not a replacement for lab-confirmed clinical evaluation, and not an emergency service.
                For accurate diagnosis and treatment decisions, always consult a licensed in-person doctor.
              </p>
            </article>

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

          <section className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What You Are Using</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">What it does</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>Estimates risk for Heart Disease, Hypertension, and Diabetes.</li>
                  <li>Uses clinical and lifestyle inputs to generate probability-based risk levels.</li>
                  <li>Returns explainable drivers and protective factors behind each prediction.</li>
                  <li>Provides preventive suggestions to support better follow-up conversations with doctors.</li>
                </ul>
              </article>

              <article className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">What it does not do</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>Does not replace physician diagnosis, physical exams, or lab tests.</li>
                  <li>Does not prescribe medications or emergency treatment plans.</li>
                  <li>Does not guarantee certainty; all predictions have uncertainty.</li>
                  <li>Should not be used as the only basis for high-stakes medical decisions.</li>
                </ul>
              </article>
            </div>
          </section>

          <MLLiveMonitor />

          <section className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Architecture Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ARCHITECTURE_BLOCKS.map((block) => (
                <article key={block.title} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{block.title}</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    {block.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <article className="mt-5 rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Notebook Architecture Path</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                18 app inputs → engineered biomarkers → disease-specific feature matrices (29 or 22 or 25) → 6 base models → stacked meta-learner → calibrated probabilities → risk level, confidence, driver analysis, and recommendation narrative.
              </p>
            </article>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How It Works in Production</h2>

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
                The output is not only a risk number. It includes calibrated probability, model confidence, and feature-level evidence from explainability. That makes the result auditable and easier for patients and clinicians to reason about.
              </p>
            </section>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-neutral-surface-dark p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Efficiency and Performance</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EFFICIENCY_FACTS.map((item) => (
                <article key={item.label} className="rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                </article>
              ))}
            </div>

            <article className="mt-5 rounded-xl border border-slate-200/70 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-900/30">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Why this design is efficient</h3>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>GPU-first learners (XGB, LightGBM, CatBoost, PyTorch NN) reduce training time while preserving model diversity.</li>
                <li>Early stopping and capped NN sample strategy prevent unnecessary epochs on large datasets.</li>
                <li>Stacking boosts performance without depending on a single unstable model family.</li>
                <li>Live ping monitor on this page keeps inference endpoint warm and provides latency observability.</li>
              </ul>
            </article>

            <article className="mt-5 rounded-xl border border-rose-300/70 dark:border-rose-500/40 p-4 bg-rose-50/80 dark:bg-rose-900/20">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 mb-2">Clinical Safety Reminder</h3>
              <p className="text-sm text-rose-800 dark:text-rose-100 leading-relaxed">
                This system is a prediction aid and early-warning assistant. It can help prioritize follow-up, but it is not definitive medical truth.
                For accurate diagnosis, interpretation, and treatment, consult a real-world doctor.
                If symptoms are severe, worsening, or urgent, seek immediate in-person care.
              </p>
            </article>

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
