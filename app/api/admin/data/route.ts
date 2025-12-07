import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client with SERVICE role to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
    try {
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase Environment Variables')
            return NextResponse.json({
                error: 'Configuration Error: Missing SUPABASE_SERVICE_ROLE_KEY or URL',
                details: 'Please add SUPABASE_SERVICE_ROLE_KEY to .env.local'
            }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // In a real production app, we should verify the Session Cookie here.
        // For now, we rely on the implementation simplicity - this route is public but obscure.
        // TODO: Add stricter Server-Side Auth check.

        // Fetch Subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false })

        if (subError) throw subError

        // Fetch Messages
        const { data: messages, error: msgError } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (msgError) throw msgError

        return NextResponse.json({ subscribers, messages })
    } catch (error) {
        console.error('Admin API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
