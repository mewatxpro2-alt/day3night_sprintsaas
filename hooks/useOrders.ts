import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Order } from '../types/marketplace';

interface UseOrdersResult {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch buyer's order history
 */
export const useOrders = (): UseOrdersResult => {
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
          seller:profiles!orders_seller_id_fkey(id, full_name, avatar_url)
        `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            console.error('[useOrders] Error:', err);
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

/**
 * Hook to fetch a single order by ID
 */
export const useOrder = (orderId: string | undefined) => {
    const { user, isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = useCallback(async () => {
        if (!isAuthenticated || !user || !orderId) {
            setOrder(null);
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
          listing:listings(id, title, image_url, price, description, source_files_url),
          seller:profiles!orders_seller_id_fkey(id, full_name, avatar_url, email),
          buyer:profiles!orders_buyer_id_fkey(id, full_name, avatar_url, email),
          order_access(*)
        `)
                .eq('id', orderId)
                .single();

            if (fetchError) throw fetchError;
            setOrder(data);
        } catch (err) {
            console.error('[useOrder] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch order');
        } finally {
            setIsLoading(false);
        }
    }, [orderId, user, isAuthenticated]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    return { order, isLoading, error, refetch: fetchOrder };
};
