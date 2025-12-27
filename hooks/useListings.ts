import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getFromCache, saveToCache, generateCacheKey, CACHE_TTL } from '../lib/cache';

import { Listing } from '../types';

interface UseListingsOptions {
    categoryId?: string;
    categorySlug?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
}

interface UseListingsResult {
    listings: Listing[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useListings = (options: UseListingsOptions = {}): UseListingsResult => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    // Generate cache key based on options
    const cacheKey = generateCacheKey('listings', options as Record<string, unknown>);

    const fetchListings = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('listings')
                .select(`
                    id, title, description, tagline, short_summary, price, image_url, screenshot_urls, 
                    category_id, tech_stack, likes_count, views_count, is_featured, preview_url, 
                    created_at, updated_at, creator_id, is_live,
                    creator:profiles!listings_creator_id_fkey (
                        id, full_name, avatar_url, is_verified_seller, rating_average
                    )
                `)
                .eq('is_live', true)
                .eq('moderation_status', 'live') // Only show live listings to buyers
                .order('created_at', { ascending: false });

            if (options.featured) {
                query = query.eq('is_featured', true);
            }

            if (options.categoryId) {
                query = query.eq('category_id', options.categoryId);
            }

            if (options.search) {
                query = query.ilike('title', `%${options.search}%`);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            // Map the raw data to the Listing interface
            const result: Listing[] = (data || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                tagline: item.tagline,
                short_summary: item.short_summary,
                price: item.price,
                image: item.image_url,
                screenshot_urls: item.screenshot_urls,
                category_id: item.category_id,
                category: 'SaaS', // Placeholder
                techStack: item.tech_stack || [],
                likes: item.likes_count,
                views: item.views_count,
                isLive: item.is_live,
                featured: item.is_featured,
                previewUrl: item.preview_url,
                created_at: item.created_at,
                updated_at: item.updated_at,
                creator: {
                    id: item.creator?.id || item.creator_id,
                    name: item.creator?.full_name || 'Anonymous',
                    avatar: item.creator?.avatar_url || '',
                    verified: item.creator?.is_verified_seller || false,
                    rating: item.creator?.rating_average || 0
                }
            }));

            setListings(result);

            // Save to cache
            saveToCache(cacheKey, result, { ttl: options.featured ? CACHE_TTL.FEATURED : CACHE_TTL.LISTINGS });
        } catch (err) {
            console.error('Fetch listings error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        } finally {
            setIsLoading(false);
        }
    }, [cacheKey, options.categoryId, options.featured, options.limit, options.search]);

    useEffect(() => {
        // Check cache first for instant load
        const { data: cached, isStale } = getFromCache<Listing[]>(cacheKey);

        if (cached && cached.length > 0) {
            setListings(cached);
            setIsLoading(false);

            // Background refresh if stale (stale-while-revalidate)
            if (isStale && !hasFetched.current) {
                hasFetched.current = true;
                fetchListings(false);
            }
        } else {
            // No cache, fetch fresh
            hasFetched.current = true;
            fetchListings(true);
        }
    }, [cacheKey, fetchListings]);

    return { listings, isLoading, error, refetch: fetchListings };
};

export const useFeaturedListings = (limit = 3): UseListingsResult => {
    return useListings({ featured: true, limit });
};

interface UseListingResult {
    listing: Listing | null;
    isLoading: boolean;
    error: string | null;
}

export const useListing = (id: string | null): UseListingResult => {
    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setListing(null);
            setIsLoading(false);
            return;
        }

        const cacheKey = `listing_${id}`;
        const { data: cached } = getFromCache<Listing>(cacheKey);

        if (cached) {
            setListing(cached);
            setIsLoading(false);
        }

        const fetchListing = async () => {
            if (!cached) setIsLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('listings')
                    .select(`
                        id, title, description, tagline, short_summary, price, image_url, screenshot_urls, 
                        demo_video_url, category_id, tech_stack, likes_count, views_count, is_live, is_featured, 
                        preview_url, created_at, updated_at, creator_id, moderation_status,
                        creator:profiles!listings_creator_id_fkey (
                            id, full_name, avatar_url, is_verified_seller, rating_average
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                // Map the raw data to the Listing interface
                const listingData: Listing = {
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    tagline: data.tagline,
                    short_summary: data.short_summary,
                    price: data.price,
                    image: data.image_url,
                    screenshot_urls: data.screenshot_urls,
                    category_id: data.category_id,
                    category: 'SaaS', // Placeholder
                    techStack: data.tech_stack || [],
                    likes: data.likes_count,
                    views: data.views_count,
                    isLive: data.is_live,
                    featured: data.is_featured,
                    previewUrl: data.preview_url,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    creator: {
                        id: (data as any).creator?.id || data.creator_id,
                        name: (data as any).creator?.full_name || 'Anonymous',
                        avatar: (data as any).creator?.avatar_url || '',
                        verified: (data as any).creator?.is_verified_seller || false,
                        rating: (data as any).creator?.rating_average || 0
                    }
                };

                setListing(listingData);
                saveToCache(cacheKey, listingData, { ttl: CACHE_TTL.LISTINGS });

                // Increment view count (fire and forget)
                supabase
                    .from('listings')
                    .update({ views_count: (data.views_count || 0) + 1 })
                    .eq('id', id)
                    .then(() => { });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch listing');
            } finally {
                setIsLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    return { listing, isLoading, error };
};
