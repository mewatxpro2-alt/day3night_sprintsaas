import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStats {
    totalUsers: number;
    totalKits: number;
    pendingSubmissions: number;
    publishedKits: number;
    // Marketplace stats
    totalOrders: number;
    totalRevenue: number;
    totalCommission: number;
    pendingPayouts: number;
}

export const useAdminStats = () => {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        totalKits: 0,
        pendingSubmissions: 0,
        publishedKits: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingPayouts: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                setError(null);



                // Run queries independently so one failure doesn't break all
                const fetchCount = async (table: string, query: any) => {
                    try {
                        const { count, error } = await query;
                        if (error) {
                            console.warn(`Failed to fetch count for ${table}:`, error);
                            return 0;
                        }
                        return count || 0;
                    } catch (e) {
                        console.warn(`Exception fetching count for ${table}:`, e);
                        return 0;
                    }
                };

                // Fetch marketplace revenue data
                const fetchMarketplaceStats = async () => {
                    try {
                        const { data: orders, error: ordersError } = await supabase
                            .from('orders')
                            .select('price_amount, commission_amount, status');

                        // Debug: log what we got
                        console.log('[Admin Stats] Orders query result:', {
                            count: orders?.length,
                            error: ordersError,
                            sample: orders?.slice(0, 2)
                        });

                        // Filter to valid statuses client-side (in case RLS is restrictive)
                        const paidOrders = orders?.filter(o =>
                            ['paid', 'delivered', 'completed'].includes(o.status)
                        ) || [];

                        const { count: pendingPayoutsCount } = await supabase
                            .from('seller_payouts')
                            .select('id', { count: 'exact', head: true })
                            .eq('status', 'scheduled');

                        const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.price_amount || 0), 0);
                        const totalCommission = paidOrders.reduce((acc, o) => acc + Number(o.commission_amount || 0), 0);

                        return {
                            totalOrders: paidOrders.length,
                            totalRevenue,
                            totalCommission,
                            pendingPayouts: pendingPayoutsCount || 0,
                        };
                    } catch (e) {
                        console.warn('Failed to fetch marketplace stats:', e);
                        return { totalOrders: 0, totalRevenue: 0, totalCommission: 0, pendingPayouts: 0 };
                    }
                };

                const [totalUsers, totalKits, pendingSubmissions, publishedKits, marketplaceStats] = await Promise.all([
                    fetchCount('profiles', supabase.from('profiles').select('id', { count: 'exact', head: true })),
                    fetchCount('listings', supabase.from('listings').select('id', { count: 'exact', head: true })),
                    fetchCount('submissions', supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
                    fetchCount('listings', supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_live', true)),
                    fetchMarketplaceStats(),
                ]);



                setStats({
                    totalUsers,
                    totalKits,
                    pendingSubmissions,
                    publishedKits,
                    ...marketplaceStats,
                });
            } catch (err) {
                console.error('Critical error in useAdminStats:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch stats');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, isLoading, error };
};
