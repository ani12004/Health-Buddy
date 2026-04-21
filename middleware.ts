import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request)

    const pathname = request.nextUrl.pathname

    const publicRoutes = new Set([
        '/',
        '/login',
        '/register',
        '/onboarding',
        '/features',
        '/how-it-works',
        '/security',
        '/enterprise',
        '/customer-stories',
        '/about',
        '/careers',
        '/press',
        '/contact',
        '/privacy',
        '/terms',
        '/hipaa',
        '/docs'
    ])

    const isPublicRoute =
        publicRoutes.has(pathname) ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/docs/')
    
    // Allow public routes
    if (isPublicRoute) {
        // Keep root landing page public for everyone, even logged-in users.
        // Only redirect authenticated users away from auth entry pages.
        if (user && (pathname === '/login' || pathname === '/register' || pathname === '/onboarding')) {
            const role = user.user_metadata?.role;
            if (role === 'doctor') {
                return NextResponse.redirect(new URL('/doctor/dashboard', request.url))
            } else if (role === 'patient') {
                return NextResponse.redirect(new URL('/patient/dashboard', request.url))
            }
        }
        return supabaseResponse
    }

    // Require Auth for private routes
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access control
    const role = user.user_metadata?.role;
    const isPatientRoute = request.nextUrl.pathname.startsWith('/patient')
    const isDoctorRoute = request.nextUrl.pathname.startsWith('/doctor')

    if (isPatientRoute && role !== 'patient') {
        return NextResponse.redirect(new URL('/doctor/dashboard', request.url))
    }

    if (isDoctorRoute && role !== 'doctor') {
        return NextResponse.redirect(new URL('/patient/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
