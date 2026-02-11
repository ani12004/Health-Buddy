'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
// import { User, Session } from '@supabase/supabase-js' // Removed
import { useRouter } from 'next/navigation'
import { useUser as useClerkUser, useClerk, useAuth as useClerkAuth } from '@clerk/nextjs'

// Mocking Supabase User type for compatibility or importing if needed.
// Ideally we should update the type definition, but for now we adapt.
interface SupabaseUserAdapter {
    id: string
    email?: string
    user_metadata: {
        [key: string]: any
    }
    app_metadata: {
        [key: string]: any
    }
}

interface AuthContextType {
    user: SupabaseUserAdapter | null
    session: any | null // We don't really have a Supabase session anymore
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded } = useClerkUser()
    const { signOut: clerkSignOut } = useClerk()
    const router = useRouter()

    const formattedUser: SupabaseUserAdapter | null = useMemo(() => {
        if (!clerkUser) return null
        return {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            user_metadata: {
                role: clerkUser.publicMetadata?.role,
                full_name: clerkUser.fullName,
                avatar_url: clerkUser.imageUrl,
            },
            app_metadata: {},
        }
    }, [clerkUser])

    const signOut = async () => {
        await clerkSignOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{
            user: formattedUser,
            session: null, // Session is managed by Clerk now
            isLoading: !isLoaded,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
