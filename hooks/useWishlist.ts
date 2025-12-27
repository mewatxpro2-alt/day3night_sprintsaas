import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface WishlistItem {
    id: string;
    listing_id: string;
    added_at: string;
    listing: {
        id: string;
        title: string;
        slug: string;
        price: number;
        image_url?: string;
        rating_average: number;
        seller: { full_name: string };
    };
}

export const useWishlist = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setItems([]);
            setWishlistIds(new Set());
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('wishlists')
                .select(`
                    id,
                    listing_id,
                    added_at,
                    listing:listings(
                        id,
                        title,
                        slug,
                        price,
                        image_url,
                        rating_average,
                        seller:profiles!listings_seller_id_fkey(full_name)
                    )
                `)
                .eq('user_id', user.id)
                .order('added_at', { ascending: false });

            if (!error && data) {
                const processed = data.map(item => {
                    const listing = Array.isArray(item.listing) ? item.listing[0] : item.listing;
                    const seller = listing?.seller;
                    const sellerObj = Array.isArray(seller) ? seller[0] : seller;
                    return {
                        ...item,
                        listing: listing ? {
                            ...listing,
                            seller: sellerObj || { full_name: 'Unknown' }
                        } : null
                    };
                }).filter(item => item.listing) as WishlistItem[];

                setItems(processed);
                setWishlistIds(new Set(processed.map(i => i.listing_id)));
            }
        } catch (err) {
            console.error('[useWishlist] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = useCallback(async (listingId: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('wishlists')
                .insert({ user_id: user.id, listing_id: listingId });

            if (error) throw error;

            setWishlistIds(prev => new Set([...prev, listingId]));
            await fetchWishlist();
            return true;
        } catch (err) {
            console.error('[useWishlist] Add error:', err);
            return false;
        }
    }, [user, fetchWishlist]);

    const removeFromWishlist = useCallback(async (listingId: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('wishlists')
                .delete()
                .eq('user_id', user.id)
                .eq('listing_id', listingId);

            if (error) throw error;

            setWishlistIds(prev => {
                const next = new Set(prev);
                next.delete(listingId);
                return next;
            });
            setItems(prev => prev.filter(i => i.listing_id !== listingId));
            return true;
        } catch (err) {
            console.error('[useWishlist] Remove error:', err);
            return false;
        }
    }, [user]);

    const toggleWishlist = useCallback(async (listingId: string) => {
        if (wishlistIds.has(listingId)) {
            return removeFromWishlist(listingId);
        } else {
            return addToWishlist(listingId);
        }
    }, [wishlistIds, addToWishlist, removeFromWishlist]);

    const isInWishlist = useCallback((listingId: string) => {
        return wishlistIds.has(listingId);
    }, [wishlistIds]);

    return {
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        count: items.length
    };
};
