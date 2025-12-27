// Supabase Edge Function: verify-payment
// Handles Razorpay webhook for payment verification
// Grants access to buyer upon successful payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
            throw new Error('Server configuration error')
        }

        // Verify webhook signature
        const signature = req.headers.get('x-razorpay-signature')
        const body = await req.text()

        const expectedSignature = createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex')

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature')
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 401, headers: corsHeaders }
            )
        }

        const payload = JSON.parse(body)
        const event = payload.event

        // Initialize Supabase client with service role (bypasses RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Handle different events
        switch (event) {
            case 'payment.captured': {
                const payment = payload.payload.payment.entity
                const razorpayOrderId = payment.order_id
                const razorpayPaymentId = payment.id

                // Find our payment record
                const { data: paymentRecord, error: paymentError } = await supabase
                    .from('payments')
                    .select('*, orders(*)')
                    .eq('razorpay_order_id', razorpayOrderId)
                    .single()

                if (paymentError || !paymentRecord) {
                    console.error('Payment record not found:', razorpayOrderId)
                    throw new Error('Payment record not found')
                }

                const order = paymentRecord.orders

                // Update payment record
                await supabase
                    .from('payments')
                    .update({
                        razorpay_payment_id: razorpayPaymentId,
                        status: 'captured',
                        method: payment.method,
                        webhook_payload: payload,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', paymentRecord.id)

                // Update order status
                await supabase
                    .from('orders')
                    .update({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                    })
                    .eq('id', order.id)

                // Get listing source files URL
                const { data: listing } = await supabase
                    .from('listings')
                    .select('source_files_url')
                    .eq('id', order.listing_id)
                    .single()

                // Grant access to buyer
                await supabase
                    .from('order_access')
                    .insert({
                        order_id: order.id,
                        source_files_url: listing?.source_files_url || null,
                        access_granted_at: new Date().toISOString(),
                        download_count: 0,
                        max_downloads: 10,
                    })

                // Schedule payout (T+3 days)
                const payoutDate = new Date()
                payoutDate.setDate(payoutDate.getDate() + 3)

                await supabase
                    .from('seller_payouts')
                    .insert({
                        seller_id: order.seller_id,
                        order_id: order.id,
                        amount: order.seller_amount,
                        status: 'scheduled',
                        scheduled_at: payoutDate.toISOString(),
                    })

                // Update seller stats
                await supabase.rpc('increment_seller_stats', {
                    p_seller_id: order.seller_id,
                    p_amount: order.seller_amount,
                })

                console.log(`Payment captured for order ${order.id}`)
                break
            }

            case 'payment.failed': {
                const payment = payload.payload.payment.entity
                const razorpayOrderId = payment.order_id

                // Update payment record
                await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        error_code: payment.error_code,
                        error_description: payment.error_description,
                        webhook_payload: payload,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('razorpay_order_id', razorpayOrderId)

                // Update order status
                const { data: paymentRecord } = await supabase
                    .from('payments')
                    .select('order_id')
                    .eq('razorpay_order_id', razorpayOrderId)
                    .single()

                if (paymentRecord) {
                    await supabase
                        .from('orders')
                        .update({ status: 'created' }) // Reset to created
                        .eq('id', paymentRecord.order_id)
                }

                console.log(`Payment failed for Razorpay order ${razorpayOrderId}`)
                break
            }

            case 'refund.created': {
                const refund = payload.payload.refund.entity
                const razorpayPaymentId = refund.payment_id

                // Find the payment and order
                const { data: paymentRecord } = await supabase
                    .from('payments')
                    .select('order_id')
                    .eq('razorpay_payment_id', razorpayPaymentId)
                    .single()

                if (paymentRecord) {
                    // Update order status
                    await supabase
                        .from('orders')
                        .update({ status: 'refunded' })
                        .eq('id', paymentRecord.order_id)

                    // Cancel any pending payouts
                    await supabase
                        .from('seller_payouts')
                        .update({ status: 'failed', error_message: 'Order refunded' })
                        .eq('order_id', paymentRecord.order_id)
                        .in('status', ['pending', 'scheduled'])

                    // Revoke access
                    await supabase
                        .from('order_access')
                        .delete()
                        .eq('order_id', paymentRecord.order_id)
                }

                console.log(`Refund processed for payment ${razorpayPaymentId}`)
                break
            }

            default:
                console.log(`Unhandled event: ${event}`)
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
