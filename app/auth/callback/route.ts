import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url)
        const code = searchParams.get('code')
        const next = searchParams.get('next') ?? '/'

        if (code) {
            const cookieStore = await cookies()
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return cookieStore.getAll()
                        },
                        setAll(cookiesToSet) {
                            try {
                                cookiesToSet.forEach(({ name, value, options }) =>
                                    cookieStore.set(name, value, options)
                                )
                            } catch (err) {
                                // console.warn('Cookie setAll warning:', err)
                            }
                        },
                    },
                }
            )
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (!error) {
                const forwardedHost = request.headers.get('x-forwarded-host') 
                const isLocalEnv = process.env.NODE_ENV === 'development'
                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${next}`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${next}`)
                } else {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            } else {
                console.error('Auth Callback Error:', error)
                return NextResponse.redirect(`${origin}/auth/login?error=AuthCallbackError&message=${encodeURIComponent(error.message)}`)
            }
        }
        return NextResponse.redirect(`${origin}/auth/login?error=AuthCallbackFailed&reason=NoCode`)
    } catch (err: any) {
        console.error('Auth Callback Critical Failure:', err)
        return NextResponse.json({ error: 'Internal Server Error in Auth Callback', details: err.message || String(err) }, { status: 500 })
    }
}
