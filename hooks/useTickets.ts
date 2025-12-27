import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// =====================================================
// TYPES
// =====================================================

export interface Ticket {
    id: string;
    ticket_number: string;
    order_id?: string;
    listing_id?: string;
    created_by: string;
    subject: string;
    category: 'delivery_issue' | 'clarification' | 'refund_request' | 'technical' | 'other';
    status: 'open' | 'waiting' | 'under_review' | 'resolved';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    source?: 'order' | 'contact_us' | 'dispute' | 'direct' | 'refund';
    buyer_id?: string;
    seller_id?: string;
    involves_admin: boolean;
    contact_email?: string;
    contact_name?: string;
    created_at: string;
    updated_at?: string;
    resolved_at?: string;
    // Joined data
    order?: {
        order_number: string;
        listing?: {
            title: string;
        };
    };
    creator?: {
        full_name: string;
        avatar_url?: string;
    };
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    content: string;
    attachment_url?: string;
    attachment_name?: string;
    is_internal: boolean;
    created_at: string;
    sender?: {
        full_name: string;
        avatar_url?: string;
        role?: string;
    };
}

interface CreateTicketData {
    orderId?: string;
    subject: string;
    category: Ticket['category'];
    message: string;
    buyerId?: string;
    sellerId?: string;
    involvesAdmin?: boolean;
}

// =====================================================
// FETCH TICKETS
// =====================================================

