import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface InfoSection {
  title: string
  body: string
  bullets?: string[]
}

interface StaticInfoPageProps {
  title: string
  subtitle: string
  sections: InfoSection[]
}

export function StaticInfoPage({ title, subtitle, sections }: StaticInfoPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-16">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-8 md:p-12 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Health Buddy</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">{title}</h1>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">{subtitle}</p>
          </div>

          <div className="mt-10 space-y-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">{section.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{section.body}</p>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
