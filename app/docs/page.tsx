import Link from 'next/link'
import { FileText, Code, ArrowRight, Shield, Rocket, BookOpen } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center md:text-left space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
          <BookOpen className="w-4 h-4" />
          Documentation Center
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
          Everything You Need to <span className="text-primary italic">Know</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Welcome to the Health Buddy AI documentation. Whether you're a user curious about our features or a developer looking to contribute, we've got you covered.
        </p>
      </section>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/docs/general"
          className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <div className="flex flex-col h-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Docs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Learn about the features, purpose, and values behind Health Buddy AI. Perfect for patients and healthcare providers.
              </p>
            </div>
            <div className="mt-auto flex items-center font-bold text-sm text-primary group-hover:translate-x-1 transition-transform">
              Explore General <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link 
          href="/docs/developer"
          className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <div className="flex flex-col h-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Developer Docs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Technical details, tech stack, API integrations, and developer commands to help you build and scale the application.
              </p>
            </div>
            <div className="mt-auto flex items-center font-bold text-sm text-primary group-hover:translate-x-1 transition-transform">
              Explore Technical <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Links / Tips */}
      <section className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Getting Started</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Quickly set up your health profile and start your journey.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Security Policy</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">How we protect your data with end-to-end security.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex flex-shrink-0 items-center justify-center text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Release Notes</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Check out our latest updates and AI improvements.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
