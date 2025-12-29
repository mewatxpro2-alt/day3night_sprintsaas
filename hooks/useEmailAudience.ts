import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { EmailAudienceRecord, EmailAudienceStats } from '../types';

interface UseEmailAudienceOptions {
    source?: string;
    user_type?: string;
    status?: string;
    search?: string;
}

interface UseEmailAudienceResult {
    emails: EmailAudienceRecord[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useEmailAudience = (options: UseEmailAudienceOptions = {}): UseEmailAudienceResult => {
    const [emails, setEmails] = useState<EmailAudienceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('email_audience')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (options.source) {
                query = query.eq('source', options.source);
            }
            if (options.user_type) {
                query = query.eq('user_type', options.user_type);
            }
            if (options.status) {
                query = query.eq('status', options.status);
            }
            if (options.search) {
                query = query.ilike('email', `%${options.search}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setEmails(data || []);
        } catch (err) {
            console.error('Error fetching email audience:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch emails');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, [options.source, options.user_type, options.status, options.search]);

    return { emails, isLoading, error, refetch: fetchEmails };
};

// =====================================================
// EMAIL STATS HOOK
// =====================================================

interface UseEmailStatsResult {
    stats: EmailAudienceStats | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useEmailStats = (): UseEmailStatsResult => {
    const [stats, setStats] = useState<EmailAudienceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('email_audience_stats')
                .select('*')
                .single();

            if (fetchError) throw fetchError;

            setStats(data);
        } catch (err) {
            console.error('Error fetching email stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, isLoading, error, refetch: fetchStats };
};

// =====================================================
// EMAIL MANAGEMENT FUNCTIONS
// =====================================================

export const upsertEmailRecord = async (
    email: string,
    source: EmailAudienceRecord['source'],
    options: {
        user_type?: EmailAudienceRecord['user_type'];
        consent_flag?: boolean;
        linked_user_id?: string;
        metadata?: Record<string, any>;
    } = {}
): Promise<{ success: boolean; error: string | null; id?: string }> => {
    try {
        const { data, error } = await supabase.rpc('upsert_email_record', {
            p_email: email,
            p_source: source,
            p_user_type: options.user_type || 'guest',
            p_consent_flag: options.consent_flag || false,
            p_linked_user_id: options.linked_user_id || null,
            p_metadata: options.metadata || {}
        });

        if (error) throw error;

        return { success: true, error: null, id: data };
    } catch (err) {
        console.error('Error upserting email record:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to save email'
        };
    }
};

export const updateEmailStatus = async (
    emailId: string,
    status: EmailAudienceRecord['status']
): Promise<{ success: boolean; error: string | null }> => {
    try {
        const { error } = await supabase
            .from('email_audience')
            .update({ status })
            .eq('id', emailId);

        if (error) throw error;

        return { success: true, error: null };
    } catch (err) {
        console.error('Error updating email status:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to update status'
        };
    }
};

// =====================================================
// CSV EXPORT
// =====================================================

export const exportEmailsToCSV = async (
    filters: UseEmailAudienceOptions = {}
): Promise<{ success: boolean; error: string | null; csv?: string }> => {
    try {
        let query = supabase
            .from('email_audience')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply same filters
        if (filters.source) query = query.eq('source', filters.source);
        if (filters.user_type) query = query.eq('user_type', filters.user_type);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.search) query = query.ilike('email', `%${filters.search}%`);

        const { data, error } = await query;

        if (error) throw error;

        // Generate CSV
        const headers = ['Email', 'Source', 'User Type', 'Status', 'Consent', 'Created At', 'Last Seen'];
        const rows = (data || []).map(record => [
            record.email,
            record.source,
            record.user_type,
            record.status,
            record.consent_flag ? 'Yes' : 'No',
            new Date(record.created_at).toLocaleDateString(),
            new Date(record.last_seen_at).toLocaleDateString()
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return { success: true, error: null, csv };
    } catch (err) {
        console.error('Error exporting emails:', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to export'
        };
    }
};
