import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface UserRole {
    isSeller: boolean;
    hasSellerActivity: boolean;
    loading: boolean;
}

/**
 * Hook to detect if user has seller activity (submissions, listings, or earnings)
 * Used for smart routing and context-aware navigation
 */
export const useUserRole = (): UserRole => {
    const { user } = useAuth();
    const [isSeller, setIsSeller] = useState(false);
    const [hasSellerActivity, setHasSellerActivity] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSellerActivity = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Check profile for is_seller flag
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_seller')
                    .eq('id', user.id)
                    .single();

                setIsSeller(profile?.is_seller || false);

                // Check for any seller activity
                const [submissionsResult, listingsResult] = await Promise.all([
                    // Check submissions
                    supabase
                        .from('submissions')
                        .select('id', { count: 'exact', head: true })
                        .eq('creator_id', user.id)
                        .limit(1),

                    // Check listings
                    supabase
                        .from('listings')
                        .select('id', { count: 'exact', head: true })
                        .eq('creator_id', user.id)
                        .limit(1),
                ]);

                const hasSubmissions = (submissionsResult.count || 0) > 0;
                const hasListings = (listingsResult.count || 0) > 0;

                setHasSellerActivity(hasSubmissions || hasListings || profile?.is_seller || false);
            } catch (error) {
                console.error('Error checking seller activity:', error);
                setHasSellerActivity(false);
            } finally {
                setLoading(false);
            }
        };

        checkSellerActivity();
    }, [user]);

    return { isSeller, hasSellerActivity, loading };
};
