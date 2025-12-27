import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminKit {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    category_id: string;
    tech_stack: string[];
    is_live: boolean;
    is_featured: boolean;
    moderation_status: string; // live, unpublished, rejected, etc.
    deleted_at: string | null;
    preview_url: string;
    likes_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
}

export const useAdminKits = () => {
    const [kits, setKits] = useState<AdminKit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKits = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('listings')
                .select('id, title, description, price, image_url, category_id, tech_stack, is_live, is_featured, preview_url, likes_count, views_count, created_at, updated_at, moderation_status')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setKits(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch kits');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKits();
    }, []);

    const unpublishKit = async (kitId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({
                    is_live: false,
                    moderation_status: 'unpublished', // Set status for visibility
                    updated_at: new Date().toISOString(),
                })
                .eq('id', kitId);

            if (error) throw error;

            await fetchKits();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to unpublish' };
        }
    };

    const publishKit = async (kitId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({
                    is_live: true,
                    moderation_status: 'live', // Set status for visibility
                    updated_at: new Date().toISOString(),
                })
                .eq('id', kitId);

            if (error) throw error;

            await fetchKits();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to publish' };
        }
    };

    const updateKit = async (kitId: string, updates: Partial<AdminKit>) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update(updates)
                .eq('id', kitId);

            if (error) throw error;

            await fetchKits();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to update' };
        }
    };

    const toggleFeatured = async (kitId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ is_featured: !currentStatus })
                .eq('id', kitId);

            if (error) throw error;

            await fetchKits();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle featured' };
        }
    };

    return { kits, isLoading, error, unpublishKit, publishKit, updateKit, toggleFeatured, refetch: fetchKits };
};
