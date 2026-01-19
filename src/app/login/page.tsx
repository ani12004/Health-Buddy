'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, Stethoscope, User } from 'lucide-react';
import Image from 'next/image';

type UserRole = 'patient' | 'doctor';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            role: role,
                        }
                    },
                });
                if (error) throw error;
                setError('Check your email/SMS for the confirmation link.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Simple ambient background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card rounded-3xl p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="relative w-48 h-16 mx-auto mb-6"
                        >
                            <Image
                                src="/logo.png"
                                alt="Health Buddy Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight sr-only">Health Buddy</h1>
                        <p className="text-muted-foreground mt-2">Your AI-Powered Medical Companion</p>
                    </div>

                    {!isSignUp ? (
                        // LOGIN FORM
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/50 border border-border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/50 border border-border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
                                <ArrowRight className="h-5 w-5" />
                            </button>

                            <div className="text-center pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-3">Don't have an account?</p>
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(true)}
                                    className="w-full py-3 border-2 border-primary/20 hover:border-primary/50 text-primary font-semibold rounded-xl transition-all"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    ) : (
                        // SIGN UP FORM
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div className="flex gap-4 p-1 bg-white/40 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setRole('patient')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${role === 'patient'
                                        ? 'bg-white shadow-sm text-primary'
                                        : 'text-muted-foreground hover:bg-white/50'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    Patient
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('doctor')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${role === 'doctor'
                                        ? 'bg-white shadow-sm text-primary'
                                        : 'text-muted-foreground hover:bg-white/50'
                                        }`}
                                >
                                    <Stethoscope className="w-4 h-4" />
                                    Doctor
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/50 border border-border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="Create Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/50 border border-border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
                                <ArrowRight className="h-5 w-5" />
                            </button>

                            <div className="text-center pt-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-3">Already have an account?</p>
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(false)}
                                    className="w-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground font-medium rounded-xl transition-all py-3"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
