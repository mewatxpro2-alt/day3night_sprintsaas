import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    is_seller: boolean;
    created_at: string;
}

export const useAdminUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            // Debug logging
            console.log('[Admin Users] Query result:', {
                count: data?.length,
                error: fetchError,
                profiles: data
            });

            if (fetchError) throw fetchError;

            setUsers(data || []);
        } catch (err) {
            console.error('[Admin Users] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, isLoading, error, refetch: fetchUsers };
};
