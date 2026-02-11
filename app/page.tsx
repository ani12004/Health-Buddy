import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, PlayCircle, MessageSquare, Sparkles, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Decor */}
          <div className="hero-gradient-bg absolute inset-0 z-0 pointer-events-none"></div>
          <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-primary blur-[180px] opacity-15 rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
              {/* Hero Content */}
              <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  New AI Features Live
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                  Your AI health <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">companion.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                  Instant symptom analysis and personalized health insights powered by advanced medical AI. Always available, always accurate.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link href="/patient/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center gap-2">
                    Try Symptom Checker
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 text-center flex items-center justify-center gap-2 group">
                    <PlayCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </Link>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex -space-x-2">
                    {/* Avatars placeholders - utilizing colored circles for now as generic placeholders since external images might break or be specific */}
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark bg-blue-100"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark bg-green-100"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-background-dark bg-purple-100"></div>
                  </div>
                  <p>Trusted by <span className="font-bold text-slate-800 dark:text-white">10,000+</span> patients</p>
                </div>
              </div>

              {/* Hero Visual - Glassmorphic Interface */}
              <div className="relative mx-auto w-full max-w-lg lg:max-w-xl perspective-1000">
                {/* Background blobs for card */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                {/* Main Glass Card */}
                <div className="relative glass-panel rounded-2xl p-6 shadow-soft transition-transform hover:scale-[1.02] duration-500">
                  {/* Header of UI */}
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Health Buddy AI</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">v2.4.0</span>
                  </div>

                  {/* Chat Area */}
                  <div className="space-y-4 mb-6">
                    {/* AI Message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                        <p className="text-sm text-slate-700 dark:text-slate-200">Hi Alex! I noticed your heart rate was slightly elevated after your run. How are you feeling right now?</p>
                      </div>
                    </div>
                    {/* User Message */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-md shadow-primary/20">
                        <p className="text-sm">I'm feeling a bit dizzy, actually. Is that normal?</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden mt-1 bg-gray-300"></div>
                    </div>

                    {/* AI Analysis Card (Nested) */}
                    <div className="ml-11 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-500 text-sm">⚠</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Analysis</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Potential Dehydration</p>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-3/4 rounded-full"></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">Severity</span>
                        <span className="text-[10px] font-medium text-amber-500">Moderate</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="relative">
                    <input type="text" placeholder="Type your symptoms..." disabled className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                    <button className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="absolute bottom-0 right-[-100px] w-[500px] h-[500px] bg-primary blur-[160px] opacity-10 rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Healthcare simplified in <span className="text-primary">three steps</span></h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">Complex medical data turned into actionable insights instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group bg-white dark:bg-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-soft transition-all duration-300 border border-slate-100 dark:border-white/5 relative">
                <div className="absolute -top-6 left-8 bg-background-light dark:bg-background-dark border border-slate-200 dark:border-white/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm z-10 group-hover:scale-110 transition-transform">1</div>
                <div className="mt-6 mb-6 h-40 bg-purple-50 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative">
                  <MessageSquare className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Describe Symptoms</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Simply type how you're feeling or speak to the AI assistant just like you would a doctor.</p>
              </div>

              {/* Step 2 */}
              <div className="group bg-white dark:bg-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-soft transition-all duration-300 border border-slate-100 dark:border-white/5 relative">
                <div className="absolute -top-6 left-8 bg-background-light dark:bg-background-dark border border-slate-200 dark:border-white/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm z-10 group-hover:scale-110 transition-transform">2</div>
                <div className="mt-6 mb-6 h-40 bg-purple-50 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative">
                  <Sparkles className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our advanced algorithms compare your symptoms against millions of medical cases instantly.</p>
              </div>

              {/* Step 3 */}
              <div className="group bg-white dark:bg-slate-800/50 rounded-2xl p-8 shadow-sm hover:shadow-soft transition-all duration-300 border border-slate-100 dark:border-white/5 relative">
                <div className="absolute -top-6 left-8 bg-background-light dark:bg-background-dark border border-slate-200 dark:border-white/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm z-10 group-hover:scale-110 transition-transform">3</div>
                <div className="mt-6 mb-6 h-40 bg-purple-50 dark:bg-white/5 rounded-xl flex items-center justify-center overflow-hidden relative">
                  <CheckCircle className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Get Care Plan</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Receive a preliminary diagnosis and suggested next steps, from home care to seeing a specialist.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
