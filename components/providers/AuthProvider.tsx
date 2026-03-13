'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User, Session, SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
    user: User | null
    session: Session | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true)
            const { data: { session }, error } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
        }

        fetchSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, updatedSession) => {
                setSession(updatedSession)
                setUser(updatedSession?.user ?? null)
                setIsLoading(false)
                router.refresh()
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase.auth])

    const signOut = async () => {
        setIsLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
