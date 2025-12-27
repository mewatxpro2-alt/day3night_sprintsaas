// Supabase Edge Function: create-razorpay-order
// Creates a Razorpay order for the given platform order
// This runs server-side to protect API keys

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
    order_id: string
    amount: number // in paise
    currency: string
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { order_id, amount, currency } = await req.json() as RequestBody

        // Validate inputs
        if (!order_id || !amount || amount < 100) {
            throw new Error('Invalid order parameters')
        }

        // Get Razorpay credentials from environment
        const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
        const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!razorpayKeyId || !razorpayKeySecret) {
            throw new Error('Payment gateway not configured')
        }

        // Create Razorpay order
        const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${razorpayAuth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount, // Already in paise
                currency: currency || 'INR',
                receipt: order_id,
                notes: {
                    platform_order_id: order_id,
                },
            }),
        })

        if (!razorpayResponse.ok) {
            const errorText = await razorpayResponse.text()
            console.error('Razorpay error:', errorText)
            throw new Error('Failed to create payment order')
        }

        const razorpayOrder = await razorpayResponse.json()

        // Return the order details needed for checkout
        return new Response(
            JSON.stringify({
                razorpay_order_id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: razorpayKeyId, // Public key for frontend
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Internal server error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
