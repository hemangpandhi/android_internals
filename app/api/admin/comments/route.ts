import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase (Service Role for Admin Access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET /api/admin/comments
export async function GET(request: Request) {
    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(comments || [])
    } catch (error) {
        console.error('Admin Comments Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE /api/admin/comments?id=...
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 })
        }

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin Comment Delete Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
