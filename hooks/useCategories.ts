import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getFromCache, saveToCache, CACHE_TTL } from '../lib/cache';

interface Category {
    id: string;
    [key: string]: unknown;
}

interface UseCategoriesResult {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
}

const CACHE_KEY = 'categories';

export const useCategories = (): UseCategoriesResult => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        // Check cache first
        const { data: cached, isStale } = getFromCache<Category[]>(CACHE_KEY);

        if (cached && cached.length > 0) {
            setCategories(cached);
            setIsLoading(false);

            if (isStale && !hasFetched.current) {
                hasFetched.current = true;
                fetchCategories(false);
            }
            return;
        }

        fetchCategories(true);

        async function fetchCategories(showLoading: boolean) {
            if (showLoading) setIsLoading(true);
            setError(null);
            hasFetched.current = true;

            try {
                // Fetch without ordering to avoid column errors
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*');

                if (fetchError) throw fetchError;

                const result = data || [];
                setCategories(result);
                saveToCache(CACHE_KEY, result, { ttl: CACHE_TTL.CATEGORIES });
            } catch (err) {
                console.error('Categories fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch categories');
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    return { categories, isLoading, error };
};
