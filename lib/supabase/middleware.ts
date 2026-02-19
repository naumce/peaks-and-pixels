/**
 * Supabase Middleware
 * Refreshes auth tokens on every request
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables in middleware');
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes check
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isGuideRoute = request.nextUrl.pathname.startsWith('/guide');
    const isApiRoute = request.nextUrl.pathname.startsWith('/api');

    // Allow API routes to handle their own auth
    if (isApiRoute) {
        return supabaseResponse;
    }

    // Redirect unauthenticated users from protected routes
    if (!user && (isAdminRoute || isGuideRoute)) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        url.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (user && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
