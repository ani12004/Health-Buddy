import { FileText, Clock, User, Shield, CheckCircle2 } from 'lucide-react'

export default function GeneralDocsPage() {
  return (
    <article className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="space-y-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="flex items-center gap-3 text-primary font-bold tracking-widest uppercase text-xs">
          <FileText className="w-4 h-4" />
          General Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1]">
          Health Buddy AI - General <span className="text-primary italic">Overview</span>
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Reading time: 4 mins
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Last Updated: March 2026
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Verified Content
          </div>
        </div>
      </div>

      {/* Intro */}
      <section className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Health Buddy AI is a modern, AI-powered health companion designed to provide instant symptom analysis, health insights, and a seamless connection between patients and doctors.
        </p>
      </section>

      {/* Purpose */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          Purpose
        </h2>
        <div className="p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            The primary goal of Health Buddy AI is to simplify healthcare management by using advanced AI models (Google Gemini) to help users understand their symptoms and maintain a direct line of communication with healthcare providers.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patients Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              For Patients
            </h3>
            <ul className="space-y-4">
              {[
                { title: "AI Symptom Checker", desc: "Enter symptoms and receive instant analysis." },
                { title: "Appointment Management", desc: "Schedule and track health professional visits." },
                { title: "Medication Tracking", desc: "Digital records of active prescriptions." },
                { title: "AI Companion", desc: "24/7 health chat interface for general advice." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 border border-primary/50 flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctors Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-blue-500 flex items-center gap-2">
              For Doctors
            </h3>
            <ul className="space-y-4">
              {[
                { title: "Patient Management", desc: "Detailed medical history and reports access." },
                { title: "Digital Prescriptions", desc: "Manage patient meds directly on the platform." },
                { title: "Clinical Dashboard", desc: "Real-time overview of schedules and activity." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 flex-shrink-0 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-primary rounded-3xl p-10 text-white overflow-hidden relative group">
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-bold text-lg underline underline-offset-8 decoration-white/30">Simplicity</h3>
              <p className="text-sm text-white/80 leading-relaxed">A clean, intuitive interface for stress-free interaction.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg underline underline-offset-8 decoration-white/30">Accessibility</h3>
              <p className="text-sm text-white/80 leading-relaxed">Quick access to insights without friction or complex flows.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg underline underline-offset-8 decoration-white/30">Privacy</h3>
              <p className="text-sm text-white/80 leading-relaxed">Secure authentication and data protection by Supabase.</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </section>
    </article>
  )
}
