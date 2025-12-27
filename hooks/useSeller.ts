import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Order, SellerPayout, SellerEarnings } from '../types/marketplace';

interface UseSellerOrdersResult {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch seller's sales (orders for their kits)
 */
export const useSellerOrders = (): UseSellerOrdersResult => {
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setOrders([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select(`
          *,
          listing:listings(id, title, image_url, price),
          buyer:profiles!orders_buyer_id_fkey(id, full_name, avatar_url)
        `)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            console.error('[useSellerOrders] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, isLoading, error, refetch: fetchOrders };
};

interface UseSellerPayoutsResult {
    payouts: SellerPayout[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch seller's payout history
 */
export const useSellerPayouts = (): UseSellerPayoutsResult => {
    const { user, isAuthenticated } = useAuth();
    const [payouts, setPayouts] = useState<SellerPayout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayouts = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setPayouts([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('seller_payouts')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setPayouts(data || []);
        } catch (err) {
            console.error('[useSellerPayouts] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch payouts');
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    return { payouts, isLoading, error, refetch: fetchPayouts };
};

interface UseSellerEarningsResult {
    earnings: SellerEarnings | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook to fetch seller's aggregated earnings data
 */
export const useSellerEarnings = (): UseSellerEarningsResult => {
    const { user, isAuthenticated } = useAuth();
    const [earnings, setEarnings] = useState<SellerEarnings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!isAuthenticated || !user) {
                setEarnings(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Get completed orders
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('seller_amount, status')
                    .eq('seller_id', user.id)
                    .in('status', ['paid', 'delivered', 'completed']);

                if (ordersError) throw ordersError;

                // Get payouts
                const { data: payouts, error: payoutsError } = await supabase
                    .from('seller_payouts')
                    .select('amount, status')
                    .eq('seller_id', user.id);

                if (payoutsError) throw payoutsError;

                // Calculate totals
                const totalEarnings = orders?.reduce((sum, o) => sum + Number(o.seller_amount), 0) || 0;
                const completedPayouts = payouts?.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
                const pendingPayouts = payouts?.filter(p => p.status === 'pending' || p.status === 'scheduled').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

                setEarnings({
                    total_sales: orders?.length || 0,
                    total_earnings: totalEarnings,
                    pending_payouts: pendingPayouts,
                    completed_payouts: completedPayouts,
                    orders_count: orders?.length || 0
                });
            } catch (err) {
                console.error('[useSellerEarnings] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEarnings();
    }, [user, isAuthenticated]);

    return { earnings, isLoading, error };
};
