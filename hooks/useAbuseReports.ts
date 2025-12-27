import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { AbuseReport, ReportType, ReportStatus } from '../types/marketplace';

// =====================================================
// ABUSE REPORTS HOOKS
// =====================================================

// =====================================================
// Submit Abuse Report (User-facing)
// =====================================================

interface ReportContentParams {
    targetType: 'user' | 'listing' | 'review' | 'message';
    targetId: string;
    reportType: ReportType;
    description: string;
    evidenceUrls?: string[];
}

export const useReportContent = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const reportContent = async (params: ReportContentParams): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: insertError } = await supabase
                .from('abuse_reports')
                .insert({
                    reporter_id: user?.id || null,
                    target_type: params.targetType,
                    target_id: params.targetId,
                    report_type: params.reportType,
                    description: params.description,
                    evidence_urls: params.evidenceUrls || [],
                    status: 'pending'
                });

            if (insertError) throw insertError;

            setSuccess(true);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit report');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { reportContent, isLoading, error, success };
};

// =====================================================
// Get Abuse Reports (Admin-facing)
// =====================================================

interface UseAbuseReportsOptions {
    status?: ReportStatus;
    targetType?: 'user' | 'listing' | 'review' | 'message';
}

interface UseAbuseReportsResult {
    reports: AbuseReport[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
    counts: {
        pending: number;
        reviewing: number;
        resolved: number;
        total: number;
    };
}

export const useAbuseReports = (options?: UseAbuseReportsOptions): UseAbuseReportsResult => {
    const [reports, setReports] = useState<AbuseReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState({ pending: 0, reviewing: 0, resolved: 0, total: 0 });

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('abuse_reports')
                .select(`
                    *,
                    reporter:profiles!abuse_reports_reporter_id_fkey(id, full_name, email),
                    reviewer:profiles!abuse_reports_reviewed_by_fkey(id, full_name)
                `)
                .order('created_at', { ascending: false });

            if (options?.status) {
                query = query.eq('status', options.status);
            }
            if (options?.targetType) {
                query = query.eq('target_type', options.targetType);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const items = data || [];
            setReports(items);

            // Calculate counts
            setCounts({
                pending: items.filter(r => r.status === 'pending').length,
                reviewing: items.filter(r => r.status === 'reviewing').length,
                resolved: items.filter(r =>
                    r.status === 'resolved_action_taken' ||
                    r.status === 'resolved_no_action' ||
                    r.status === 'dismissed'
                ).length,
                total: items.length
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch abuse reports');
        } finally {
            setIsLoading(false);
        }
    }, [options?.status, options?.targetType]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return { reports, isLoading, error, refetch: fetchReports, counts };
};

// =====================================================
// Get Single Abuse Report (with target details)
// =====================================================

interface AbuseReportWithTarget extends AbuseReport {
    targetDetails?: {
        title?: string;
        name?: string;
        content?: string;
    };
}

export const useAbuseReport = (reportId: string) => {
    const [report, setReport] = useState<AbuseReportWithTarget | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (!reportId) return;

            setIsLoading(true);
            try {
                // Fetch the report
                const { data: reportData, error: reportError } = await supabase
                    .from('abuse_reports')
                    .select(`
                        *,
                        reporter:profiles!abuse_reports_reporter_id_fkey(id, full_name, email),
                        reviewer:profiles!abuse_reports_reviewed_by_fkey(id, full_name)
                    `)
                    .eq('id', reportId)
                    .single();

                if (reportError) throw reportError;

                // Fetch target details based on type
                let targetDetails = {};
                if (reportData.target_type === 'listing') {
                    const { data: listing } = await supabase
                        .from('listings')
                        .select('title, description, image_url')
                        .eq('id', reportData.target_id)
                        .single();
                    targetDetails = { title: listing?.title, content: listing?.description };
                } else if (reportData.target_type === 'user') {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, email')
                        .eq('id', reportData.target_id)
                        .single();
                    targetDetails = { name: profile?.full_name || profile?.email };
                } else if (reportData.target_type === 'message') {
                    const { data: message } = await supabase
                        .from('messages')
                        .select('content')
                        .eq('id', reportData.target_id)
                        .single();
                    targetDetails = { content: message?.content };
                }

                setReport({ ...reportData, targetDetails });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch report');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    return { report, isLoading, error };
};

// =====================================================
// Resolve Abuse Report
// =====================================================

interface ResolveReportParams {
    reportId: string;
    resolution: 'resolved_action_taken' | 'resolved_no_action' | 'dismissed';
    notes: string;
    actionTaken?: string;
}

export const useResolveReport = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resolveReport = async (params: ResolveReportParams): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('abuse_reports')
                .update({
                    status: params.resolution,
                    resolution_notes: params.notes,
                    action_taken: params.actionTaken,
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', params.reportId);

            if (updateError) throw updateError;

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resolve report');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { resolveReport, isLoading, error };
};

// =====================================================
// Start Review (Change status to 'reviewing')
// =====================================================

export const useStartReview = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startReview = async (reportId: string): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('abuse_reports')
                .update({
                    status: 'reviewing',
                    reviewed_by: user.id
                })
                .eq('id', reportId)
                .eq('status', 'pending'); // Only update if pending

            if (updateError) throw updateError;

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start review');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { startReview, isLoading, error };
};

// =====================================================
// My Reports (User's own submitted reports)
// =====================================================

export const useMyReports = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<AbuseReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyReports = async () => {
            if (!user) {
                setReports([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('abuse_reports')
                    .select('*')
                    .eq('reporter_id', user.id)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                setReports(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch your reports');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyReports();
    }, [user]);

    return { reports, isLoading, error };
};
