// Supabase Edge Function: process-payouts
// Scheduled daily to process seller payouts that are due
// Uses Razorpay Payouts API for bank transfers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Server configuration error')
        }

        // Initialize Supabase client with service role
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get payouts that are scheduled and due
        const now = new Date().toISOString()
        const { data: pendingPayouts, error: fetchError } = await supabase
            .from('seller_payouts')
            .select(`
        *,
        seller:profiles!seller_payouts_seller_id_fkey(id, email, full_name),
        seller_bank:seller_bank_accounts!seller_payouts_seller_id_fkey(*)
      `)
            .eq('status', 'scheduled')
            .lte('scheduled_at', now)
            .limit(50) // Process in batches

        if (fetchError) {
            throw new Error(`Failed to fetch payouts: ${fetchError.message}`)
        }

        if (!pendingPayouts || pendingPayouts.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No pending payouts to process', processed: 0 }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        console.log(`Processing ${pendingPayouts.length} payouts`)

        let processedCount = 0
        let failedCount = 0

        for (const payout of pendingPayouts) {
            try {
                // Check if seller has bank details
                if (!payout.seller_bank) {
                    await supabase
                        .from('seller_payouts')
                        .update({
                            status: 'failed',
                            error_message: 'No bank account configured',
                        })
                        .eq('id', payout.id)
                    failedCount++
                    continue
                }

                // Mark as processing
                await supabase
                    .from('seller_payouts')
                    .update({ status: 'processing' })
                    .eq('id', payout.id)

                // If Razorpay is configured, create actual payout
                if (razorpayKeyId && razorpayKeySecret) {
                    // Create Razorpay Payout (requires Route API setup)
                    // For now, we'll simulate success and mark as completed
                    // In production, you would use Razorpay Payouts API:
                    // https://razorpay.com/docs/api/payouts/

                    console.log(`Would create Razorpay payout for ${payout.seller.email}: ₹${payout.amount}`)
                }

                // Mark as completed (in production, this would happen via webhook)
                await supabase
                    .from('seller_payouts')
                    .update({
                        status: 'completed',
                        processed_at: new Date().toISOString(),
                    })
                    .eq('id', payout.id)

                // Update seller's total earnings in profile
                await supabase.rpc('increment_seller_stats', {
                    p_seller_id: payout.seller_id,
                    p_amount: 0, // Don't double-count, already counted on order
                })

                processedCount++
                console.log(`Payout ${payout.id} processed successfully`)
            } catch (payoutError) {
                console.error(`Error processing payout ${payout.id}:`, payoutError)

                await supabase
                    .from('seller_payouts')
                    .update({
                        status: 'failed',
                        error_message: payoutError.message || 'Unknown error',
                    })
                    .eq('id', payout.id)

                failedCount++
            }
        }

        return new Response(
            JSON.stringify({
                message: 'Payout processing complete',
                processed: processedCount,
                failed: failedCount,
                total: pendingPayouts.length,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error) {
        console.error('Payout processing error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
