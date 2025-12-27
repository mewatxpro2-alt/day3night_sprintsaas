import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Submission {
    id: string;
    user_id: string;
    project_name: string;
    live_url: string | null;
    category: string | null;
    description: string | null;
    price: number | null;
    tech_stack: string | null;
    thumbnail_url: string | null;
    status: string;
    created_at: string;
}

interface UseSubmissionsResult {
    submissions: Submission[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useSubmissions = (): UseSubmissionsResult => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        if (!user) {
            setSubmissions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('submissions')
                .select('id, user_id, project_name, short_summary, live_url, category, description, price, tech_stack, thumbnail_url, video_url, status, rejection_reason, created_at, updated_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            setSubmissions((data as Submission[]) || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    return { submissions, isLoading, error, refetch: fetchSubmissions };
};

export type { Submission };
