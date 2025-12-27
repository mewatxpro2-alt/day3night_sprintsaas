import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useRecordConsent, usePolicyVersions } from '../hooks/useConsent';

type PolicyType = 'terms_of_service' | 'privacy_policy' | 'seller_agreement' | 'cookie_policy';

interface ConsentModalProps {
    policyType: PolicyType;
    onAccept: () => void;
    onClose?: () => void;
    blocking?: boolean; // If true, cannot close without accepting
}

const POLICY_TITLES: Record<PolicyType, string> = {
    terms_of_service: 'Terms of Service',
    privacy_policy: 'Privacy Policy',
    seller_agreement: 'Seller Agreement',
    cookie_policy: 'Cookie Policy'
};

const POLICY_DESCRIPTIONS: Record<PolicyType, string> = {
    terms_of_service: 'Please review and accept our updated Terms of Service to continue using the platform.',
    privacy_policy: 'We\'ve updated our Privacy Policy. Please review the changes and accept to continue.',
    seller_agreement: 'To sell on our marketplace, you must accept the Seller Agreement.',
    cookie_policy: 'We use cookies to improve your experience. Please accept our Cookie Policy.'
};

const POLICY_LINKS: Record<PolicyType, string> = {
    terms_of_service: '/terms',
    privacy_policy: '/privacy',
    seller_agreement: '/seller-agreement',
    cookie_policy: '/cookie-policy'
};

const ConsentModal: React.FC<ConsentModalProps> = ({
    policyType,
    onAccept,
    onClose,
    blocking = false
}) => {
    const { recordConsent, isLoading, error } = useRecordConsent();
    const { versions } = usePolicyVersions();
    const [accepted, setAccepted] = useState(false);

    const currentVersion = versions.find(v => v.policy_type === policyType);

    const handleAccept = async () => {
        if (!accepted) return;

        const success = await recordConsent(policyType);
        if (success) {
            onAccept();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                                <Shield className="text-accent-primary" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-textMain">
                                    {POLICY_TITLES[policyType]}
                                </h2>
                                {currentVersion && (
                                    <p className="text-xs text-textMuted">
                                        Version {currentVersion.current_version}
                                    </p>
                                )}
                            </div>
                        </div>
                        {!blocking && onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                            >
                                <X size={20} className="text-textMuted" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-textSecondary mb-6">
                        {POLICY_DESCRIPTIONS[policyType]}
                    </p>

                    {/* Policy Preview Box */}
                    <div className="bg-surfaceHighlight border border-border rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                        <p className="text-sm text-textMuted leading-relaxed">
                            By clicking "I Accept", you acknowledge that you have read and agree
                            to be bound by our {POLICY_TITLES[policyType]}. This agreement governs
                            your use of our platform and the services we provide.
                        </p>
                        <a
                            href={POLICY_LINKS[policyType]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-accent-primary hover:underline"
                        >
                            Read the full {POLICY_TITLES[policyType]} →
                        </a>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded border-2 border-border bg-surface peer-checked:bg-accent-primary peer-checked:border-accent-primary transition-colors flex items-center justify-center">
                                {accepted && <CheckCircle size={14} className="text-white" />}
                            </div>
                        </div>
                        <span className="text-sm text-textSecondary group-hover:text-textMain transition-colors">
                            I have read and agree to the {POLICY_TITLES[policyType]}
                        </span>
                    </label>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-surfaceHighlight/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAccept}
                            disabled={!accepted || isLoading}
                            className="flex-1 px-6 py-3 bg-accent-primary text-accentFg-primary rounded-xl font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    I Accept
                                </>
                            )}
                        </button>
                        {!blocking && onClose && (
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-surface border border-border rounded-xl font-medium text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors"
                            >
                                Not Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentModal;
