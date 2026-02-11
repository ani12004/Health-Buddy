import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers'
import { Toaster } from 'sonner' // Assuming Toaster import from sonner, UI code didn't specify but plan did. 

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Health Buddy - AI Health Companion',
  description: 'Instant symptom analysis and personalized health insights powered by advanced medical AI.',
  icons: {
    icon: '/logo_health_buddy.png',
  },
}

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body className={`${manrope.variable} font-display antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-white`}>
          <AuthProvider>
            {children}
            <Toaster position="top-center" />
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
