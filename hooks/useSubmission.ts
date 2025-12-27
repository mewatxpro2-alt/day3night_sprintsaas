import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// =====================================================
// TYPES
// =====================================================

interface SubmissionData {
    // Core Info
    projectName: string;
    tagline: string;
    shortSummary: string;
    description: string;
    category: string;

    // URLs
    liveUrl: string;
    repoUrl: string;

    // Technical
    techStack: string; // Comma-separated
    setupTime: string;
    architectureNotes?: string;

    // Pricing
    price: string;

    // Features & Content
    features: string;
    deliverables: string[]; // Array of deliverable features
    perfectFor: string[]; // Array of use cases
    notFor: string[]; // Array of who it's not for
    whatBuyerGets: string[]; // Array of what buyer receives

    // Media
    thumbnailFile?: File;
    videoFile?: File;
    screenshotFiles?: File[];

    // Resource Files (for buyer access)
    resourceFiles?: Array<{
        file: File;
        type: 'zip' | 'pdf' | 'md' | 'figma' | 'video' | 'image' | 'other';
        description: string;
        linkedDeliverable: string;
    }>;

    // Declarations
    ownerDeclaration: boolean;
    rightsDeclaration: boolean;
}

interface UseSubmitKitResult {
    submitKit: (data: SubmissionData) => Promise<{ success: boolean; error: string | null; submissionId?: string }>;
    uploadProgress: number;
    isLoading: boolean;
}

// =====================================================
// FILE UPLOAD HELPER - HANDLES MISSING BUCKET
// =====================================================

const uploadToStorage = async (
    file: File,
    userId: string,
    folder: 'thumbnails' | 'videos' | 'screenshots' | 'resources'
): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

    try {
        const { data, error } = await supabase.storage
            .from('submissions')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            // If bucket doesn't exist, skip upload and continue
            console.warn('Storage upload skipped:', error.message);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('submissions')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (err) {
        console.warn('Storage upload error:', err);
        return null;
    }
};

// =====================================================
// MAIN HOOK
// =====================================================

export const useSubmitKit = (): UseSubmitKitResult => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const submitKit = async (data: SubmissionData) => {
        if (!user) {
            return { success: false, error: 'You must be logged in to submit' };
        }

        // Validate declarations
        if (!data.ownerDeclaration || !data.rightsDeclaration) {
            return { success: false, error: 'You must accept both declarations to submit' };
        }

        // Validate required fields
        if (!data.projectName.trim()) {
            return { success: false, error: 'Kit name is required' };
        }
        if (!data.shortSummary.trim()) {
            return { success: false, error: 'Short summary is required' };
        }
        if (!data.description.trim()) {
            return { success: false, error: 'Description is required' };
        }
        if (!data.techStack.trim()) {
            return { success: false, error: 'Tech stack is required' };
        }
        if (!data.price || parseFloat(data.price) <= 0) {
            return { success: false, error: 'Valid price is required' };
        }

        setIsLoading(true);
        setUploadProgress(0);

        try {
            let thumbnailUrl: string | null = null;
            let videoUrl: string | null = null;
            const screenshotUrls: string[] = [];

            // Upload thumbnail if provided (optional - continues if no bucket)
            if (data.thumbnailFile) {
                setUploadProgress(10);
                thumbnailUrl = await uploadToStorage(data.thumbnailFile, user.id, 'thumbnails');
                setUploadProgress(30);
            }

            // Upload video if provided (optional)
            if (data.videoFile) {
                setUploadProgress(40);
                videoUrl = await uploadToStorage(data.videoFile, user.id, 'videos');
                setUploadProgress(60);
            }

            // Upload screenshots if provided (optional)
            if (data.screenshotFiles && data.screenshotFiles.length > 0) {
                setUploadProgress(70);
                for (const file of data.screenshotFiles) {
                    const url = await uploadToStorage(file, user.id, 'screenshots');
                    if (url) screenshotUrls.push(url);
                }
                setUploadProgress(80);
            }

            // Save submission to database
            setUploadProgress(90);
            const { data: submission, error } = await supabase
                .from('submissions')
                .insert({
                    user_id: user.id,

                    // Core Info
                    project_name: data.projectName.trim(),
                    tagline: data.tagline?.trim() || null,
                    short_summary: data.shortSummary.trim(),
                    description: data.description.trim(),
                    category: data.category,

                    // URLs
                    live_url: data.liveUrl.trim() || null,
                    repo_url: data.repoUrl.trim() || null,

                    // Technical
                    tech_stack: data.techStack.trim(),
                    setup_time: data.setupTime,
                    architecture_notes: data.architectureNotes?.trim() || null,

                    // Pricing
                    price: parseFloat(data.price) || 0,

                    // Features & Content
                    features: data.features.trim() || null,
                    deliverables: data.deliverables.length > 0 ? data.deliverables : null,
                    perfect_for: data.perfectFor.length > 0 ? data.perfectFor : null,
                    not_for: data.notFor.length > 0 ? data.notFor : null,
                    what_buyer_gets: data.whatBuyerGets.length > 0 ? data.whatBuyerGets : null,

                    // Media
                    thumbnail_url: thumbnailUrl,
                    video_url: videoUrl,
                    screenshot_urls: screenshotUrls.length > 0 ? screenshotUrls : null,

                    // Declarations
                    owner_declaration: data.ownerDeclaration,
                    rights_declaration: data.rightsDeclaration,
                    declaration_at: new Date().toISOString(),

                    // Status
                    status: 'pending',
                })
                .select('id')
                .single();

            if (error) {
                throw error;
            }

            // Upload resource files and save to kit_resources table
            if (data.resourceFiles && data.resourceFiles.length > 0) {
                setUploadProgress(92);

                for (let i = 0; i < data.resourceFiles.length; i++) {
                    const resource = data.resourceFiles[i];
                    const resourceUrl = await uploadToStorage(resource.file, user.id, 'resources');

                    if (resourceUrl) {
                        // Insert into kit_resources table
                        await supabase
                            .from('kit_resources')
                            .insert({
                                submission_id: submission.id,
                                file_name: resource.file.name,
                                file_type: resource.type,
                                file_url: resourceUrl,
                                file_size_bytes: resource.file.size,
                                description: resource.description || null,
                                linked_deliverable: resource.linkedDeliverable || null,
                                is_locked: false, // Will be locked on approval
                            });
                    }

                    // Update progress
                    setUploadProgress(92 + Math.floor((i + 1) / data.resourceFiles.length * 6));
                }
            }

            setUploadProgress(100);
            return { success: true, error: null, submissionId: submission.id };
        } catch (err) {
            console.error('Submission error:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Failed to submit kit'
            };
        } finally {
            setIsLoading(false);
        }
    };

    return { submitKit, uploadProgress, isLoading };
};

// =====================================================
// GET USER'S SUBMISSIONS
// =====================================================

export interface UserSubmission {
    id: string;
    project_name: string;
    short_summary?: string;
    thumbnail_url?: string;
    video_url?: string;
    category?: string;
    price?: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    created_at: string;
    reviewed_at?: string;
}

export const useMySubmissions = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        if (!user) {
            setSubmissions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setSubmissions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch on mount
    useState(() => {
        fetchSubmissions();
    });

    return { submissions, isLoading, error, refetch: fetchSubmissions };
};
