import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SellerProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    website_url?: string;
    twitter_handle?: string;
    github_handle?: string;
    is_seller: boolean;
    is_verified_seller: boolean;
    seller_level: string;
    rating_average: number;
    rating_count: number;
    total_sales: number;
    completion_rate: number;
    created_at: string;
}

export interface SellerListing {
    id: string;
    title: string;
    slug: string;
    price: number;
    image_url?: string;
    rating_average: number;
    rating_count: number;
    purchase_count: number;
    last_sold_at?: string;
    category?: { name: string };
}

export const useSellerProfile = (sellerId: string | undefined) => {
    const [profile, setProfile] = useState<SellerProfile | null>(null);
    const [listings, setListings] = useState<SellerListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sellerId) return;

        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch seller profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select(`
                        id,
                        full_name,
                        avatar_url,
                        bio,
                        website_url,
                        twitter_handle,
                        github_handle,
                        is_seller,
                        is_verified_seller,
                        seller_level,
                        rating_average,
                        rating_count,
                        total_sales,
                        completion_rate,
                        created_at
                    `)
                    .eq('id', sellerId)
                    .eq('is_seller', true)
                    .single();

                if (profileError) throw new Error('Seller not found');
                setProfile(profileData);

                // Fetch seller's listings
                const { data: listingsData, error: listingsError } = await supabase
                    .from('listings')
                    .select(`
                        id,
                        title,
                        slug,
                        price,
                        image_url,
                        rating_average,
                        rating_count,
                        purchase_count,
                        last_sold_at,
                        category:categories(name)
                    `)
                    .eq('seller_id', sellerId)
                    .eq('moderation_status', 'approved')
                    .order('quality_score', { ascending: false });

                if (!listingsError) {
                    // Handle category array/object
                    const processed = (listingsData || []).map(l => ({
                        ...l,
                        category: Array.isArray(l.category) ? l.category[0] : l.category
                    }));
                    setListings(processed);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [sellerId]);

    return { profile, listings, isLoading, error };
};
