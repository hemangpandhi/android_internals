import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use service key if available for RLS bypass, otherwise anon
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json()

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Save to Supabase
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert({ name, email, message })

        if (dbError) {
            console.error('Supabase Error:', dbError)
            return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
        }

        // 2. Send Email via Nodemailer
        const emailUser = process.env.EMAIL_USER
        const emailPass = process.env.EMAIL_PASS
        const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com'
        const emailPort = parseInt(process.env.EMAIL_PORT || '587')
        const emailSecure = process.env.EMAIL_SECURE === 'true' // true for 465, false for other ports

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

            await transporter.sendMail({
                from: `"${name}" <${emailUser}>`, // Send FROM your authenticated email, with user's name as display
                replyTo: email, // Allow replying to the user
                to: emailUser, // Send TO yourself
                subject: `New Contact Message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>`,
            })
        } else {
            console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping email.')
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully' })
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
