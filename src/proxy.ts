import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
    let supabaseResponse = await updateSession(request)

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

    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/backoffice', request.url))
    }

    if (isBackoffice && !user) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
    supabaseResponse.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self)'
    )

    if (process.env.NODE_ENV === 'production') {
        supabaseResponse.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        )
        // CSP debe permitir Supabase (auth), Google Fonts y Maps para que backoffice y auth funcionen
        supabaseResponse.headers.set(
            'Content-Security-Policy',
            [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "img-src 'self' blob: data: https: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com",
                "font-src 'self' data: https://fonts.gstatic.com",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com",
                "frame-src 'self' https://maps.googleapis.com",
                "worker-src 'self' blob:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'"
            ].join('; ')
        )
    }

    return supabaseResponse
}

// Solo ejecutar proxy en rutas que requieren auth (backoffice, auth). El resto (/, /propiedades, etc.) carga sin proxy = mucho más rápido.
export const config = {
    matcher: [
        '/backoffice/:path*',
        '/auth/:path*',
    ],
}
