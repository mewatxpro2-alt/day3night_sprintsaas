import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// =====================================================
// TYPES
// =====================================================

export interface RefundRequest {
    id: string;
    order_id: string;
    reason: 'not_as_described' | 'technical_issues' | 'missing_files' | 'quality_issues' | 'other';
    description: string;
    status: 'reported' | 'under_review' | 'approved' | 'completed' | 'rejected';
    admin_notes?: string;
    refund_amount?: number;
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    completed_at?: string;
    // Joined data
    order?: {
        order_number: string;
        price_amount: number;
        buyer_id?: string;
        listing?: {
            title: string;
        };
        seller?: {
            full_name: string;
        };
        buyer?: {
            full_name: string;
            email?: string;
        };
    };
}

interface CreateRefundData {
    orderId: string;
    reason: RefundRequest['reason'];
    description: string;
}

// =====================================================
// FETCH REFUND REQUESTS (User)
// =====================================================

export const useMyRefundRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RefundRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;

            try {
                // First get user's order IDs
                const { data: userOrders } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('buyer_id', user.id);

                const orderIds = userOrders?.map(o => o.id) || [];

                if (orderIds.length === 0) {
                    setRequests([]);
                    setIsLoading(false);
                    return;
                }

                const { data, error: fetchError } = await supabase
                    .from('refund_requests')
                    .select(`
                        id, order_id, reason, description, status, admin_notes, refund_amount,
                        created_at, reviewed_at, completed_at,
                        order:orders(order_number, price_amount, listing:listings(title))
                    `)
                    .in('order_id', orderIds)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                setRequests(data as any || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch refund requests');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [user]);

    return { requests, isLoading, error };
};

// =====================================================
// FETCH REFUND REQUESTS (Admin)
// =====================================================

export const useAdminRefundRequests = (statusFilter: string = 'all') => {
    const [requests, setRequests] = useState<RefundRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('refund_requests')
                .select(`
                    id, order_id, reason, description, status, admin_notes, refund_amount,
                    created_at, reviewed_at, reviewed_by, completed_at,
                    order:orders(order_number, price_amount, buyer_id, listing:listings(title), seller:profiles!orders_seller_id_fkey(full_name), buyer:profiles!orders_buyer_id_fkey(full_name, email))
                `)
                .order('created_at', { ascending: false });

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                // Handle case where table doesn't exist yet
                if (fetchError.message?.includes('relation') && fetchError.message?.includes('does not exist')) {
                    console.warn('refund_requests table does not exist yet. Please run the migration.');
                    setRequests([]);
                    setError('Refund requests table not found. Please run database migration.');
                    return;
                }
                throw fetchError;
            }
            setRequests(data as any || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch refund requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    return { requests, isLoading, error, refetch: fetchRequests };
};

// =====================================================
// CREATE REFUND REQUEST
// =====================================================

export const useCreateRefundRequest = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createRequest = async (data: CreateRefundData) => {
        if (!user) return { success: false, error: 'Not logged in' };

        setIsLoading(true);
        setError(null);

        try {
            // Get order details for refund amount
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('price_amount, buyer_id')
                .eq('id', data.orderId)
                .single();

            if (orderError || !order) {
                throw new Error('Order not found');
            }

            if (order.buyer_id !== user.id) {
                throw new Error('You can only request refunds for your own orders');
            }

            // Check if refund request already exists for this order
            const { data: existing, error: checkError } = await supabase
                .from('refund_requests')
                .select('id')
                .eq('order_id', data.orderId)
                .eq('buyer_id', user.id)
                .neq('status', 'rejected');

            // Handle case where table doesn't exist
            if (checkError) {
                if (checkError.message?.includes('relation') && checkError.message?.includes('does not exist')) {
                    throw new Error('Refund system is not configured. Please contact support or run database migration.');
                }
                // For other errors, continue (might just be no results)
            }

            if (existing && existing.length > 0) {
                throw new Error('A refund request already exists for this order');
            }

            // Create refund request
            const { data: request, error: createError } = await supabase
                .from('refund_requests')
                .insert({
                    order_id: data.orderId,
                    reason: data.reason,
                    description: data.description,
                    status: 'reported', // Matches DB CHECK constraint
                    refund_amount: order.price_amount,
                })
                .select('id')
                .single();

            if (createError) {
                if (createError.message?.includes('relation') && createError.message?.includes('does not exist')) {
                    throw new Error('Refund system is not configured. Please contact support or run database migration.');
                }
                throw createError;
            }

            return { success: true, requestId: request.id };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create refund request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { createRequest, isLoading, error };
};

// =====================================================
// UPDATE REFUND STATUS (Admin)
// =====================================================

export const useUpdateRefundStatus = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const updateStatus = async (
        requestId: string,
        status: 'under_review' | 'approved' | 'completed' | 'rejected',
        adminNotes?: string
    ) => {
        if (!user) return { success: false };

        setIsLoading(true);

        try {
            const updates: any = {
                status,
                admin_notes: adminNotes || null,
            };

            if (['approved', 'rejected', 'completed'].includes(status)) {
                updates.reviewed_at = new Date().toISOString();
                updates.reviewed_by = user.id;
            }

            if (status === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            // If completed, update order status to refunded
            if (status === 'completed') {
                const { data: request } = await supabase
                    .from('refund_requests')
                    .select('order_id, refund_amount')
                    .eq('id', requestId)
                    .single();

                if (request) {
                    // Update order status to refunded
                    await supabase
                        .from('orders')
                        .update({ status: 'refunded' })
                        .eq('id', request.order_id);
                }
            }

            const { error } = await supabase
                .from('refund_requests')
                .update(updates)
                .eq('id', requestId);

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

// =====================================================
// SELLER WITHDRAWALS
// =====================================================

export interface SellerWithdrawal {
    id: string;
    seller_id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    payment_method?: string;
    payment_details?: any;
    admin_notes?: string;
    created_at: string;
    processed_at?: string;
    // Joined data
    seller?: {
        full_name: string;
        email?: string;
    };
}

export const useSellerBalance = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState({
        available: 0,
        pending: 0,
        withdrawn: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!user) return;

            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('available_balance, pending_balance, withdrawn_total')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setBalance({
                        available: data.available_balance || 0,
                        pending: data.pending_balance || 0,
                        withdrawn: data.withdrawn_total || 0,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch balance:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalance();
    }, [user]);

    return { balance, isLoading };
};

export const useMyWithdrawals = () => {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState<SellerWithdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('seller_withdrawals')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            setWithdrawals(data || []);
            setIsLoading(false);
        };

        fetch();
    }, [user]);

    return { withdrawals, isLoading };
};

export const useRequestWithdrawal = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const requestWithdrawal = async (amount: number, paymentMethod: string, paymentDetails: any) => {
        if (!user) return { success: false, error: 'Not logged in' };

        setIsLoading(true);

        try {
            // Check available balance
            const { data: profile } = await supabase
                .from('profiles')
                .select('available_balance')
                .eq('id', user.id)
                .single();

            if (!profile || profile.available_balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Create withdrawal request
            const { error } = await supabase
                .from('seller_withdrawals')
                .insert({
                    seller_id: user.id,
                    amount,
                    status: 'pending',
                    payment_method: paymentMethod,
                    payment_details: paymentDetails,
                });

            if (error) throw error;

            // Deduct from available balance (will be confirmed when processed)
            await supabase
                .from('profiles')
                .update({
                    available_balance: profile.available_balance - amount
                })
                .eq('id', user.id);

            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to request withdrawal' };
        } finally {
            setIsLoading(false);
        }
    };

    return { requestWithdrawal, isLoading };
};

// Admin hook for withdrawals
export const useAdminWithdrawals = (statusFilter: string = 'all') => {
    const [withdrawals, setWithdrawals] = useState<SellerWithdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetch = async () => {
        setIsLoading(true);

        let query = supabase
            .from('seller_withdrawals')
            .select(`
                id, seller_id, amount, status, payment_method, payment_details, admin_notes,
                created_at, processed_at,
                seller:profiles!seller_withdrawals_seller_id_fkey(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter);
        }

        const { data } = await query;
        setWithdrawals(data as any || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetch();
    }, [statusFilter]);

    return { withdrawals, isLoading, refetch: fetch };
};

export const useProcessWithdrawal = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const processWithdrawal = async (
        withdrawalId: string,
        status: 'processing' | 'completed' | 'rejected',
        adminNotes?: string
    ) => {
        if (!user) return { success: false };

        setIsLoading(true);

        try {
            const updates: any = {
                status,
                admin_notes: adminNotes || null,
            };

            if (status === 'completed' || status === 'rejected') {
                updates.processed_at = new Date().toISOString();
                updates.processed_by = user.id;
            }

            // If rejected, refund the amount back to available balance
            if (status === 'rejected') {
                const { data: withdrawal } = await supabase
                    .from('seller_withdrawals')
                    .select('seller_id, amount')
                    .eq('id', withdrawalId)
                    .single();

                if (withdrawal) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('available_balance')
                        .eq('id', withdrawal.seller_id)
                        .single();

                    if (profile) {
                        await supabase
                            .from('profiles')
                            .update({
                                available_balance: profile.available_balance + withdrawal.amount
                            })
                            .eq('id', withdrawal.seller_id);
                    }
                }
            }

            // If completed, add to withdrawn_total
            if (status === 'completed') {
                const { data: withdrawal } = await supabase
                    .from('seller_withdrawals')
                    .select('seller_id, amount')
                    .eq('id', withdrawalId)
                    .single();

                if (withdrawal) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('withdrawn_total')
                        .eq('id', withdrawal.seller_id)
                        .single();

                    if (profile) {
                        await supabase
                            .from('profiles')
                            .update({
                                withdrawn_total: (profile.withdrawn_total || 0) + withdrawal.amount
                            })
                            .eq('id', withdrawal.seller_id);
                    }
                }
            }

            const { error } = await supabase
                .from('seller_withdrawals')
                .update(updates)
                .eq('id', withdrawalId);

            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to process withdrawal' };
        } finally {
            setIsLoading(false);
        }
    };

    return { processWithdrawal, isLoading };
};