export const useTickets = (options: { status?: string; myTicketsOnly?: boolean; isAdmin?: boolean } = {}) => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            if (!user) return;

            try {
                setIsLoading(true);

                // For admin users, try using the RPC function first (bypasses RLS)
                if (options.isAdmin) {
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc('get_admin_tickets', {
                            p_status: options.status === 'all' ? null : (options.status || null)
                        });

                    if (!rpcError && rpcData) {
                        // Transform RPC data to match Ticket interface
                        const transformedTickets = rpcData.map((t: any) => ({
                            id: t.id,
                            ticket_number: t.ticket_number,
                            order_id: t.order_id,
                            listing_id: t.listing_id,
                            created_by: t.created_by,
                            subject: t.subject,
                            category: t.category,
                            status: t.status,
                            priority: t.priority,
                            source: t.source,
                            buyer_id: t.buyer_id,
                            seller_id: t.seller_id,
                            involves_admin: t.involves_admin,
                            contact_email: t.contact_email,
                            contact_name: t.contact_name,
                            created_at: t.created_at,
                            updated_at: t.updated_at,
                            resolved_at: t.resolved_at,
                            order: t.order_number ? {
                                order_number: t.order_number,
                                listing: t.listing_title ? { title: t.listing_title } : undefined
                            } : undefined,
                            creator: t.creator_name ? {
                                full_name: t.creator_name,
                                avatar_url: t.creator_avatar
                            } : undefined
                        }));
                        setTickets(transformedTickets);
                        setIsLoading(false);
                        return;
                    }
                    // If RPC fails (function doesn't exist yet), fall back to regular query
                    console.log('Admin RPC not available, falling back to regular query');
                }

                // Regular query (for non-admin or fallback)
                let query = supabase
                    .from('tickets')
                    .select(`
                        id, ticket_number, order_id, listing_id, created_by, subject, category, status, priority,
                        buyer_id, seller_id, involves_admin, created_at, updated_at, resolved_at,
                        source, contact_email, contact_name,
                        order:orders(order_number, listing:listings(title)),
                        creator:profiles!tickets_created_by_fkey(full_name, avatar_url)
                    `)
                    .order('created_at', { ascending: false });

                // Filter by status
                if (options.status && options.status !== 'all') {
                    query = query.eq('status', options.status);
                }

                // Filter by user's tickets only (for non-admin)
                if (options.myTicketsOnly) {
                    query = query.or(`created_by.eq.${user.id},buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
                }

                const { data, error: fetchError } = await query;

                if (fetchError) throw fetchError;
                setTickets(data as any || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, [user, options.status, options.myTicketsOnly, options.isAdmin]);

    const refetch = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // For admin users, use RPC function
            if (options.isAdmin) {
                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_admin_tickets', {
                        p_status: options.status === 'all' ? null : (options.status || null)
                    });

                if (!rpcError && rpcData) {
                    const transformedTickets = rpcData.map((t: any) => ({
                        id: t.id,
                        ticket_number: t.ticket_number,
                        order_id: t.order_id,
                        listing_id: t.listing_id,
                        created_by: t.created_by,
                        subject: t.subject,
                        category: t.category,
                        status: t.status,
                        priority: t.priority,
                        source: t.source,
                        buyer_id: t.buyer_id,
                        seller_id: t.seller_id,
                        involves_admin: t.involves_admin,
                        contact_email: t.contact_email,
                        contact_name: t.contact_name,
                        created_at: t.created_at,
                        updated_at: t.updated_at,
                        resolved_at: t.resolved_at,
                        order: t.order_number ? {
                            order_number: t.order_number,
                            listing: t.listing_title ? { title: t.listing_title } : undefined
                        } : undefined,
                        creator: t.creator_name ? {
                            full_name: t.creator_name,
                            avatar_url: t.creator_avatar
                        } : undefined
                    }));
                    setTickets(transformedTickets);
                    setIsLoading(false);
                    return;
                }
            }

            // Regular query fallback
            let query = supabase
                .from('tickets')
                .select(`
                    id, ticket_number, order_id, listing_id, created_by, subject, category, status, priority,
                    buyer_id, seller_id, involves_admin, created_at, updated_at, resolved_at,
                    source, contact_email, contact_name,
                    order:orders(order_number, listing:listings(title)),
                    creator:profiles!tickets_created_by_fkey(full_name, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (options.status && options.status !== 'all') {
                query = query.eq('status', options.status);
            }
            if (options.myTicketsOnly) {
                query = query.or(`created_by.eq.${user.id},buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setTickets(data as any || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
        } finally {
            setIsLoading(false);
        }
    };

    return { tickets, isLoading, error, refetch };
};

// =====================================================
// FETCH SINGLE TICKET WITH MESSAGES
// =====================================================

export const useTicketDetail = (ticketId: string | undefined) => {
    const { user } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTicket = async () => {
        if (!ticketId || !user) return;

        try {
            setIsLoading(true);

            // Fetch ticket
            const { data: ticketData, error: ticketError } = await supabase
                .from('tickets')
                .select(`
                    id, ticket_number, order_id, created_by, subject, category, status, priority,
                    buyer_id, seller_id, involves_admin, created_at, updated_at, resolved_at,
                    order:orders(order_number, listing:listings(title)),
                    creator:profiles!tickets_created_by_fkey(full_name, avatar_url)
                `)
                .eq('id', ticketId)
                .single();

            if (ticketError) throw ticketError;
            setTicket(ticketData as any);

            // Fetch messages
            const { data: messagesData, error: messagesError } = await supabase
                .from('ticket_messages')
                .select(`
                    id, ticket_id, sender_id, content, attachment_url, attachment_name, is_internal, created_at,
                    sender:profiles!ticket_messages_sender_id_fkey(full_name, avatar_url, role)
                `)
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true });

            if (messagesError) throw messagesError;
            setMessages(messagesData as any || []);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId, user]);

    return { ticket, messages, isLoading, error, refetch: fetchTicket };
};

// =====================================================
// CREATE TICKET
// =====================================================

export const useCreateTicket = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTicket = async (data: CreateTicketData) => {
        if (!user) return { success: false, error: 'Not logged in' };

        setIsLoading(true);
        setError(null);

        try {
            // Determine source based on context
            const ticketSource = data.orderId ? 'order' : 'direct';

            // Create ticket
            const { data: ticket, error: ticketError } = await supabase
                .from('tickets')
                .insert({
                    order_id: data.orderId || null,
                    created_by: user.id,
                    subject: data.subject,
                    category: data.category,
                    status: 'open',
                    priority: data.category === 'refund_request' ? 'high' : 'normal',
                    buyer_id: data.buyerId || null,
                    seller_id: data.sellerId || null,
                    involves_admin: data.involvesAdmin ?? (data.category === 'refund_request'),
                    source: ticketSource,
                })
                .select('id')
                .single();

            if (ticketError) throw ticketError;

            // Add initial message
            const { error: messageError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticket.id,
                    sender_id: user.id,
                    content: data.message,
                    is_internal: false,
                    sender_role: 'buyer', // User creating ticket is treated as buyer
                    visibility: 'all',
                });

            if (messageError) throw messageError;

            return { success: true, ticketId: ticket.id };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { createTicket, isLoading, error };
};

// =====================================================
// SEND MESSAGE
// =====================================================

export const useSendTicketMessage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (ticketId: string, content: string, attachmentUrl?: string, attachmentName?: string) => {
        if (!user) return { success: false, error: 'Not logged in' };

        setIsLoading(true);
        setError(null);

        try {
            const { error: messageError } = await supabase
                .from('ticket_messages')
                .insert({
                    ticket_id: ticketId,
                    sender_id: user.id,
                    content,
                    attachment_url: attachmentUrl || null,
                    attachment_name: attachmentName || null,
                    is_internal: false,
                });

            if (messageError) throw messageError;

            // Update ticket updated_at
            await supabase
                .from('tickets')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', ticketId);

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { sendMessage, isLoading, error };
};

// =====================================================
// UPDATE TICKET STATUS
// =====================================================

export const useUpdateTicketStatus = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const updateStatus = async (ticketId: string, status: Ticket['status']) => {
        if (!user) return { success: false };

        setIsLoading(true);

        try {
            const updates: any = {
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'resolved') {
                updates.resolved_at = new Date().toISOString();
                updates.resolved_by = user.id;
            }

            const { error } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', ticketId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to update status' };
        } finally {
            setIsLoading(false);
        }
    };

    return { updateStatus, isLoading };
};
