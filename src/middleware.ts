import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let supabaseResponse = await updateSession(request)

    // Create a Supabase client to check auth status
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isBackoffice = request.nextUrl.pathname.startsWith('/backoffice')

    // Redirect authenticated users away from auth page
    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/backoffice', request.url))
    }

    // Redirect unauthenticated users to auth page if trying to access backoffice
    if (isBackoffice && !user) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Add Security Headers (CAPA 7)
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
    supabaseResponse.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self)'
    )

    // Only set HSTS and CSP in production
    if (process.env.NODE_ENV === 'production') {
        supabaseResponse.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        )
        supabaseResponse.headers.set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        )
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
