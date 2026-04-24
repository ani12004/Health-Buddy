import {
  Braces,
  CheckCircle2,
  Code,
  Database,
  FileCode2,
  KeyRound,
  Layers,
  Lock,
  Network,
  Route,
  Server,
  Terminal,
  Wand2,
} from 'lucide-react'

const TECH_STACK = [
  { label: 'Framework', value: 'Next.js 16.1.6 (App Router)' },
  { label: 'UI Runtime', value: 'React 19.2.3 + TypeScript 5' },
  { label: 'Styling', value: 'Tailwind CSS 4 + custom utility tokens' },
  { label: 'Auth', value: 'Supabase SSR auth + cookie session sync' },
  { label: 'Database', value: 'Supabase PostgreSQL with RLS policies' },
  { label: 'AI (LLM)', value: 'Gemini family via @google/generative-ai' },
  { label: 'ML Service', value: 'FastAPI on Hugging Face Space (v10 ensemble)' },
  { label: 'Notifications', value: 'Sonner toast + DB notifications table' },
  { label: 'Icons', value: 'Lucide React' },
  { label: 'Animation', value: 'Framer Motion + Tailwind animation classes' },
]

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/onboarding',
  '/features',
  '/how-it-works',
  '/security',
  '/enterprise',
  '/customer-stories',
  '/about',
  '/careers',
  '/press',
  '/contact',
  '/privacy',
  '/terms',
  '/hipaa',
  '/docs',
  '/docs/*',
]

const PATIENT_PAGES = [
  '/patient/dashboard',
  '/patient/profile',
  '/patient/medical-reports',
  '/patient/medical-reports/[id]',
  '/patient/appointments',
  '/patient/medications',
  '/patient/chat',
  '/patient/ai-checkup',
  '/patient/assessment',
  '/patient/health-update',
  '/patient/settings',
  '/patient/whats-new',
]

const DOCTOR_PAGES = [
  '/doctor/dashboard',
  '/doctor/patients',
  '/doctor/patients/[id]',
  '/doctor/appointments',
  '/doctor/analytics',
  '/doctor/settings',
]

const ACTION_METHODS = [
  {
    group: 'Auth and Profile Actions',
    methods: [
      'syncUser()',
      "updateUserRole(role: 'patient' | 'doctor')",
      'updateAvatarUrl(url: string)',
      'updateProfile(data: any)',
    ],
  },
  {
    group: 'Appointment and Medication Actions',
    methods: [
      'createAppointment(data)',
      "updateAppointmentStatus(id, status: 'scheduled' | 'completed' | 'cancelled')",
      'issuePrescription(data)',
      "updatePrescriptionStatus(id, status: 'completed' | 'discontinued')",
    ],
  },
  {
    group: 'Report and Notification Actions',
    methods: [
      'getPatientReports()',
      'shareReportWithDoctor(reportId, doctorId)',
      'getReportById(id)',
      'getNotifications()',
      'markNotificationAsRead(id)',
      "createNotification(userId, message, type: 'info' | 'alert' | 'success')",
    ],
  },
  {
    group: 'Chat and Feedback Actions',
    methods: [
      "saveMessage(content, role: 'user' | 'ai', sessionId)",
      'getChatMessages(sessionId)',
      'getLatestCheckupResult()',
      'submitMLFeedback(data)',
      'getDoctors()',
    ],
  },
  {
    group: 'Gemini and ML Bridge Actions',
    methods: [
      'analyzeSymptoms(symptoms)',
      'chatWithAI(userMessage, checkupResults, history)',
      'getHealthUpdate(userFeeling)',
      'analyzeHealthWithGemini(input, language)',
      'explainMLWithGemini(input, mlResults, language)',
      'generateWithModelFallback(apiKey, prompt)',
      'runMLBridge(input)',
      'checkMLHealth()',
      'analyzeHealthData(data, language)',
      'getReportPDFData(reportId)',
      'analyzeHealth(input)',
    ],
  },
]

const ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'ML_API_URL (optional override, defaults to HF Space URL)',
  'GEMINI_MODEL_CANDIDATES (optional comma-separated fallback order)',
]

const SYSTEM_ARCH_DIAGRAM = `flowchart TB
  A[Client UI\napp/* + components/*] --> B[Middleware\nmiddleware.ts]
  B --> C[Supabase Session\nupdateSession()]
  B --> D[Server Actions\nlib/actions/*]
  D --> E[Gemini Layer\nlib/actions/gemini/*]
  D --> F[ML Bridge\nlib/actions/ml/bridge.ts]
  F --> G[ML API\nFastAPI /predict]
  D --> H[Supabase Postgres\nreports, chats, assessments]
  E --> H
  G --> D`

