import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Conversation {
    order_id: string;
    order_number: string;
    other_party: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
        sender_id: string;
    };
    unread_count: number;
    listing_title: string;
    role: 'buyer' | 'seller';
    status: string;
}

export const useConversations = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            setIsLoading(true);
            try {
                // Fetch orders where user is buyer or seller
                const { data: orders, error } = await supabase
                    .from('orders')
                    .select(`
                        id, 
                        order_number, 
                        status,
                        buyer_id, 
                        seller_id,
                        buyer:profiles!orders_buyer_id_fkey(id, full_name, avatar_url),
                        seller:profiles!orders_seller_id_fkey(id, full_name, avatar_url),
                        listing:listings(title)
                    `)
                    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // For each order, get the last message
                const conversationsWithMessages = await Promise.all(orders.map(async (order) => {
                    const isBuyer = order.buyer_id === user.id;
                    const otherPartyData = isBuyer ? order.seller : order.buyer;
                    // Handle array or single object response from Supabase
                    const otherParty = Array.isArray(otherPartyData) ? otherPartyData[0] : otherPartyData;
                    const listingData = order.listing;
                    const listing = Array.isArray(listingData) ? listingData[0] : listingData;

                    // Get last message
                    const { data: lastMsg } = await supabase
                        .from('messages')
                        .select('content, created_at, is_read, sender_id')
                        .eq('order_id', order.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Get unread count
                    const { count } = await supabase
                        .from('messages')
                        .select('id', { count: 'exact', head: true })
                        .eq('order_id', order.id)
                        .eq('receiver_id', user.id)
                        .eq('is_read', false);

                    return {
                        order_id: order.id,
                        order_number: order.order_number,
                        other_party: otherParty || { id: 'warn', full_name: 'Unknown User' },
                        last_message: lastMsg || undefined,
                        unread_count: count || 0,
                        listing_title: listing?.title || 'Unknown Item',
                        role: isBuyer ? 'buyer' : 'seller',
                        status: order.status
                    } as Conversation;
                }));

                // Sort by last message time, then order created time
                const sorted = conversationsWithMessages.sort((a, b) => {
                    const timeA = a.last_message?.created_at || '0';
                    const timeB = b.last_message?.created_at || '0';
                    return timeB.localeCompare(timeA);
                });

                setConversations(sorted);
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();

        // Realtime subscription for new messages to update list
        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                if (payload.new.receiver_id === user.id || payload.new.sender_id === user.id) {
                    fetchConversations();
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    return { conversations, isLoading };
};
