import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UseSellerFollowResult {
    isFollowing: boolean;
    followersCount: number;
    isLoading: boolean;
    toggleFollow: () => Promise<void>;
}

export const useSellerFollow = (sellerId: string): UseSellerFollowResult => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch follow status and count
    const fetchFollowData = useCallback(async () => {
        if (!sellerId) {
            setIsLoading(false);
            return;
        }

        try {
            // Get followers count from profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('followers_count')
                .eq('id', sellerId)
                .single();

            setFollowersCount(profileData?.followers_count || 0);

            // Check if current user is following
            if (user) {
                const { data: followData } = await supabase
                    .from('seller_follows')
                    .select('id')
                    .eq('follower_user_id', user.id)
                    .eq('seller_id', sellerId)
                    .single();

                setIsFollowing(!!followData);
            }
        } catch (error) {
            // PGRST116 means no rows found which is fine
            console.debug('Follow check:', error);
        } finally {
            setIsLoading(false);
        }
    }, [sellerId, user]);

    useEffect(() => {
        fetchFollowData();
    }, [fetchFollowData]);

    const toggleFollow = async () => {
        if (!user || !sellerId) return;

        setIsLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                await supabase
                    .from('seller_follows')
                    .delete()
                    .eq('follower_user_id', user.id)
                    .eq('seller_id', sellerId);

                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
            } else {
                // Follow
                await supabase
                    .from('seller_follows')
                    .insert({
                        follower_user_id: user.id,
                        seller_id: sellerId
                    });

                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            // Refetch to ensure state is correct
            await fetchFollowData();
        } finally {
            setIsLoading(false);
        }
    };

    return { isFollowing, followersCount, isLoading, toggleFollow };
};

/**
 * Hook to get follower list for seller dashboard
 */
interface Follower {
    id: string;
    follower_user_id: string;
    created_at: string;
    follower?: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string;
    };
}

export const useSellerFollowers = () => {
    const { user } = useAuth();
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('seller_follows')
                    .select(`
                        id,
                        follower_user_id,
                        created_at,
                        follower:profiles!seller_follows_follower_user_id_fkey(
                            id,
                            full_name,
                            email,
                            avatar_url
                        )
                    `)
                    .eq('seller_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setFollowers(data || []);
            } catch (error) {
                console.error('Error fetching followers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowers();
    }, [user]);

    return { followers, isLoading };
};
