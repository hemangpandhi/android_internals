import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Supabase (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY

export async function POST(request: Request) {
    try {
        if (!resendApiKey) {
            return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 })
        }
        const resend = new Resend(resendApiKey)

        const { subject, message, testMode, recipients } = await request.json()

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and Message are required' }, { status: 400 })
        }

        // 1. Fetch Subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('subscribers')
            .select('email')

        if (subError) throw subError
        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ message: 'No subscribers found' })
        }

        // 2. Determine Targets
        let targets = []

        if (testMode) {
            targets = subscribers.filter(s => s.email === 'info@hemangpandhi.com' || s.email === 'hemangpandhi@gmail.com')
        } else if (recipients && Array.isArray(recipients) && recipients.length > 0) {
            // Filter subscribers to only those in the recipients list (security check to ensure they are actually subscribers)
            targets = subscribers.filter(s => recipients.includes(s.email))
        } else {
            // Default: Send to ALL if no specific selection and not test mode? 
            // Or explicitly require "all" flag? Let's default to ALL for backward compatibility if recipients is null.
            targets = subscribers
        }

        // 3. Send Emails (Loop)
        // For large lists, use Batch API or Queue. For <1000, simple generic loop is okay but slow.
        // Resend free tier has rate limits, so we process serially or in small batches.

        let successCount = 0
        let failureCount = 0

        // In Test Mode, we use Resend's default allowed sender.
        // In Production, we use your verified domain.
        const fromAddress = testMode
            ? 'Android Internals <onboarding@resend.dev>'
            : 'Android Internals <info@hemangpandhi.com>'

        for (const sub of targets) {
            try {
                const { data, error } = await resend.emails.send({
                    from: fromAddress,
                    to: sub.email,
                    subject: subject,
                    html: message,
                    replyTo: 'hemangpandhi@gmail.com'
                })

                if (error) {
                    console.error(`Failed to send to ${sub.email}:`, error)
                    failureCount++
                    // Log the first error to return to client for debugging
                    console.log('Resend Error Details:', JSON.stringify(error, null, 2))
                } else {
                    successCount++
                }
            } catch (e) {
                console.error(`Exception sending to ${sub.email}:`, e)
                failureCount++
            }
        }

        if (failureCount > 0 && successCount === 0) {
            return NextResponse.json({
                success: false,
                sent: successCount,
                failed: failureCount,
                error: 'Check server console for detailed Resend error.'
            })
        }

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount,
            total: targets.length
        })

    } catch (error) {
        console.error('Broadcast Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
