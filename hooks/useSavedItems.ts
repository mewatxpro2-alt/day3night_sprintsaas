import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Listing } from '../types';

interface SavedItem {
    id: string;
    user_id: string;
    listing_id: string;
    created_at: string;
    listing?: Listing;
}

interface UseSavedItemsResult {
    savedItems: SavedItem[];
    savedListingIds: Set<string>;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useSavedItems = (): UseSavedItemsResult => {
    const { user } = useAuth(); // Changed from useUser()
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSavedItems = useCallback(async () => {
        if (!user) {
            setSavedItems([]);
            setSavedListingIds(new Set());
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('saved_items')
                .select(`
          *,
          listing:listings(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            const items = (data as SavedItem[]) || [];
            setSavedItems(items);
            setSavedListingIds(new Set(items.map(item => item.listing_id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch saved items');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSavedItems();
    }, [fetchSavedItems]);

    return { savedItems, savedListingIds, isLoading, error, refetch: fetchSavedItems };
};

interface UseToggleSaveResult {
    toggleSave: (listingId: string) => Promise<boolean>;
    isLoading: boolean;
}

export const useToggleSave = (): UseToggleSaveResult => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const toggleSave = async (listingId: string): Promise<boolean> => {
        if (!user) {
            return false;
        }

        setIsLoading(true);

        try {
            // Check if already saved
            const { data: existing } = await supabase
                .from('saved_items')
                .select('id')
                .eq('user_id', user.id)
                .eq('listing_id', listingId)
                .single();

            if (existing) {
                // Unsave
                const existingItem = existing as { id: string };
                await supabase
                    .from('saved_items')
                    .delete()
                    .eq('id', existingItem.id);
                return false;
            } else {
                // Save
                await supabase
                    .from('saved_items')
                    .insert({
                        user_id: user.id,
                        listing_id: listingId,
                    });
                return true;
            }
        } catch (err) {
            console.error('Error toggling save:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { toggleSave, isLoading };
};

export const useIsListingSaved = (listingId: string): boolean => {
    const { savedListingIds } = useSavedItems();
    return savedListingIds.has(listingId);
};