const CHECKUP_SEQUENCE_DIAGRAM = `sequenceDiagram
  participant U as User
  participant UI as AI Checkup Page
  participant SA as analyzeHealthData
  participant ML as ML Bridge /predict
  participant GM as Gemini Fallback
  participant DB as Supabase DB

  U->>UI: Submit checkup form + language
  UI->>SA: Server action call
  SA->>ML: Run ML inference
  alt ML success
    ML-->>SA: Risks + factors + score
    SA->>GM: Optional explain/localize
    GM-->>SA: Enriched narrative
  else ML failure
    SA->>GM: Full Gemini assessment
    GM-->>SA: Risk JSON fallback
  end
  SA->>DB: Insert assessment + report
  SA-->>UI: Unified response payload`

export default function DeveloperDocsPage() {
  return (
    <article className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="flex items-center gap-3 text-purple-500 font-bold tracking-widest uppercase text-xs">
          <Code className="w-4 h-4" />
          Technical Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
          Health Buddy <span className="text-purple-500 italic">Developer</span> Reference
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          End-to-end implementation reference from website routing and dashboard flows to Gemini orchestration,
          ML bridge integration, persistence, and report generation.
        </p>
      </header>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Terminal className="w-6 h-6 text-purple-500" />
          Full Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.label}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tech.label}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{tech.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-500" />
          Architecture Layers
        </h2>
        <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed border border-slate-800 overflow-x-auto">
          <pre>
{`Client Layer
  app/* + components/* + hooks/*
  - Landing, docs, patient, doctor experiences

Routing/Auth Layer
  middleware.ts + lib/supabase/middleware.ts
  - Session validation
  - Public/private route gating
  - Role redirection rules

Server Action Layer (Business Logic)
  lib/actions/*
  - Appointments, reports, notifications, chat, profile
  - Gemini orchestration and ML fallback logic

AI/ML Layer
  lib/actions/gemini/*
  lib/actions/ml/bridge.ts
  - LLM prompts, response parsing, model fallback
  - FastAPI ML inference bridge (/predict, /health)

Data Layer
  Supabase Postgres + Auth
  - profiles, reports, appointments, prescriptions, notifications, chats, health_assessments`}
          </pre>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Network className="w-6 h-6 text-violet-500" />
          Architecture Diagrams
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          These diagrams document the real implementation path from browser request through middleware, server actions,
          AI and ML services, and persistence.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">System Flow Diagram</h3>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{SYSTEM_ARCH_DIAGRAM}</pre>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">AI Checkup Request Sequence</h3>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{CHECKUP_SEQUENCE_DIAGRAM}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Route className="w-6 h-6 text-emerald-500" />
          Route Inventory and Access Policy
        </h2>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Public Routes (No Login Required)</h3>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_ROUTES.map((route) => (
              <span
                key={route}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              >
                {route}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Patient Dashboard Routes</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {PATIENT_PAGES.map((route) => (
                <li key={route}>{route}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Doctor Dashboard Routes</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {DOCTOR_PAGES.map((route) => (
                <li key={route}>{route}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Lock className="w-6 h-6 text-rose-500" />
          Authentication and Security Flow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Request Path</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Every request enters <code className="font-mono">middleware.ts</code>, which calls
              <code className="font-mono"> updateSession()</code> from <code className="font-mono">lib/supabase/middleware.ts</code>
              to attach and refresh auth cookies.
            </p>
          </div>
          <div className="rounded-2xl p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Role Gate</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              User metadata role (<code className="font-mono">patient</code> or <code className="font-mono">doctor</code>)
              determines route eligibility. Incorrect role access redirects to the matching dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Braces className="w-6 h-6 text-indigo-500" />
          Complete Server Action Method Catalog
        </h2>
        <div className="space-y-4">
          {ACTION_METHODS.map((group) => (
            <div key={group.group} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{group.group}</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside font-mono">
                {group.methods.map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 bg-purple-50 dark:bg-purple-900/10 p-8 rounded-3xl border border-purple-200 dark:border-purple-800/50">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Wand2 className="w-6 h-6 text-purple-600" />
          Site-to-ML Execution Pipeline
        </h2>
        <ol className="space-y-4 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
          <li>
            UI submits AI Checkup form from <code className="font-mono">/patient/ai-checkup</code> with selected language.
          </li>
          <li>
            <code className="font-mono">analyzeHealthData(data, language)</code> normalizes field names and enum values for ML schema.
          </li>
          <li>
            <code className="font-mono">runMLBridge()</code> calls external ML API <code className="font-mono">POST /predict</code>.
          </li>
          <li>
            If ML fails, flow falls back to <code className="font-mono">analyzeHealthWithGemini()</code>.
          </li>
          <li>
            For non-English selections, Gemini localization path is attempted first; if malformed, deterministic language pack fallback is applied.
          </li>
          <li>
            For English responses with sparse explainability, <code className="font-mono">explainMLWithGemini()</code> enriches risk drivers/precautions.
          </li>
          <li>
            Output is transformed into unified UI contract: health score, predictions, reasons, recommendations, and disclaimer.
          </li>
          <li>
            If authenticated, data is persisted to <code className="font-mono">health_assessments</code> and then to
            <code className="font-mono"> reports</code> (type <code className="font-mono">ai-checkup</code>).
          </li>
        </ol>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Network className="w-6 h-6 text-cyan-500" />
          ML Contract (Bridge Layer)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Inference Endpoints</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              <li><code className="font-mono">GET /health</code> - health probe</li>
              <li><code className="font-mono">POST /predict</code> - 3-disease prediction payload</li>
              <li>Default base URL is configured in <code className="font-mono">ML_API_URL</code> fallback</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Core Input Schema</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ML bridge expects 18 explicit fields including vitals, lipids, glucose markers, and lifestyle enums.
              Strong typing is declared in <code className="font-mono">MLInput</code> in
              <code className="font-mono"> lib/actions/ml/bridge.ts</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Server className="w-6 h-6 text-orange-500" />
          Gemini Integration Details
        </h2>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-900 dark:text-white mb-2">Model Fallback Strategy</p>
            <p>
              <code className="font-mono">generateWithModelFallback()</code> iterates model candidates from
              <code className="font-mono"> GEMINI_MODEL_CANDIDATES</code> or built-in defaults until one succeeds.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-900 dark:text-white mb-2">Structured Parsing Rule</p>
            <p>
              Gemini text responses are sanitized by extracting substring from first <code className="font-mono">{'{'}</code>
              to last <code className="font-mono">{'}'}</code> and parsing JSON. Errors return resilient fallback messages.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-900 dark:text-white mb-2">Prompting Modes</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Symptom triage prompt with language detection and strict JSON key constraints.</li>
              <li>Full health assessment prompt for 3-condition risk JSON output.</li>
              <li>Explainability prompt to produce risk drivers, reasons, and precautions.</li>
              <li>Companion chat prompt optionally injected with latest checkup numbers.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Database className="w-6 h-6 text-green-500" />
          Data Model and Persistence Surfaces
        </h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li><code className="font-mono">profiles</code> - role, identity metadata, avatar and account profile.</li>
            <li><code className="font-mono">appointments</code> - doctor/patient scheduling and status lifecycle.</li>
            <li><code className="font-mono">prescriptions</code> - medication issuance and completion/discontinued status.</li>
            <li><code className="font-mono">notifications</code> - actionable alert stream for each user.</li>
            <li><code className="font-mono">reports</code> - generated AI/ML outputs with content JSON payload.</li>
            <li><code className="font-mono">health_assessments</code> - normalized probabilities, inputs, explanations.</li>
            <li><code className="font-mono">chats</code> - conversational messages by session id.</li>
            <li><code className="font-mono">ml_feedback</code> - post-assessment quality feedback.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <KeyRound className="w-6 h-6 text-fuchsia-500" />
          Environment Configuration
        </h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside font-mono">
            {ENV_VARS.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FileCode2 className="w-6 h-6 text-sky-500" />
          API Routes and Report Generation
        </h2>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            API route <code className="font-mono">GET /api/reports/[id]/pdf</code> validates auth and serves a generated
            PDF for authorized users. Access is restricted to the owning patient or the assigned doctor. The data
            pre-shaping method <code className="font-mono">getReportPDFData(reportId)</code> remains available for
            template pipelines.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-lime-500" />
          Developer Commands and Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Development</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run dev</code>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Production Build</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run build</code>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Code Quality</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run lint</code>
          </div>
        </div>
      </section>
    </article>
  )
}
