import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// =====================================================
// SEARCH HOOKS - Full-Text Search with Filters
// =====================================================

interface SearchFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'created_at' | 'featured' | 'price_asc' | 'price_desc' | 'rating';
}

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    is_featured: boolean;
    rating_average: number;
    rating_count: number;
    created_at: string;
    creator_id: string;
    category_id: string;
}

interface UseSearchListingsResult {
    results: SearchResult[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refetch: () => void;
    totalEstimate: number;
}

// =====================================================
// Full-Text Search with Infinite Scroll
// =====================================================

export const useSearchListings = (
    query: string,
    filters: SearchFilters = {},
    pageSize: number = 20
): UseSearchListingsResult => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalEstimate, setTotalEstimate] = useState(0);

    // Cursor for pagination (last item's created_at and id)
    const cursorRef = useRef<{ created_at: string; id: string } | null>(null);
    const isInitialMount = useRef(true);

    const fetchResults = useCallback(async (isLoadMore = false) => {
        setIsLoading(true);
        setError(null);

        try {
            let supabaseQuery = supabase
                .from('listings')
                .select(`
                    id,
                    title,
                    description,
                    price,
                    image_url,
                    is_featured,
                    rating_average,
                    rating_count,
                    created_at,
                    creator_id,
                    category_id
                `, { count: 'estimated' })
                .eq('is_live', true);

            // Apply full-text search if query provided
            if (query.trim()) {
                // Use textSearch for full-text
                supabaseQuery = supabaseQuery.textSearch('search_vector', query, {
                    type: 'websearch',
                    config: 'english'
                });
            }

            // Apply filters
            if (filters.categoryId) {
                supabaseQuery = supabaseQuery.eq('category_id', filters.categoryId);
            }
            if (filters.minPrice !== undefined) {
                supabaseQuery = supabaseQuery.gte('price', filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
                supabaseQuery = supabaseQuery.lte('price', filters.maxPrice);
            }

            // Moderation filter
            supabaseQuery = supabaseQuery.in('moderation_status', ['approved', 'featured']);

            // Cursor pagination for load more
            if (isLoadMore && cursorRef.current) {
                supabaseQuery = supabaseQuery.or(
                    `created_at.lt.${cursorRef.current.created_at},` +
                    `and(created_at.eq.${cursorRef.current.created_at},id.lt.${cursorRef.current.id})`
                );
            }

            // Sorting
            switch (filters.sortBy) {
                case 'featured':
                    supabaseQuery = supabaseQuery
                        .order('is_featured', { ascending: false })
                        .order('created_at', { ascending: false });
                    break;
                case 'price_asc':
                    supabaseQuery = supabaseQuery.order('price', { ascending: true });
                    break;
                case 'price_desc':
                    supabaseQuery = supabaseQuery.order('price', { ascending: false });
                    break;
                case 'rating':
                    supabaseQuery = supabaseQuery
                        .order('rating_average', { ascending: false, nullsFirst: false })
                        .order('rating_count', { ascending: false });
                    break;
                default:
                    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
            }

            supabaseQuery = supabaseQuery
                .order('id', { ascending: false })
                .limit(pageSize);

            const { data, error: fetchError, count } = await supabaseQuery;

            if (fetchError) throw fetchError;

            const items = data || [];

            if (isLoadMore) {
                setResults(prev => [...prev, ...items]);
            } else {
                setResults(items);
                if (count !== null) {
                    setTotalEstimate(count);
                }
            }

            // Update cursor
            if (items.length > 0) {
                const lastItem = items[items.length - 1];
                cursorRef.current = {
                    created_at: lastItem.created_at,
                    id: lastItem.id
                };
                setHasMore(items.length === pageSize);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    }, [query, filters.categoryId, filters.minPrice, filters.maxPrice, filters.sortBy, pageSize]);

    // Reset and fetch on query/filter change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        cursorRef.current = null;
        setResults([]);
        setHasMore(true);
        fetchResults(false);
    }, [query, filters.categoryId, filters.minPrice, filters.maxPrice, filters.sortBy]);

    // Initial fetch
    useEffect(() => {
        fetchResults(false);
    }, []);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            fetchResults(true);
        }
    }, [isLoading, hasMore, fetchResults]);

    const refetch = useCallback(() => {
        cursorRef.current = null;
        setResults([]);
        setHasMore(true);
        fetchResults(false);
    }, [fetchResults]);

    return { results, isLoading, error, hasMore, loadMore, refetch, totalEstimate };
};

// =====================================================
// Search Suggestions (Autocomplete)
// =====================================================

interface Suggestion {
    id: string;
    title: string;
    category?: string;
    image_url?: string;
}

export const useSearchSuggestions = (partialQuery: string) => {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Don't search for very short queries
        if (partialQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        // Debounce the search
        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);

            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(`
                        id,
                        title,
                        image_url,
                        category:categories!listings_category_id_fkey(title)
                    `)
                    .eq('is_live', true)
                    .ilike('title', `%${partialQuery}%`)
                    .limit(5);

                if (error) throw error;

                setSuggestions(
                    (data || []).map(item => ({
                        id: item.id,
                        title: item.title,
                        category: item.category?.title,
                        image_url: item.image_url
                    }))
                );
            } catch {
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [partialQuery]);

    return { suggestions, isLoading };
};

// =====================================================
// Popular Searches / Trending
// =====================================================

export const usePopularSearches = () => {
    const [popular, setPopular] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                // In a real implementation, this would query analytics_events
                // For now, return static popular terms based on categories
                const { data } = await supabase
                    .from('categories')
                    .select('title')
                    .limit(6);

                setPopular((data || []).map(c => c.title));
            } catch {
                setPopular(['SaaS', 'E-commerce', 'Dashboard', 'Landing Page']);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPopular();
    }, []);

    return { popular, isLoading };
};
