import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Message } from '../types/marketplace';

interface UseMessagesResult {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (content: string, files?: File[]) => Promise<boolean>;
    markAsRead: (messageId: string) => Promise<void>;
    unreadCount: number;
}

/**
 * Hook for order-scoped messaging between buyer and seller
 * Messages are only available after payment is completed
 */
export const useMessages = (orderId: string | undefined): UseMessagesResult => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!orderId || !user) {
            setMessages([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('messages')
                .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
        `)
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;
            setMessages(data || []);
        } catch (err) {
            console.error('[useMessages] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        } finally {
            setIsLoading(false);
        }
    }, [orderId, user]);

    // Set up real-time subscription
    useEffect(() => {
        if (!orderId || !user) return;

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`messages:${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `order_id=eq.${orderId}`
                },
                (payload) => {
                    // Add new message to state
                    setMessages(prev => [...prev, payload.new as Message]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `order_id=eq.${orderId}`
                },
                (payload) => {
                    // Update message in state (e.g., read status)
                    setMessages(prev =>
                        prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m)
                    );
                }
            )
            .subscribe();

        subscriptionRef.current = channel;

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [orderId, user, fetchMessages]);

    const sendMessage = useCallback(async (content: string, files?: File[]): Promise<boolean> => {
        if (!orderId || !user || (!content.trim() && (!files || files.length === 0))) return false;

        try {
            // Get order to determine receiver
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('buyer_id, seller_id, status')
                .eq('id', orderId)
                .single();

            if (orderError || !order) {
                throw new Error('Order not found');
            }

            // Only allow messaging after payment
            if (!['paid', 'delivered', 'completed'].includes(order.status)) {
                throw new Error('Messaging is only available after payment');
            }

            // Upload attachments if any
            let attachmentUrls: string[] = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('messages') // Ensure this bucket exists
                        .upload(fileName, file);

                    if (!uploadError && uploadData) {
                        const { data: urlData } = supabase.storage
                            .from('messages')
                            .getPublicUrl(uploadData.path);
                        attachmentUrls.push(urlData.publicUrl);
                    }
                }
            }

            // Determine receiver and sender role
            const receiverId = order.buyer_id === user.id ? order.seller_id : order.buyer_id;
            const senderRole = order.buyer_id === user.id ? 'buyer' : 'seller';

            const { error: insertError } = await supabase
                .from('messages')
                .insert({
                    order_id: orderId,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    content: content.trim(),
                    attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
                    sender_role: senderRole,
                    message_type: attachmentUrls.length > 0 ? 'file' : 'text',
                    visibility: 'all'
                });

            if (insertError) throw insertError;
            return true;
        } catch (err) {
            console.error('[useMessages] Send error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
            return false;
        }
    }, [orderId, user]);

    const markAsRead = useCallback(async (messageId: string): Promise<void> => {
        if (!user) return;

        try {
            await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('id', messageId)
                .eq('receiver_id', user.id);
        } catch (err) {
            console.error('[useMessages] Mark as read error:', err);
        }
    }, [user]);

    const unreadCount = messages.filter(m =>
        m.receiver_id === user?.id && !m.is_read
    ).length;

    return { messages, isLoading, error, sendMessage, markAsRead, unreadCount };
};

/**
 * Hook to get total unread message count across all orders
 */
export const useUnreadMessageCount = () => {
    const { user } = useAuth();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setCount(0);
            return;
        }

        const fetchCount = async () => {
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('is_read', false);

            setCount(unreadCount || 0);
        };

        fetchCount();

        // Subscribe to changes
        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${user.id}`
                },
                () => {
                    fetchCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return count;
};
