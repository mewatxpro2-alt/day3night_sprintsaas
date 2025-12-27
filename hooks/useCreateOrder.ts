import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { CreateOrderResponse } from '../types/marketplace';

interface UseCreateOrderResult {
    createOrder: (listingId: string) => Promise<CreateOrderResponse | null>;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to create a new order and get Razorpay checkout details
 * This initiates the purchase flow for a kit
 */
export const useCreateOrder = (): UseCreateOrderResult => {
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrder = useCallback(async (listingId: string): Promise<CreateOrderResponse | null> => {
        if (!isAuthenticated || !user) {
            setError('You must be signed in to make a purchase');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get listing details
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id, title, price, creator_id, source_files_url')
                .eq('id', listingId)
                .eq('is_live', true)
                .single();

            if (listingError || !listing) {
                throw new Error('Kit not found or unavailable');
            }

            // Prevent buying own kit
            if (listing.creator_id === user.id) {
                throw new Error('You cannot purchase your own kit');
            }

            // Check if already purchased
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id')
                .eq('buyer_id', user.id)
                .eq('listing_id', listingId)
                .in('status', ['paid', 'delivered', 'completed'])
                .single();

            if (existingOrder) {
                throw new Error('You have already purchased this kit');
            }

            // Get platform commission rate
            const { data: config } = await supabase
                .from('platform_config')
                .select('value')
                .eq('key', 'commission_rate')
                .single();

            const commissionRate = config?.value || 0.15;
            const priceAmount = Number(listing.price);
            const commissionAmount = priceAmount * commissionRate;
            const sellerAmount = priceAmount - commissionAmount;

            // Create order in database
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    seller_id: listing.creator_id,
                    listing_id: listingId,
                    price_amount: priceAmount,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    seller_amount: sellerAmount,
                    currency: 'INR',
                    status: 'created'
                })
                .select()
                .single();

            if (orderError || !order) {
                throw new Error('Failed to create order');
            }

            // Call Edge Function to create Razorpay order
            const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    order_id: order.id,
                    amount: Math.round(priceAmount * 100), // Razorpay expects paise
                    currency: 'INR'
                }
            });

            if (razorpayError || !razorpayData) {
                // Rollback order
                await supabase.from('orders').delete().eq('id', order.id);
                throw new Error('Failed to initialize payment');
            }

            // Update order with Razorpay order ID
            await supabase
                .from('payments')
                .insert({
                    order_id: order.id,
                    razorpay_order_id: razorpayData.razorpay_order_id,
                    amount: priceAmount,
                    currency: 'INR',
                    status: 'pending'
                });

            return {
                order_id: order.id,
                razorpay_order_id: razorpayData.razorpay_order_id,
                amount: priceAmount,
                currency: 'INR',
                key_id: razorpayData.key_id
            };

        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create order';
            setError(message);
            console.error('[useCreateOrder] Error:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated]);

    return { createOrder, isLoading, error };
};
