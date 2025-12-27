import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getFromCache, saveToCache, CACHE_TTL } from '../lib/cache';
import type { Plan } from '../lib/database.types';

interface UsePlansResult {
    plans: Plan[];
    isLoading: boolean;
    error: string | null;
}

const CACHE_KEY = 'plans';

export const usePlans = (): UsePlansResult => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        // Check cache first - plans rarely change
        const { data: cached, isStale } = getFromCache<Plan[]>(CACHE_KEY);

        if (cached && cached.length > 0) {
            setPlans(cached);
            setIsLoading(false);

            // Background refresh only if stale
            if (isStale && !hasFetched.current) {
                hasFetched.current = true;
                fetchPlans(false);
            }
            return;
        }

        fetchPlans(true);

        async function fetchPlans(showLoading: boolean) {
            if (showLoading) setIsLoading(true);
            setError(null);
            hasFetched.current = true;

            try {
                const { data, error: fetchError } = await supabase
                    .from('plans')
                    .select('*')
                    .order('price', { ascending: true });

                if (fetchError) throw fetchError;

                const result = data || [];
                setPlans(result);
                saveToCache(CACHE_KEY, result, { ttl: CACHE_TTL.PLANS });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch plans');
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    return { plans, isLoading, error };
};
