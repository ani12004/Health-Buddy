import Link from "next/link";
import { ArrowRight, Activity, Shield, Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="relative w-48 h-14">
          <Image
            src="/logo.png"
            alt="Health Buddy"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Link href="/login">
          <button className="px-6 py-2.5 bg-card/50 backdrop-blur-sm text-primary font-semibold rounded-full shadow-sm hover:shadow-md transition-all border border-primary/10">
            Log In
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-8 pb-20 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/60 backdrop-blur-md text-primary rounded-full text-sm font-medium animate-fade-in-up shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Healthcare 2.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl drop-shadow-sm">
          Your Personal <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Health Compass</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Experience the future of medical assistance. Instant symptom analysis, professional reports, and direct doctor communication—all in one calm, secure place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 z-10">
          <Link href="/login">
            <button className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full text-left z-10">
          <div className="p-6 bg-white/60 backdrop-blur-[18px] border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-primary mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Smart Checkups</h3>
            <p className="text-muted-foreground">Describe your symptoms naturally and get instant, stress-free AI health guidance.</p>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-[18px] border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-primary mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">Encrypted medical records and role-based access for patients and certified doctors.</p>
          </div>
          <div className="p-6 bg-white/60 backdrop-blur-[18px] border border-white/20 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-primary mb-4">
              <Image
                src="/logo.png"
                alt="icon"
                width={24}
                height={24}
                className="opacity-80"
              />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Doctor Connect</h3>
            <p className="text-muted-foreground">Seamless communication with your healthcare providers and automated updates.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
