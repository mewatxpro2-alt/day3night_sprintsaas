import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Submission } from './useAdminSubmissions';
import { useAuth } from './useAuth';

export const useApproveSubmission = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approveSubmission = async (submission: Submission) => {
        setIsLoading(true);
        setError(null);
        console.log('[ApproveSubmission] Starting approval for:', submission.id);

        try {
            // 1. Find or create category
            let categoryId: string | null = null;

            if (submission.category) {
                // Try to find existing category by title
                const { data: existingCategory } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('title', submission.category)
                    .single();

                if (existingCategory) {
                    categoryId = existingCategory.id;
                    console.log('[ApproveSubmission] Found existing category:', categoryId);
                } else {
                    // Create new category if it doesn't exist
                    console.log('[ApproveSubmission] Creating new category:', submission.category);
                    const { data: newCategory, error: categoryError } = await supabase
                        .from('categories')
                        .insert({
                            title: submission.category,
                            slug: submission.category.toLowerCase().replace(/\s+/g, '-'),
                            description: `${submission.category} kits and templates`,
                        })
                        .select('id')
                        .single();

                    if (categoryError) throw categoryError;
                    categoryId = newCategory.id;
                }
            }

            // 2. Create listing from submission - set to 'live' so it's immediately visible
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .insert({
                    // Core Info
                    title: submission.project_name,
                    tagline: submission.tagline || null,
                    short_summary: submission.short_summary || null,
                    description: submission.description,

                    // Pricing
                    price: submission.price || 0,

                    // Category & Creator
                    category_id: categoryId,
                    creator_id: submission.user_id,

                    // Technical
                    tech_stack: submission.tech_stack ? submission.tech_stack.split(',').map(t => t.trim()) : [],
                    setup_time: submission.setup_time || null,
                    architecture_notes: submission.architecture_notes || null,
                    features: submission.features || null,

                    // Media
                    image_url: submission.thumbnail_url,
                    demo_video_url: submission.video_url || null,
                    screenshot_urls: submission.screenshot_urls || null,
                    preview_url: submission.live_url,

                    // Content Arrays
                    deliverables: submission.deliverables || null,
                    perfect_for: submission.perfect_for || null,
                    not_for: submission.not_for || null,
                    what_buyer_gets: submission.what_buyer_gets || null,

                    // Status
                    is_live: true,
                    is_featured: false,
                    moderation_status: 'live', // Live = visible to buyers immediately
                })
                .select('id')
                .single();

            if (listingError) {
                console.error('[ApproveSubmission] Listing create error:', listingError);
                throw listingError;
            }
            console.log('[ApproveSubmission] Created listing:', listing.id);

            // 3. Update submission status (NOTE: not setting reviewed_by to avoid FK issues if admin profile doesn't exist)
            const { error: updateError } = await supabase
                .from('submissions')
                .update({
                    status: 'approved',
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', submission.id);

            if (updateError) {
                console.error('[ApproveSubmission] Submission update error:', updateError);
                throw updateError;
            }
            console.log('[ApproveSubmission] Updated submission status to approved');

            // 4. Lock kit_resources and link to listing
            const { error: resourceError } = await supabase
                .from('kit_resources')
                .update({
                    listing_id: listing.id,
                    is_locked: true
                })
                .eq('submission_id', submission.id);

            if (resourceError) {
                console.warn('[ApproveSubmission] Resource lock warning:', resourceError);
                // Don't fail the approval if resources don't exist
            } else {
                console.log('[ApproveSubmission] Locked kit resources for listing:', listing.id);
            }

            // 5. Update seller's is_seller flag if not already set
            await supabase
                .from('profiles')
                .update({ is_seller: true })
                .eq('id', submission.user_id)
                .eq('is_seller', false);

            return { success: true, listingId: listing.id };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve submission';
            console.error('[ApproveSubmission] Error:', errorMessage, err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { approveSubmission, isLoading, error };
};

export const useRejectSubmission = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rejectSubmission = async (submissionId: string, reason: string = 'Does not meet our quality standards') => {
        setIsLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('submissions')
                .update({
                    status: 'rejected',
                    rejection_reason: reason,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', submissionId);

            if (updateError) {
                console.error('[RejectSubmission] Update error:', updateError);
                throw updateError;
            }
            console.log('[RejectSubmission] Successfully rejected submission:', submissionId);

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject submission';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { rejectSubmission, isLoading, error };
};
