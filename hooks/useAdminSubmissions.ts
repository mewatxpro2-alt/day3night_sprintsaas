import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Submission {
    id: string;
    user_id: string;

    // Core
    project_name: string;
    tagline?: string;
    short_summary?: string;
    description: string;
    category: string;

    // URLs
    live_url: string;

    // Technical
    tech_stack: string;
    setup_time?: string;
    architecture_notes?: string;
    features?: string;
    // Pricing
    price: number;

    // Content Arrays
    deliverables?: string[];
    perfect_for?: string[];
    not_for?: string[];
    what_buyer_gets?: string[];

    // Media
    thumbnail_url: string;
    video_url?: string;
    screenshot_urls?: string[];

    // Resources (uploaded files for buyers)
    kit_resources?: Array<{
        id: string;
        file_name: string;
        file_type: string;
        file_url: string;
        file_size_bytes?: number;
        description?: string;
        linked_deliverable?: string;
        is_locked: boolean;
    }>;

    // Declarations
    owner_declaration?: boolean;
    rights_declaration?: boolean;

    // Moderation
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;

    // Timestamps
    created_at: string;
    updated_at?: string;
}

interface UseAdminSubmissionsOptions {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
}

export const useAdminSubmissions = (options: UseAdminSubmissionsOptions = {}) => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // DEBUG: Check current user
                const { data: { user } } = await supabase.auth.getUser();
                console.log('[AdminSubmissions] Current user:', user?.id, user?.email);

                // DEBUG: Check user's profile role
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, role, email')
                        .eq('id', user.id)
                        .single();
                    console.log('[AdminSubmissions] User profile:', profile);
                }

                let query = supabase
                    .from('submissions')
                    .select('id, user_id, project_name, tagline, short_summary, live_url, category, description, features, price, tech_stack, setup_time, deliverables, perfect_for, not_for, what_buyer_gets, thumbnail_url, video_url, screenshot_urls, status, rejection_reason, reviewed_by, reviewed_at, created_at, updated_at, kit_resources(id, file_name, file_type, file_url, file_size_bytes, description, linked_deliverable, is_locked)')
                    .order('created_at', { ascending: false });

                if (options.status && options.status !== 'all') {
                    query = query.eq('status', options.status);
                }

                const { data, error: fetchError } = await query;

                console.log('[AdminSubmissions] Fetch result:', { data, fetchError });

                if (fetchError) throw fetchError;

                setSubmissions(data || []);
            } catch (err) {
                console.error('[AdminSubmissions] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [options.status]);

    const refetch = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('submissions')
                .select('id, user_id, project_name, tagline, short_summary, live_url, category, description, features, price, tech_stack, setup_time, deliverables, perfect_for, not_for, what_buyer_gets, thumbnail_url, video_url, screenshot_urls, status, rejection_reason, reviewed_by, reviewed_at, created_at, updated_at, kit_resources(id, file_name, file_type, file_url, file_size_bytes, description, linked_deliverable, is_locked)')
                .order('created_at', { ascending: false });

            if (options.status && options.status !== 'all') {
                query = query.eq('status', options.status);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setSubmissions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refetch');
        } finally {
            setIsLoading(false);
        }
    };

    return { submissions, isLoading, error, refetch };
};
