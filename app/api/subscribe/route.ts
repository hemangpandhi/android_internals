import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('subscribers')
            .insert({ email })

        if (dbError) {
            if (dbError.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'You are already subscribed!' }, { status: 409 })
            }
            console.error('Supabase Error:', dbError)
            return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
        }

        // 2. Send Email Notification to Admin via Nodemailer
        const emailUser = process.env.EMAIL_USER
        const emailPass = process.env.EMAIL_PASS
        const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com'
        const emailPort = parseInt(process.env.EMAIL_PORT || '587')
        const emailSecure = process.env.EMAIL_SECURE === 'true'

        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({
                host: emailHost,
                port: emailPort,
                secure: emailSecure,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            })

            // Send alert to admin
            await transporter.sendMail({
                from: `"Android Internals" <${emailUser}>`,
                to: emailUser,
                subject: `New Subscriber: ${email}`,
                text: `You have a new subscriber: ${email}`,
                html: `<p>You have a new subscriber: <strong>${email}</strong></p>`,
            })
        } else {
            console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping email.')
        }

        return NextResponse.json({ success: true, message: 'Thank you for subscribing!' })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
