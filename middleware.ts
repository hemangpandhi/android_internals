import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // refresh session if needed
    const { data: { user }, error } = await supabase.auth.getUser()

    // Protection Logic
    const isApi = request.nextUrl.pathname.startsWith('/api/')

    console.log('[Middleware] Checking path:', request.nextUrl.pathname)

    if (error || !user) {
        console.log('[Middleware] No user session found. Error:', error)
        if (isApi) {
            return NextResponse.json({ error: 'Unauthorized: No verified session' }, { status: 401 })
        }
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        return NextResponse.redirect(redirectUrl)
    }

    // Check Whitelist
    const userEmail = user.email
    const adminEmailsEnv = process.env.ADMIN_EMAILS || ''
    const allowedEmails = adminEmailsEnv.split(',').map(e => e.trim())

    console.log('[Middleware] User:', userEmail)
    console.log('[Middleware] Allowed:', allowedEmails)

    if (!userEmail || !allowedEmails.includes(userEmail)) {
        console.log('[Middleware] Access Denied: User not in whitelist.')
        if (isApi) {
            return NextResponse.json({ error: 'Forbidden: You are not an admin' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('[Middleware] Access Granted.')
    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
    ],
}
