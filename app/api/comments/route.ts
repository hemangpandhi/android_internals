import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/comments?slug=...
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

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
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    )

    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_slug', slug)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comments || [])
}

// POST /api/comments
export async function POST(request: Request) {
    const { slug, content } = await request.json()

    if (!slug || !content) {
        return NextResponse.json({ error: 'Missing slug or content' }, { status: 400 })
    }

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
                    } catch {
                        // Ignored
                    }
                },
            },
        }
    )

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert Comment
    const { data, error } = await supabase
        .from('comments')
        .insert({
            article_slug: slug,
            user_id: user.id,
            user_email: user.email,
            user_name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            content: content
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
