import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminConversation {
    order_id: string;
    order_number: string;
    status: string;
    messages_locked: boolean;
    messages_lock_reason?: string;
    buyer: {
        id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    seller: {
        id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    listing_title: string;
    message_count: number;
    last_message_at?: string;
    has_dispute: boolean;
    created_at: string;
}

export const useAdminConversations = () => {
    const [conversations, setConversations] = useState<AdminConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = async () => {
        setIsLoading(true);
        try {
            // Get all orders with their participants
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    status,
                    messages_locked,
                    messages_lock_reason,
                    created_at,
                    buyer:profiles!orders_buyer_id_fkey(id, full_name, email, avatar_url),
                    seller:profiles!orders_seller_id_fkey(id, full_name, email, avatar_url),
                    listing:listings(title)
                `)
                .in('status', ['paid', 'delivered', 'completed', 'disputed'])
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // For each order, get message stats
            const conversationsWithStats = await Promise.all(
                (orders || []).map(async (order) => {
                    // Get message count
                    const { count: msgCount } = await supabase
                        .from('messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('order_id', order.id);

                    // Get last message time
                    const { data: lastMsg } = await supabase
                        .from('messages')
                        .select('created_at')
                        .eq('order_id', order.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Check for disputes
                    const { count: disputeCount } = await supabase
                        .from('disputes')
                        .select('id', { count: 'exact', head: true })
                        .eq('order_id', order.id);

                    // Handle array/single object response
                    const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer;
                    const seller = Array.isArray(order.seller) ? order.seller[0] : order.seller;
                    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;

                    return {
                        order_id: order.id,
                        order_number: order.order_number,
                        status: order.status,
                        messages_locked: order.messages_locked || false,
                        messages_lock_reason: order.messages_lock_reason,
                        buyer: buyer || { id: '', full_name: 'Unknown', email: '' },
                        seller: seller || { id: '', full_name: 'Unknown', email: '' },
                        listing_title: listing?.title || 'Unknown Item',
                        message_count: msgCount || 0,
                        last_message_at: lastMsg?.created_at,
                        has_dispute: (disputeCount || 0) > 0,
                        created_at: order.created_at
                    } as AdminConversation;
                })
            );

            // Sort by last activity
            const sorted = conversationsWithStats.sort((a, b) => {
                const timeA = a.last_message_at || a.created_at;
                const timeB = b.last_message_at || b.created_at;
                return new Date(timeB).getTime() - new Date(timeA).getTime();
            });

            setConversations(sorted);
        } catch (err) {
            console.error('[useAdminConversations] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const lockConversation = async (orderId: string, reason: string) => {
        try {
            const { error } = await supabase.rpc('admin_lock_conversation', {
                target_order_id: orderId,
                lock_reason: reason
            });
            if (error) throw error;
            await fetchConversations();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to lock' };
        }
    };

    const unlockConversation = async (orderId: string) => {
        try {
            const { error } = await supabase.rpc('admin_unlock_conversation', {
                target_order_id: orderId
            });
            if (error) throw error;
            await fetchConversations();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to unlock' };
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    return {
        conversations,
        isLoading,
        error,
        refetch: fetchConversations,
        lockConversation,
        unlockConversation
    };
};

// Hook to get all messages for a specific order (admin view)
export const useAdminOrderMessages = (orderId: string | undefined) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, email),
                    receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url, email)
                `)
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });

            if (!error) {
                setMessages(data || []);
            }
            setIsLoading(false);
        };

        fetchMessages();

        // Real-time updates
        const channel = supabase
            .channel(`admin-messages:${orderId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `order_id=eq.${orderId}`
            }, () => fetchMessages())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    return { messages, isLoading };
};
