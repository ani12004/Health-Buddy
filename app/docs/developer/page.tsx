import { Code, Terminal, Layers, Database, Lock, Server } from 'lucide-react'

export default function DeveloperDocsPage() {
  return (
    <article className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="flex items-center gap-3 text-purple-500 font-bold tracking-widest uppercase text-xs">
          <Code className="w-4 h-4" />
          Technical Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
          Health Buddy <span className="text-purple-500 italic">Developer</span> Guide
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Everything technical a developer needs to know about the Health Buddy AI architecture and implementation.
        </p>
      </div>

      {/* Tech Stack */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Terminal className="w-6 h-6 text-purple-500" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Frontend", val: "Next.js 16 (Turbopack)" },
            { label: "Auth", val: "Supabase SSR" },
            { label: "Database", val: "Supabase (Postgres)" },
            { label: "AI", val: "Gemini 2.5 Flash" },
            { label: "Styling", val: "Tailwind CSS 4" },
            { label: "Animations", val: "Framer Motion" }
          ].map((tech, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 transition-hover hover:border-purple-500/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tech.label}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{tech.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-500" />
          Project Architecture
        </h2>
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed border border-slate-800 overflow-x-auto">
            <pre>
{`/app         # App Router pages & layouts
/components  # Reusable UI & Feature components
/lib         # Services, Utils & Server Actions
  /supabase  # Auth, Middleware & DB configuration
  /actions   # AI & Database mutations
/docs        # Documentation source
/hooks       # Custom React state logic`}
            </pre>
          </div>
        </div>
      </section>

      {/* Authentication & Database */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-500" />
            Security & Auth
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Authentication is handled natively by Supabase SSR. Route protection is managed via <code className="text-primary font-bold">middleware.ts</code> which performs session validation and role-based navigation.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="w-5 h-5 text-green-500" />
            Database Design
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Uses a Postgres schema with Row Level Security (RLS). A custom SQL trigger <code className="text-primary font-bold">on_auth_user_created</code> ensures profile synchronization across tables immediately upon registration.
          </p>
        </section>
      </div>

      {/* AI Implementation */}
      <section className="space-y-6 bg-purple-50 dark:bg-purple-900/10 p-8 rounded-3xl border border-purple-200 dark:border-purple-800/50">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Server className="w-6 h-6 text-purple-600" />
          AI & LLM Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
          The symptom analysis leverages **Gemini 2.5 Flash** for its low-latency and high-accuracy structured output. We use custom system prompts to force strict JSON responses, ensuring predictable data handling on the frontend.
        </p>
        <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
          <p className="text-xs font-mono text-purple-600 dark:text-purple-400 italic font-medium">
            "Detect the language of the patient's symptoms and provide all field values in that same language..."
          </p>
        </div>
      </section>

      {/* Development Commands */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quick Start Commands</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Dev Server</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run dev</code>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Build Project</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run build</code>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Lint Check</p>
            <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded">npm run lint</code>
          </div>
        </div>
      </section>
    </article>
  )
}
