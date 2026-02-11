import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types'
import { useAuth } from '@/components/providers'

export function useUser() {
    const { user, session, isLoading: authLoading } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProfile() {
            if (!user) {
                setProfile(null)
                setIsLoading(false)
                return
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    console.error('Error fetching profile:', error)
                    // Fallback to metadata if DB fetch fails (optional)
                    setProfile({
                        id: user.id,
                        email: user.email!,
                        role: user.user_metadata.role as any,
                        full_name: user.user_metadata.full_name,
                        avatar_url: user.user_metadata.avatar_url,
                        created_at: new Date().toISOString()
                    })
                } else {
                    setProfile(data as UserProfile)
                }
            } catch (error) {
                console.error('Error in useUser:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (!authLoading) {
            fetchProfile()
        }
    }, [user, authLoading, supabase])

    return {
        user,
        profile,
        isLoading: isLoading || authLoading,
        isAuthenticated: !!user
    }
}
