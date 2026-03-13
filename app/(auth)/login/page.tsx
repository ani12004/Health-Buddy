'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, Mail, Eye, EyeOff, Quote } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            if (data.session) {
                toast.success('Welcome back!')
                router.refresh()
                // The middleware handles redirect logic based on metadata role!
                // But we can eagerly redirect.
                const role = data.user?.user_metadata?.role
                if (role === 'doctor') {
                    router.push('/doctor/dashboard')
                } else {
                    router.push('/patient/dashboard')
                }
            }
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to sign in.')
        } finally {
            setIsLoading(false)
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
