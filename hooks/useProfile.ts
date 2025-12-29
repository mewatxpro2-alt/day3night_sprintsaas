import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    primary_intent?: 'buy' | 'sell' | 'explore' | 'unsure';
    experience_level?: 'beginner' | 'intermediate' | 'advanced';
    interests?: string[];
    seller_type?: 'solo' | 'agency' | 'team' | 'indie';
    seller_product_focus?: string;
    seller_readiness?: string;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string; // Assuming we have this or last_sign_in_at
    preferences?: {
        show_buyer_content: boolean;
        show_seller_tools: boolean;
        receive_updates: boolean;
    };
    is_seller: boolean;
    plan_id?: string;
}

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Refresh local state
            await fetchProfile();
            return { success: true };
        } catch (err: any) {
            console.error('Error updating profile:', err);
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    return {
        profile,
        isLoading,
        error,
        updateProfile,
        refreshProfile: fetchProfile
    };
};
