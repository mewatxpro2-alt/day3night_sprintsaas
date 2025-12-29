import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type SellerStatus = 'not_applied' | 'pending' | 'approved' | 'rejected' | 'rejected_soft' | 'rejected_hard';

export interface SellerApplicationData {
    // Step 1: About You
    applicantType?: 'solo' | 'team' | 'agency';
    applicationIntent?: 'earn' | 'validate' | 'share';

    // Step 2: Project
    productType?: 'saas_mvp' | 'boilerplate' | 'micro_saas';
    productStatus?: 'live' | 'mvp_ready' | 'in_progress';
    techStack?: string;

    // Step 3: Quality
    description?: string;
    hasFullRights?: boolean;
    links?: {
        github?: string;
        demo?: string;
        website?: string;
    };
}

export const useSellerApplication = () => {
    const { user, refreshProfile } = useAuth();
    const [status, setStatus] = useState<SellerStatus>('not_applied');
    const [applicationData, setApplicationData] = useState<SellerApplicationData>({});
    const [rejectionData, setRejectionData] = useState<{ reason?: string, reapplyDate?: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchApplicationStatus();
        } else {
            // If user is null (logged out or not loaded yet), stop loading
            // But if useAuth is loading, we might want to wait. 
            // Usually useAuth initiates user as null. 
            // We should rely on component layer to check authLoading.
            // But we must turn off our own isLoading if we are sure user is missing.
            setIsLoading(false);
        }
    }, [user]);

    const fetchApplicationStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('seller_status, seller_application_data, rejection_reason_public, reapply_after_date')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setStatus((data.seller_status as SellerStatus) || 'not_applied');
                setApplicationData(data.seller_application_data || {});
                setRejectionData({
                    reason: data.rejection_reason_public,
                    reapplyDate: data.reapply_after_date
                });
            }
        } catch (error) {
            console.error('Error fetching seller application:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveDraft = async (data: Partial<SellerApplicationData>) => {
        if (!user) return;

        try {
            const updatedData = { ...applicationData, ...data };
            setApplicationData(updatedData); // Optimistic update

            const { error } = await supabase
                .from('profiles')
                .update({
                    seller_application_data: updatedData
                })
                .eq('id', user.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const submitApplication = async (finalData: SellerApplicationData) => {
        if (!user) return { success: false, error: 'User not logged in' };

        setIsSubmitting(true);
        try {
            // Use the RPC function to bypass RLS issues
            const { error } = await supabase.rpc('submit_seller_application', {
                application_data: finalData
            });

            if (error) throw error;

            await refreshProfile(); // Update global auth state
            setStatus('pending');
            return { success: true };
        } catch (error: any) {
            console.error('Submission error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        status,
        applicationData,
        rejectionData,
        isLoading,
        isSubmitting,
        saveDraft,
        submitApplication
    };
};
