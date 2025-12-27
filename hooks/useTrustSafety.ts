import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type {
    UserFlag,
    UserRestriction,
    FlagType,
    RestrictionType,
    AccountStatus,
    ModerationAction
} from '../types/marketplace';

// =====================================================
// ADMIN HOOKS: User Flag Management
// =====================================================

interface UseUserFlagsResult {
    flags: UserFlag[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useUserFlags = (userId: string): UseUserFlagsResult => {
    const [flags, setFlags] = useState<UserFlag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFlags = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('user_flags')
                .select(`
                    *,
                    user:profiles!user_flags_user_id_fkey(id, full_name, email),
                    flagger:profiles!user_flags_flagged_by_fkey(id, full_name)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setFlags(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch flags');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFlags();
    }, [fetchFlags]);

    return { flags, isLoading, error, refetch: fetchFlags };
};

// =====================================================
// Flag User
// =====================================================

interface FlagUserParams {
    userId: string;
    flagType: FlagType;
    reason: string;
    evidenceUrls?: string[];
}

export const useFlagUser = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flagUser = async (params: FlagUserParams): Promise<UserFlag | null> => {
        if (!user) {
            setError('Not authenticated');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create the flag
            const { data: flag, error: flagError } = await supabase
                .from('user_flags')
                .insert({
                    user_id: params.userId,
                    flag_type: params.flagType,
                    reason: params.reason,
                    evidence_urls: params.evidenceUrls || [],
                    flagged_by: user.id,
                    is_system_generated: false,
                    is_active: true
                })
                .select()
                .single();

            if (flagError) throw flagError;

            // Update profile is_flagged status
            await supabase
                .from('profiles')
                .update({
                    is_flagged: true,
                    flagged_at: new Date().toISOString()
                })
                .eq('id', params.userId);

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: params.userId,
                action_type: 'flag',
                new_state: { flag_type: params.flagType },
                reason: params.reason,
                evidence_urls: params.evidenceUrls
            });

            return flag;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to flag user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { flagUser, isLoading, error };
};

// =====================================================
// Unflag User
// =====================================================

export const useUnflagUser = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unflagUser = async (
        flagId: string,
        resolutionNotes?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get flag details first
            const { data: flag } = await supabase
                .from('user_flags')
                .select('user_id, flag_type')
                .eq('id', flagId)
                .single();

            if (!flag) throw new Error('Flag not found');

            // Deactivate the flag
            const { error: updateError } = await supabase
                .from('user_flags')
                .update({
                    is_active: false,
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.id,
                    resolution_notes: resolutionNotes
                })
                .eq('id', flagId);

            if (updateError) throw updateError;

            // Check if user has any other active flags
            const { count } = await supabase
                .from('user_flags')
                .select('id', { count: 'exact' })
                .eq('user_id', flag.user_id)
                .eq('is_active', true);

            // If no more active flags, update profile
            if (count === 0) {
                await supabase
                    .from('profiles')
                    .update({ is_flagged: false, flagged_at: null })
                    .eq('id', flag.user_id);
            }

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: flag.user_id,
                action_type: 'unflag',
                previous_state: { flag_type: flag.flag_type },
                notes: resolutionNotes
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unflag user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { unflagUser, isLoading, error };
};

// =====================================================
// Restrict User
// =====================================================

interface RestrictUserParams {
    userId: string;
    restrictionType: RestrictionType;
    reason: string;
    expiresAt?: string; // ISO date, null for permanent
}

export const useRestrictUser = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const restrictUser = async (params: RestrictUserParams): Promise<UserRestriction | null> => {
        if (!user) {
            setError('Not authenticated');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: restriction, error: restrictError } = await supabase
                .from('user_restrictions')
                .insert({
                    user_id: params.userId,
                    restriction_type: params.restrictionType,
                    reason: params.reason,
                    expires_at: params.expiresAt,
                    applied_by: user.id,
                    is_active: true
                })
                .select()
                .single();

            if (restrictError) throw restrictError;

            // Update account status if first restriction
            await supabase
                .from('profiles')
                .update({ account_status: 'restricted' })
                .eq('id', params.userId)
                .eq('account_status', 'active');

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: params.userId,
                action_type: 'restrict',
                new_state: {
                    restriction_type: params.restrictionType,
                    expires_at: params.expiresAt
                },
                reason: params.reason
            });

            return restriction;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restrict user');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { restrictUser, isLoading, error };
};

// =====================================================
// Lift Restriction
// =====================================================

export const useLiftRestriction = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const liftRestriction = async (
        restrictionId: string,
        reason?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get restriction details
            const { data: restriction } = await supabase
                .from('user_restrictions')
                .select('user_id, restriction_type')
                .eq('id', restrictionId)
                .single();

            if (!restriction) throw new Error('Restriction not found');

            // Lift the restriction
            const { error: updateError } = await supabase
                .from('user_restrictions')
                .update({
                    is_active: false,
                    lifted_at: new Date().toISOString(),
                    lifted_by: user.id,
                    lift_reason: reason
                })
                .eq('id', restrictionId);

            if (updateError) throw updateError;

            // Check if user has any other active restrictions
            const { count } = await supabase
                .from('user_restrictions')
                .select('id', { count: 'exact' })
                .eq('user_id', restriction.user_id)
                .eq('is_active', true);

            // If no more active restrictions and not banned, set to active
            if (count === 0) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('account_status')
                    .eq('id', restriction.user_id)
                    .single();

                if (profile?.account_status === 'restricted') {
                    await supabase
                        .from('profiles')
                        .update({ account_status: 'active' })
                        .eq('id', restriction.user_id);
                }
            }

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: restriction.user_id,
                action_type: 'unrestrict',
                previous_state: { restriction_type: restriction.restriction_type },
                notes: reason
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lift restriction');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { liftRestriction, isLoading, error };
};

// =====================================================
// Ban User
// =====================================================

export const useBanUser = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const banUser = async (
        userId: string,
        reason: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get current state for audit
            const { data: profile } = await supabase
                .from('profiles')
                .select('account_status')
                .eq('id', userId)
                .single();

            // Ban the user
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    account_status: 'banned',
                    banned_at: new Date().toISOString(),
                    banned_reason: reason,
                    banned_by: user.id
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: userId,
                action_type: 'ban',
                previous_state: { account_status: profile?.account_status },
                new_state: { account_status: 'banned' },
                reason: reason,
                is_reversible: true
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to ban user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { banUser, isLoading, error };
};

// =====================================================
// Unban User
// =====================================================

export const useUnbanUser = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const unbanUser = async (
        userId: string,
        reason?: string
    ): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Unban the user
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    account_status: 'active',
                    banned_at: null,
                    banned_reason: null,
                    banned_by: null
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Log moderation action
            await supabase.from('moderation_actions').insert({
                admin_id: user.id,
                target_type: 'user',
                target_id: userId,
                action_type: 'unban',
                previous_state: { account_status: 'banned' },
                new_state: { account_status: 'active' },
                notes: reason
            });

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unban user');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { unbanUser, isLoading, error };
};

// =====================================================
// Self-Check Hooks (for UI gating)
// =====================================================

interface UseMyRestrictionsResult {
    restrictions: UserRestriction[];
    isLoading: boolean;
    hasRestriction: (type: RestrictionType) => boolean;
    canPerformAction: (action: 'purchase' | 'sell' | 'message' | 'review') => boolean;
}

export const useMyRestrictions = (): UseMyRestrictionsResult => {
    const { user } = useAuth();
    const [restrictions, setRestrictions] = useState<UserRestriction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRestrictions = async () => {
            if (!user) {
                setRestrictions([]);
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from('user_restrictions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true);

                // Filter out expired restrictions client-side
                const activeRestrictions = (data || []).filter(r =>
                    !r.expires_at || new Date(r.expires_at) > new Date()
                );

                setRestrictions(activeRestrictions);
            } catch (err) {
                console.error('Error fetching restrictions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestrictions();
    }, [user]);

    const hasRestriction = useCallback((type: RestrictionType): boolean => {
        return restrictions.some(r => r.restriction_type === type);
    }, [restrictions]);

    const canPerformAction = useCallback((action: 'purchase' | 'sell' | 'message' | 'review'): boolean => {
        // Read-only blocks everything
        if (hasRestriction('read_only')) return false;

        const actionToRestriction: Record<string, RestrictionType> = {
            purchase: 'no_purchase',
            sell: 'no_sell',
            message: 'no_message',
            review: 'no_review'
        };

        return !hasRestriction(actionToRestriction[action]);
    }, [hasRestriction]);

    return { restrictions, isLoading, hasRestriction, canPerformAction };
};

// =====================================================
// User Restrictions (Admin view for specific user)
// =====================================================

export const useUserRestrictions = (userId: string) => {
    const [restrictions, setRestrictions] = useState<UserRestriction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRestrictions = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('user_restrictions')
                .select(`
                    *,
                    applier:profiles!user_restrictions_applied_by_fkey(id, full_name)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setRestrictions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch restrictions');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRestrictions();
    }, [fetchRestrictions]);

    return { restrictions, isLoading, error, refetch: fetchRestrictions };
};

// =====================================================
// Moderation Actions History
// =====================================================

interface UseModerationHistoryResult {
    actions: ModerationAction[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useModerationHistory = (
    targetType?: 'user' | 'listing',
    targetId?: string
): UseModerationHistoryResult => {
    const [actions, setActions] = useState<ModerationAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('moderation_actions')
                .select(`
                    *,
                    admin:profiles!moderation_actions_admin_id_fkey(id, full_name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (targetType) {
                query = query.eq('target_type', targetType);
            }
            if (targetId) {
                query = query.eq('target_id', targetId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setActions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch moderation history');
        } finally {
            setIsLoading(false);
        }
    }, [targetType, targetId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { actions, isLoading, error, refetch: fetchHistory };
};
