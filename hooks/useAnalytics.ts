import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// =====================================================
// ANALYTICS HOOKS
// =====================================================

type EventType =
    | 'page_view'
    | 'listing_view'
    | 'listing_click'
    | 'search'
    | 'filter_applied'
    | 'add_to_cart'
    | 'purchase_started'
    | 'purchase_completed'
    | 'signup_started'
    | 'signup_completed'
    | 'login'
    | 'logout'
    | 'error';

interface TrackEventParams {
    type: EventType;
    listingId?: string;
    metadata?: Record<string, unknown>;
}

// =====================================================
// Generate/Get Session ID
// =====================================================

const getSessionId = (): string => {
    const key = 'analytics_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
};

// =====================================================
// Track Event Hook
// =====================================================

export const useTrackEvent = () => {
    const { user } = useAuth();
    const sessionId = useRef(getSessionId());

    const trackEvent = useCallback(async (params: TrackEventParams) => {
        try {
            // Use the database function for logging
            await supabase.rpc('log_analytics_event', {
                p_event_type: params.type,
                p_user_id: user?.id || null,
                p_session_id: sessionId.current,
                p_listing_id: params.listingId || null,
                p_metadata: params.metadata || {}
            });
        } catch (err) {
            // Silently fail - analytics should never break the app
            console.debug('Analytics event failed:', err);
        }
    }, [user?.id]);

    return { trackEvent };
};

// =====================================================
// Page View Tracking (Auto-track on mount)
// =====================================================

export const usePageView = (pageName: string, metadata?: Record<string, unknown>) => {
    const { trackEvent } = useTrackEvent();
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            hasTracked.current = true;
            trackEvent({
                type: 'page_view',
                metadata: {
                    page: pageName,
                    url: window.location.pathname,
                    referrer: document.referrer,
                    ...metadata
                }
            });
        }
    }, [pageName, trackEvent]);
};

// =====================================================
// Listing View Tracking
// =====================================================

export const useListingView = (listingId: string, listingTitle?: string) => {
    const { trackEvent } = useTrackEvent();
    const hasTracked = useRef(false);

    useEffect(() => {
        if (listingId && !hasTracked.current) {
            hasTracked.current = true;
            trackEvent({
                type: 'listing_view',
                listingId,
                metadata: {
                    title: listingTitle
                }
            });
        }
    }, [listingId, listingTitle, trackEvent]);
};

// =====================================================
// Search Tracking
// =====================================================

export const useTrackSearch = () => {
    const { trackEvent } = useTrackEvent();
    const lastQuery = useRef<string>('');

    const trackSearch = useCallback((query: string, resultsCount: number, filters?: Record<string, unknown>) => {
        // Debounce: don't track same query twice
        if (query === lastQuery.current) return;
        lastQuery.current = query;

        trackEvent({
            type: 'search',
            metadata: {
                query,
                results_count: resultsCount,
                ...filters
            }
        });
    }, [trackEvent]);

    return { trackSearch };
};

// =====================================================
// ADMIN ANALYTICS HOOKS
// =====================================================

interface DashboardStats {
    totalUsers: number;
    totalSellers: number;
    totalListings: number;
    totalOrders: number;
    totalRevenue: number;
    completedOrders: number;
    openDisputes: number;
}

interface TimeSeriesData {
    date: string;
    count: number;
    revenue?: number;
}

export const useAdminAnalytics = () => {
    const fetchDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
        try {
            // Try to get from materialized view first
            const { data: mvData, error: mvError } = await supabase
                .from('mv_platform_stats')
                .select('*')
                .single();

            if (!mvError && mvData) {
                return {
                    totalUsers: mvData.total_users,
                    totalSellers: mvData.total_sellers,
                    totalListings: mvData.total_listings,
                    totalOrders: mvData.total_orders,
                    totalRevenue: mvData.total_revenue,
                    completedOrders: mvData.completed_orders,
                    openDisputes: mvData.open_disputes
                };
            }

            // Fallback to direct queries
            const [users, sellers, listings, orders, revenue, disputes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_seller', true),
                supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_live', true),
                supabase.from('orders').select('id', { count: 'exact', head: true }),
                supabase.from('orders').select('price_amount').eq('status', 'completed'),
                supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open')
            ]);

            const totalRevenue = (revenue.data || []).reduce((sum, o) => sum + (o.price_amount || 0), 0);

            return {
                totalUsers: users.count || 0,
                totalSellers: sellers.count || 0,
                totalListings: listings.count || 0,
                totalOrders: orders.count || 0,
                totalRevenue,
                completedOrders: revenue.data?.length || 0,
                openDisputes: disputes.count || 0
            };
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            return null;
        }
    }, []);

    const fetchOrdersTimeSeries = useCallback(async (days: number = 30): Promise<TimeSeriesData[]> => {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data } = await supabase
                .from('orders')
                .select('created_at, total_amount')
                .gte('created_at', startDate.toISOString())
                .order('created_at');

            if (!data) return [];

            // Group by date
            const grouped: Record<string, { count: number; revenue: number }> = {};

            data.forEach(order => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                if (!grouped[date]) {
                    grouped[date] = { count: 0, revenue: 0 };
                }
                grouped[date].count++;
                grouped[date].revenue += order.total_amount || 0;
            });

            return Object.entries(grouped).map(([date, stats]) => ({
                date,
                count: stats.count,
                revenue: stats.revenue
            }));
        } catch {
            return [];
        }
    }, []);

    const fetchTopListings = useCallback(async (limit: number = 10) => {
        try {
            // Get listings with most orders
            const { data } = await supabase
                .from('listings')
                .select(`
                    id,
                    title,
                    price,
                    rating_average,
                    rating_count,
                    total_sales
                `)
                .eq('is_live', true)
                .order('total_sales', { ascending: false })
                .limit(limit);

            return data || [];
        } catch {
            return [];
        }
    }, []);

    const fetchEventCounts = useCallback(async (eventType: EventType, days: number = 7) => {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { count } = await supabase
                .from('analytics_events')
                .select('id', { count: 'exact', head: true })
                .eq('event_type', eventType)
                .gte('created_at', startDate.toISOString());

            return count || 0;
        } catch {
            return 0;
        }
    }, []);

    return {
        fetchDashboardStats,
        fetchOrdersTimeSeries,
        fetchTopListings,
        fetchEventCounts
    };
};

// =====================================================
// Error Logging
// =====================================================

export const useLogError = () => {
    const { user } = useAuth();

    const logError = useCallback(async (
        message: string,
        metadata?: Record<string, unknown>,
        severity: 'warning' | 'error' | 'critical' = 'error'
    ) => {
        try {
            await supabase.rpc('log_platform_event', {
                p_log_type: 'error',
                p_severity: severity,
                p_message: message,
                p_metadata: {
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    ...metadata
                },
                p_user_id: user?.id || null
            });
        } catch (err) {
            // Last resort: console
            console.error('Failed to log error:', err);
        }
    }, [user?.id]);

    return { logError };
};
