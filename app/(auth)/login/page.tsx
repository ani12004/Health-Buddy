'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, Mail, Lock, Eye, EyeOff, Quote } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const { isLoaded, signIn, setActive } = useSignIn()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return;
        setIsLoading(true)

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            })

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId })
                toast.success('Welcome back!')

                // Sync user to Supabase and get role
                try {
                    const { syncUser } = await import('@/lib/actions/auth')
                    const syncResult = await syncUser()
                    const role = syncResult?.role || 'patient'

                    router.refresh()

                    if (role === 'doctor') {
                        router.push('/doctor/dashboard')
                    } else {
                        router.push('/patient/dashboard')
                    }
                } catch (err) {
                    console.error('Sync failed', err)
                    router.push('/patient/dashboard')
                }
            } else {
                toast.error('Sign in failed. Check credentials.')
            }

        } catch (error: any) {
            console.error(error)
            toast.error(error.errors?.[0]?.message || 'Failed to sign in.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
        if (!isLoaded) return
        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/patient/dashboard',
            })
        } catch (err) {
            console.error('OAuth error', err)
            toast.error('Failed to initiate social login')
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display transition-colors duration-300">
            {/* Left Side: Visual & Emotional Anchor - Reused style */}
            <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 bg-gray-900 overflow-hidden">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-background-dark/90 mix-blend-multiply z-10"></div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                </div>

                {/* Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-wide">Health Buddy AI</span>
                </div>

                {/* Quote Block */}
                <div className="relative z-10 max-w-lg mb-12">
                    <div className="mb-6">
                        <Quote className="text-primary-light/50 w-12 h-12" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-tight mb-6">
                        The groundwork of all happiness is health.
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-12 bg-white/40"></div>
                        <p className="text-white/80 font-medium tracking-wide text-sm uppercase">Leigh Hunt</p>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl z-0"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Shield className="text-white w-5 h-5" />
                        </div>
                        <span className="text-slate-900 dark:text-white font-bold text-lg">Health Buddy AI</span>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                        <p className="text-slate-500 dark:text-slate-400">Please enter your credentials to access your dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 mt-8">
                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="email">Email Address</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    icon={<Mail className="w-5 h-5" />}
                                />
                            </div>

                            <div className="relative group">
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center ml-1">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 transition-colors cursor-pointer" />
                            <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">remember me for 30 days</label>
                        </div>

                        <Button type="submit" className="w-full py-4 rounded-2xl text-base" isLoading={isLoading}>
                            Sign In to Account
                        </Button>
                    </form>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-background-light dark:bg-background-dark text-slate-500 dark:text-slate-400 font-medium">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Auth Placeholders */}
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => handleOAuth('oauth_google')} className="flex items-center justify-center gap-3 w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                            <img alt="Google Logo" className="h-5 w-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn8uGPhQTndl2SvxhGo5BKZDEGAia01Da3eRa4sBxckzn6747QYEXsYshkA6XwMhiB4xKGWgEAubiH0YqaFTdvqklVRpaav_KUKfMj1jzTgSTf-g1ZUpWVNOg2oFtDb_8tXtpMhgk23IxnVOPPrT9-qmmwAPgmtpmfkb8YkRFAlyzOKOGNpjdeNkXfvqfjFW6tjWhzw01X8qaxoeY6YqmHGCmnE21hAgC07yW-E3XhK9zSaCYklum-9LiT-88x-7g6H0zyflHXiA" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">Google</span>
                        </button>
                        <button type="button" onClick={() => handleOAuth('oauth_apple')} className="flex items-center justify-center gap-3 w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                            <img alt="Apple Logo" className="h-5 w-5 dark:invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRxITcWUF18aAdiIjb5VumoU2VA8BOXAd1oRw5Q0ZqfKALehcfuZuEC_XKc7Sg85f9u6b4AkAThjqjIDegc4Pxqn65C6xpuVpnDVcU6BuhfWGYT2R0CxC3ayFxDMZF-HueKqwX-eMELNqghGd-PKgjZ66eT_Ioq6XqtkO-NVtc5DwZtcck8n2DUd0BdZq9noSD3fBwjwKylQgxZqHfCrcIqSg6IOyMsR3GwUTMYuwbJ9GasJze0D9RFBNf231SNE5ODyK_4ZcHHQ" />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">Apple</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
                        Don't have an account?
                        <Link href="/register" className="font-bold text-primary hover:text-primary-dark transition-colors ml-1">
                            Sign up for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
