'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Eye, EyeOff, User, Quote, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState<'patient' | 'doctor'>('patient')

    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            })

            if (error) {
                toast.error(error.message)
                return
            }

            if (data.session) {
                toast.success('Account created successfully!')
                router.refresh()
                const dest = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
                router.push(dest)
            } else if (data.user) {
                toast.info('Please check your email to verify your account.')
                router.push('/login')
            }

        } catch (error: any) {
            console.error(error)
            toast.error('Failed to create account.')
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
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-2187d80aeff2?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                </div>

                {/* Branding */}
                <div className="relative z-10 flex items-center gap-3">
                    <img src="/logo_health_buddy.png" alt="Health Buddy" className="h-10 w-10 rounded-xl object-cover border border-white/20" />
                    <span className="text-white font-bold text-xl tracking-wide">Health Buddy AI</span>
                </div>

                {/* Quote Block */}
                <div className="relative z-10 max-w-lg mb-12">
                    <div className="mb-6">
                        <Quote className="text-primary-light/50 w-12 h-12" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-tight mb-6">
                        Your journey to better health starts here.
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-px w-12 bg-white/40"></div>
                        <p className="text-white/80 font-medium tracking-wide text-sm uppercase">Join Us</p>
                    </div>
                </div>

                {/* Decorative Circle */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl z-0"></div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
                        <img src="/logo_health_buddy.png" alt="Health Buddy" className="h-8 w-8 rounded-lg object-cover" />
                        <span className="text-slate-900 dark:text-white font-bold text-lg">Health Buddy AI</span>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Create Account
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Join thousands of patients and doctors today.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6 mt-8">
                        {/* Role Toggle Switch */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 border border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setRole('patient')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'patient' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                <User className="w-4 h-4" />
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('doctor')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'doctor' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                <Stethoscope className="w-4 h-4" />
                                Doctor
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="fullname">Full Name</label>
                                <Input
                                    id="fullname"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    icon={<User className="w-5 h-5" />}
                                />
                            </div>

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
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1" htmlFor="password">Password</label>
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

                        <Button type="submit" className="w-full py-4 rounded-2xl text-base" isLoading={isLoading}>
                            Register Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
                        Already have an account?
                        <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors ml-1">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
