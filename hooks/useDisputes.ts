import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Dispute } from '../types/marketplace';

interface UseDisputesResult {
    disputes: Dispute[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    resolveDispute: (
        disputeId: string,
        outcome: 'resolved_refund' | 'resolved_no_refund',
        resolution: string
    ) => Promise<boolean>;
}

/**
 * Hook for admin dispute management
 */
export const useDisputes = (): UseDisputesResult => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDisputes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('disputes')
                .select(`
          *,
          order:orders(
            id, order_number, price_amount, status,
            listing:listings(id, title),
            buyer:profiles!orders_buyer_id_fkey(id, full_name, email),
            seller:profiles!orders_seller_id_fkey(id, full_name, email)
          ),
          raiser:profiles!disputes_raised_by_fkey(id, full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setDisputes(data || []);
        } catch (err) {
            console.error('[useDisputes] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch disputes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const resolveDispute = useCallback(async (
        disputeId: string,
        outcome: 'resolved_refund' | 'resolved_no_refund',
        resolution: string
    ): Promise<boolean> => {
        try {
            const { error: updateError } = await supabase
                .from('disputes')
                .update({
                    status: outcome,
                    resolution,
                    resolved_at: new Date().toISOString(),
                })
                .eq('id', disputeId);

            if (updateError) throw updateError;

            // If refund, update order status
            if (outcome === 'resolved_refund') {
                const dispute = disputes.find(d => d.id === disputeId);
                if (dispute?.order?.id) {
                    await supabase
                        .from('orders')
                        .update({ status: 'refunded' })
                        .eq('id', dispute.order.id);

                    // Cancel pending payouts
                    await supabase
                        .from('seller_payouts')
                        .update({ status: 'failed', error_message: 'Order refunded' })
                        .eq('order_id', dispute.order.id)
                        .in('status', ['pending', 'scheduled']);
                }
            }

            fetchDisputes();
            return true;
        } catch (err) {
            console.error('[useDisputes] Resolve error:', err);
            setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
            return false;
        }
    }, [disputes, fetchDisputes]);

    return { disputes, isLoading, error, refetch: fetchDisputes, resolveDispute };
};

/**
 * Hook to create a new dispute
 */
export const useCreateDispute = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createDispute = useCallback(async (
        orderId: string,
        reason: string,
        description?: string
    ): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: insertError } = await supabase
                .from('disputes')
                .insert({
                    order_id: orderId,
                    raised_by: user.id,
                    reason,
                    description,
                    status: 'open',
                });

            if (insertError) throw insertError;

            // Update order status to disputed
            await supabase
                .from('orders')
                .update({ status: 'disputed' })
                .eq('id', orderId);

            return true;
        } catch (err) {
            console.error('[useCreateDispute] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to create dispute');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { createDispute, isLoading, error };
};
