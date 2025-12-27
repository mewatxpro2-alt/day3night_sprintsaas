import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ModerationStatus, ModerationAction } from '../types/marketplace';

// =====================================================
// LISTING MODERATION HOOKS
// =====================================================

interface ListingModerationItem {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    moderation_status: ModerationStatus;
    moderation_notes?: string;
    created_at: string;
    creator: {
        id: string;
        full_name?: string;
        email?: string;
    };
}

interface UseModerationQueueResult {
    listings: ListingModerationItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    counts: {
        submitted: number;
        pending_review: number;
        total: number;
    };
}

// =====================================================
// Get Moderation Queue
// =====================================================

export const useModerationQueue = (): UseModerationQueueResult => {
    const [listings, setListings] = useState<ListingModerationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState({ submitted: 0, pending_review: 0, total: 0 });

    const fetchQueue = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('listings')
                .select(`
                    id,
                    title,
                    description,
                    price,
                    image_url,
                    moderation_status,
                    moderation_notes,
                    created_at,
                    creator:profiles!listings_creator_id_fkey(id, full_name, email)
                `)
                .in('moderation_status', ['submitted', 'pending_review'])
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            const items = data || [];
            setListings(items);
            setCounts({
                submitted: items.filter(l => l.moderation_status === 'submitted').length,
                pending_review: items.filter(l => l.moderation_status === 'pending_review').length,
                total: items.length
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch moderation queue');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    return { listings, isLoading, error, refetch: fetchQueue, counts };
};

// =====================================================
// Approve Listing
// =====================================================

export const useApproveListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approveListing = async (
        listingId: string,
        notes?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get current state
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status, title')
                .eq('id', listingId)
                .single();

            // Update listing
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'approved',
                    moderation_notes: notes,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString(),
                    is_live: true
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'approve',
                previous_state: { moderation_status: listing?.moderation_status },
                new_state: { moderation_status: 'approved' },
                notes
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { approveListing, isLoading, error };
};

// =====================================================
// Reject Listing
// =====================================================

export const useRejectListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rejectListing = async (
        listingId: string,
        reason: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get current state
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status')
                .eq('id', listingId)
                .single();

            // Update listing
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'removed',
                    moderation_notes: reason,
                    removal_reason: reason,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString(),
                    is_live: false
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'reject',
                previous_state: { moderation_status: listing?.moderation_status },
                new_state: { moderation_status: 'removed' },
                reason
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { rejectListing, isLoading, error };
};

// =====================================================
// Hide Listing (Temporary)
// =====================================================

export const useHideListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hideListing = async (
        listingId: string,
        reason: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'hidden',
                    moderation_notes: reason,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString(),
                    is_live: false
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'hide',
                previous_state: { moderation_status: listing?.moderation_status },
                new_state: { moderation_status: 'hidden' },
                reason,
                is_reversible: true
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to hide listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { hideListing, isLoading, error };
};

// =====================================================
// Unhide Listing
// =====================================================

export const useUnhideListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unhideListing = async (
        listingId: string,
        notes?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'approved',
                    moderation_notes: notes,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString(),
                    is_live: true
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'unhide',
                previous_state: { moderation_status: listing?.moderation_status },
                new_state: { moderation_status: 'approved' },
                notes
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unhide listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { unhideListing, isLoading, error };
};

// =====================================================
// Remove Listing (Permanent)
// =====================================================

export const useRemoveListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeListing = async (
        listingId: string,
        reason: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status, title')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'removed',
                    removal_reason: reason,
                    moderation_notes: reason,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString(),
                    is_live: false
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'remove',
                previous_state: {
                    moderation_status: listing?.moderation_status,
                    title: listing?.title
                },
                new_state: { moderation_status: 'removed' },
                reason,
                is_reversible: true
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { removeListing, isLoading, error };
};

// =====================================================
// Feature Listing
// =====================================================

export const useFeatureListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const featureListing = async (
        listingId: string,
        notes?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status, is_featured')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'featured',
                    is_featured: true,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString()
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'feature',
                previous_state: {
                    moderation_status: listing?.moderation_status,
                    is_featured: listing?.is_featured
                },
                new_state: { moderation_status: 'featured', is_featured: true },
                notes
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to feature listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { featureListing, isLoading, error };
};

// =====================================================
// Unfeature Listing
// =====================================================

export const useUnfeatureListing = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unfeatureListing = async (
        listingId: string,
        notes?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: listing } = await supabase
                .from('listings')
                .select('moderation_status')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'approved',
                    is_featured: false,
                    moderated_by: user.id,
                    moderated_at: new Date().toISOString()
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'listing',
                target_id: listingId,
                action_type: 'unfeature',
                previous_state: { moderation_status: listing?.moderation_status },
                new_state: { moderation_status: 'approved', is_featured: false },
                notes
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unfeature listing');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { unfeatureListing, isLoading, error };
};

// =====================================================
// Get Listing Moderation History
// =====================================================

export const useListingModerationHistory = (listingId: string) => {
    const [actions, setActions] = useState<ModerationAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!listingId) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('moderation_actions')
                .select(`
                    *,
                    admin:profiles!moderation_actions_admin_id_fkey(id, full_name)
                `)
                .eq('target_type', 'listing')
                .eq('target_id', listingId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setActions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch history');
        } finally {
            setIsLoading(false);
        }
    }, [listingId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { actions, isLoading, error, refetch: fetchHistory };
};
