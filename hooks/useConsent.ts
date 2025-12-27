import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

// =====================================================
// CONSENT HOOKS
// =====================================================

type PolicyType = 'terms_of_service' | 'privacy_policy' | 'seller_agreement' | 'cookie_policy' | 'marketing';

interface PolicyVersion {
    policy_type: PolicyType;
    current_version: string;
    effective_date: string;
}

interface ConsentStatus {
    hasConsent: boolean;
    currentVersion: string | null;
    acceptedVersion: string | null;
    needsUpdate: boolean;
}

// =====================================================
// Check if User Has Current Consent
// =====================================================

export const useCheckConsent = (policyType: PolicyType) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<ConsentStatus>({
        hasConsent: true, // Default to true to prevent flash
        currentVersion: null,
        acceptedVersion: null,
        needsUpdate: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkConsent = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Get current policy version
                const { data: policyVersion } = await supabase
                    .from('policy_versions')
                    .select('current_version')
                    .eq('policy_type', policyType)
                    .single();

                if (!policyVersion) {
                    // No policy defined = no consent required
                    setStatus({
                        hasConsent: true,
                        currentVersion: null,
                        acceptedVersion: null,
                        needsUpdate: false
                    });
                    return;
                }

                // Check if user has accepted this version
                const { data: consent } = await supabase
                    .from('user_consents')
                    .select('policy_version')
                    .eq('user_id', user.id)
                    .eq('policy_type', policyType)
                    .order('accepted_at', { ascending: false })
                    .limit(1)
                    .single();

                const hasCurrentConsent = consent?.policy_version === policyVersion.current_version;

                setStatus({
                    hasConsent: hasCurrentConsent,
                    currentVersion: policyVersion.current_version,
                    acceptedVersion: consent?.policy_version || null,
                    needsUpdate: consent && !hasCurrentConsent
                });
            } catch (err) {
                // If no consent found, user needs to consent
                setStatus(prev => ({
                    ...prev,
                    hasConsent: false
                }));
            } finally {
                setIsLoading(false);
            }
        };

        checkConsent();
    }, [user, policyType]);

    return { ...status, isLoading };
};

// =====================================================
// Record User Consent
// =====================================================

export const useRecordConsent = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recordConsent = async (policyType: PolicyType): Promise<boolean> => {
        if (!user) {
            setError('Not authenticated');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get current policy version
            const { data: policyVersion } = await supabase
                .from('policy_versions')
                .select('current_version')
                .eq('policy_type', policyType)
                .single();

            if (!policyVersion) {
                throw new Error('Policy not found');
            }

            // Record consent
            const { error: insertError } = await supabase
                .from('user_consents')
                .insert({
                    user_id: user.id,
                    policy_type: policyType,
                    policy_version: policyVersion.current_version
                });

            if (insertError && !insertError.message.includes('duplicate')) {
                throw insertError;
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to record consent');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { recordConsent, isLoading, error };
};

// =====================================================
// Get All Policy Versions
// =====================================================

export const usePolicyVersions = () => {
    const [versions, setVersions] = useState<PolicyVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const { data } = await supabase
                    .from('policy_versions')
                    .select('*')
                    .order('policy_type');

                setVersions(data || []);
            } catch {
                setVersions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVersions();
    }, []);

    return { versions, isLoading };
};

// =====================================================
// Require Consent Hook (for gating actions)
// =====================================================

interface RequireConsentResult {
    isAllowed: boolean;
    needsConsent: PolicyType | null;
    isLoading: boolean;
}

export const useRequireConsent = (
    requiredPolicies: PolicyType[] = ['terms_of_service', 'privacy_policy']
): RequireConsentResult => {
    const { user } = useAuth();
    const [result, setResult] = useState<RequireConsentResult>({
        isAllowed: false,
        needsConsent: null,
        isLoading: true
    });

    useEffect(() => {
        const checkAllConsents = async () => {
            if (!user) {
                setResult({
                    isAllowed: false,
                    needsConsent: null,
                    isLoading: false
                });
                return;
            }

            try {
                // Get current policy versions
                const { data: policyVersions } = await supabase
                    .from('policy_versions')
                    .select('policy_type, current_version')
                    .in('policy_type', requiredPolicies);

                if (!policyVersions || policyVersions.length === 0) {
                    // No policies defined
                    setResult({
                        isAllowed: true,
                        needsConsent: null,
                        isLoading: false
                    });
                    return;
                }

                // Get user's consents
                const { data: consents } = await supabase
                    .from('user_consents')
                    .select('policy_type, policy_version')
                    .eq('user_id', user.id)
                    .in('policy_type', requiredPolicies);

                // Check each required policy
                for (const policy of policyVersions) {
                    const userConsent = consents?.find(c => c.policy_type === policy.policy_type);
                    if (!userConsent || userConsent.policy_version !== policy.current_version) {
                        setResult({
                            isAllowed: false,
                            needsConsent: policy.policy_type as PolicyType,
                            isLoading: false
                        });
                        return;
                    }
                }

                // All consents valid
                setResult({
                    isAllowed: true,
                    needsConsent: null,
                    isLoading: false
                });
            } catch {
                setResult({
                    isAllowed: false,
                    needsConsent: 'terms_of_service',
                    isLoading: false
                });
            }
        };

        checkAllConsents();
    }, [user, requiredPolicies.join(',')]);

    return result;
};

// =====================================================
// Seller Agreement Consent
// =====================================================

export const useSellerAgreement = () => {
    const { user } = useAuth();
    const [hasAgreed, setHasAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAgreement = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Use the database function
                const { data } = await supabase
                    .rpc('has_current_consent', {
                        p_user_id: user.id,
                        p_policy_type: 'seller_agreement'
                    });

                setHasAgreed(data === true);
            } catch {
                setHasAgreed(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAgreement();
    }, [user]);

    return { hasAgreed, isLoading };
};
