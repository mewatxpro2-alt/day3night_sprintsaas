import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { SellerInquiry } from '../types/marketplace';

interface UseSellerInquiriesResult {
    inquiries: SellerInquiry[];
    isLoading: boolean;
    error: string | null;
    unreadCount: number;
    refetch: () => Promise<void>;
}

/**
 * Hook for sellers to fetch and manage inquiries sent to them
 */
export const useSellerInquiries = (): UseSellerInquiriesResult => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState<SellerInquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInquiries = useCallback(async () => {
        if (!user) {
            setInquiries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('seller_inquiries')
                .select(`
                    *,
                    listing:listings(id, title, image_url),
                    buyer:profiles!seller_inquiries_buyer_id_fkey(id, full_name, avatar_url, email)
                `)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setInquiries(data || []);
        } catch (err) {
            console.error('[useSellerInquiries] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInquiries();

        // Set up real-time subscription
        if (!user) return;

        const channel = supabase
            .channel(`seller-inquiries:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'seller_inquiries',
                    filter: `seller_id=eq.${user.id}`
                },
                () => {
                    fetchInquiries();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchInquiries]);

    const unreadCount = inquiries.filter(i => i.status === 'new').length;

    return { inquiries, isLoading, error, unreadCount, refetch: fetchInquiries };
};

/**
 * Hook for buyers to fetch inquiries they've sent
 */
export const useBuyerInquiries = (): UseSellerInquiriesResult => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState<SellerInquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInquiries = useCallback(async () => {
        if (!user) {
            setInquiries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('seller_inquiries')
                .select(`
                    *,
                    listing:listings(id, title, image_url),
                    seller:profiles!seller_inquiries_seller_id_fkey(id, full_name, avatar_url)
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setInquiries(data || []);
        } catch (err) {
            console.error('[useBuyerInquiries] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const unreadCount = inquiries.filter(i => i.status === 'replied' && !i.read_at).length;

    return { inquiries, isLoading, error, unreadCount, refetch: fetchInquiries };
};

/**
 * Hook to send a new inquiry to a seller
 */
export const useSendInquiry = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendInquiry = async (
        listingId: string,
        sellerId: string,
        subject: string,
        message: string
    ): Promise<boolean> => {
        if (!user) {
            setError('You must be logged in to send an inquiry');
            return false;
        }

        if (!message.trim() || !subject.trim()) {
            setError('Subject and message are required');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('seller_inquiries')
                .insert({
                    listing_id: listingId,
                    seller_id: sellerId,
                    buyer_id: user.id,
                    subject: subject.trim(),
                    message: message.trim(),
                    status: 'new'
                });

            if (insertError) throw insertError;
            return true;
        } catch (err) {
            console.error('[useSendInquiry] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send inquiry');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { sendInquiry, isLoading, error };
};

/**
 * Hook to mark an inquiry as read
 */
export const useMarkInquiryRead = () => {
    const markAsRead = async (inquiryId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('seller_inquiries')
                .update({ status: 'read' })
                .eq('id', inquiryId)
                .eq('status', 'new'); // Only update if it's currently 'new'

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('[useMarkInquiryRead] Error:', err);
            return false;
        }
    };

    return { markAsRead };
};

/**
 * Hook to reply to an inquiry
 */
export const useReplyToInquiry = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const replyToInquiry = async (inquiryId: string, reply: string): Promise<boolean> => {
        if (!user) {
            setError('You must be logged in to reply');
            return false;
        }

        if (!reply.trim()) {
            setError('Reply message is required');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('seller_inquiries')
                .update({
                    seller_reply: reply.trim(),
                    status: 'replied'
                    // replied_at will be auto-set by trigger
                })
                .eq('id', inquiryId);

            if (updateError) throw updateError;
            return true;
        } catch (err) {
            console.error('[useReplyToInquiry] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send reply');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { replyToInquiry, isLoading, error };
};
