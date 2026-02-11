import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPatientRoute = createRouteMatcher(['/patient(.*)']);
const isDoctorRoute = createRouteMatcher(['/doctor(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // If the user isn't signed in and the route is private, redirect to sign-in
    if (!userId && (isPatientRoute(req) || isDoctorRoute(req))) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Role-based access control
    if (userId) {
        const role = sessionClaims?.metadata?.role;

        if (isPatientRoute(req) && role !== 'patient') {
            return NextResponse.redirect(new URL('/doctor/dashboard', req.url));
        }

        if (isDoctorRoute(req) && role !== 'doctor') {
            return NextResponse.redirect(new URL('/patient/dashboard', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
