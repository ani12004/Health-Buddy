import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/login', '/register', '/sso-callback', '/onboarding', '/', '/api/webhooks(.*)']);
const isPatientRoute = createRouteMatcher(['/patient(.*)']);
const isDoctorRoute = createRouteMatcher(['/doctor(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    const isAuthTransition = ['/sso-callback', '/onboarding'].includes(req.nextUrl.pathname) || req.nextUrl.pathname.startsWith('/api');

    // 1. If the route is a public route
    if (isPublicRoute(req)) {
        if (userId && !isAuthTransition) {
            // User is authenticated, redirect them to their dashboard or onboarding
            const role = (sessionClaims?.publicMetadata as any)?.role;

            if (!role) {
                return NextResponse.redirect(new URL('/onboarding', req.url));
            }

            const dashboardUrl = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        return NextResponse.next();
    }

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && (isPatientRoute(req) || isDoctorRoute(req))) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 2. Role-based access control
    if (userId) {
        const role = (sessionClaims?.publicMetadata as any)?.role;

        // If user is authenticated but has no role, force them to onboarding
        if (!role && !isAuthTransition) {
            return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        if (isPatientRoute(req) && role !== 'patient') {
            return NextResponse.redirect(new URL('/doctor/dashboard', req.url));
        }

        if (isDoctorRoute(req) && role !== 'doctor') {
            return NextResponse.redirect(new URL('/patient/dashboard', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
