import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

type ActionType = 'approve' | 'reject' | 'publish' | 'unpublish' | 'edit' | 'soft_delete';

interface AdminActionLog {
    action_type: ActionType;
    target_type: 'submission' | 'listing';
    target_id: string;
    changes?: Record<string, unknown>;
    reason?: string;
}

/**
 * Log admin action to audit table
 */
const logAdminAction = async (adminId: string, log: AdminActionLog) => {
    try {
        await supabase.from('admin_actions').insert({
            admin_id: adminId,
            action_type: log.action_type,
            target_type: log.target_type,
            target_id: log.target_id,
            changes: log.changes || null,
            reason: log.reason || null,
        });
        console.log('[AdminAction] Logged:', log.action_type, log.target_id);
    } catch (err) {
        console.error('[AdminAction] Failed to log action:', err);
        // Don't throw - logging failure shouldn't block the action
    }
};

/**
 * Hook for admin kit actions: publish, unpublish, edit, soft delete
 */
export const useAdminKitActions = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Publish a listing (set status to 'live')
     */
    const publishKit = useCallback(async (listingId: string) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'live',
                    is_live: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await logAdminAction(user.id, {
                action_type: 'publish',
                target_type: 'listing',
                target_id: listingId,
            });

            console.log('[AdminKitActions] Published listing:', listingId);
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to publish';
            console.error('[AdminKitActions] Publish error:', err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Unpublish a listing (set status to 'unpublished')
     */
    const unpublishKit = useCallback(async (listingId: string, reason?: string) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    moderation_status: 'unpublished',
                    is_live: false,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await logAdminAction(user.id, {
                action_type: 'unpublish',
                target_type: 'listing',
                target_id: listingId,
                reason,
            });

            console.log('[AdminKitActions] Unpublished listing:', listingId);
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to unpublish';
            console.error('[AdminKitActions] Unpublish error:', err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Edit listing metadata (title, category, price, featured, verified)
     */
    const editKitMetadata = useCallback(async (
        listingId: string,
        updates: {
            title?: string;
            category_id?: string;
            price?: number;
            is_featured?: boolean;
        }
    ) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            // Get current values for audit log
            const { data: current } = await supabase
                .from('listings')
                .select('title, category_id, price, is_featured')
                .eq('id', listingId)
                .single();

            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await logAdminAction(user.id, {
                action_type: 'edit',
                target_type: 'listing',
                target_id: listingId,
                changes: {
                    before: current,
                    after: updates,
                },
            });

            console.log('[AdminKitActions] Edited listing:', listingId, updates);
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to edit';
            console.error('[AdminKitActions] Edit error:', err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Soft delete a listing (set deleted_at timestamp)
     */
    const softDeleteKit = useCallback(async (listingId: string, reason?: string) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    deleted_at: new Date().toISOString(),
                    is_live: false,
                    moderation_status: 'unpublished',
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            await logAdminAction(user.id, {
                action_type: 'soft_delete',
                target_type: 'listing',
                target_id: listingId,
                reason,
            });

            console.log('[AdminKitActions] Soft deleted listing:', listingId);
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete';
            console.error('[AdminKitActions] Delete error:', err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    /**
     * Restore a soft-deleted listing
     */
    const restoreKit = useCallback(async (listingId: string) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('listings')
                .update({
                    deleted_at: null,
                    moderation_status: 'unpublished', // Restored but not live
                })
                .eq('id', listingId);

            if (updateError) throw updateError;

            console.log('[AdminKitActions] Restored listing:', listingId);
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to restore';
            console.error('[AdminKitActions] Restore error:', err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    return {
        publishKit,
        unpublishKit,
        editKitMetadata,
        softDeleteKit,
        restoreKit,
        isLoading,
        error,
    };
};
