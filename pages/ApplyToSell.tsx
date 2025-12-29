import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, Clock, Shield, ArrowRight,
    AlertCircle, ChevronRight, Check, X, Building, XCircle, Home, LifeBuoy
} from 'lucide-react';
import { useSellerApplication, SellerApplicationData } from '../hooks/useSellerApplication';
import { useAuth } from '../hooks/useAuth';
import ErrorBoundary from '../components/ErrorBoundary';

const ApplyToSellContent: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();
    const {
        status,
        applicationData,
        rejectionData,
        isLoading,
        isSubmitting,
        saveDraft,
        submitApplication
    } = useSellerApplication();

    // Form State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<SellerApplicationData>({});

    // Reapply State
    const [isReapplying, setIsReapplying] = useState(false);

    const handleStartReapply = () => {
        setIsReapplying(true);
        setStep(1);
        window.scrollTo(0, 0);
    };

    // Initialize form with saved draft
    useEffect(() => {
        if (applicationData) {
            setFormData(prev => ({ ...prev, ...applicationData }));
        }
    }, [applicationData]);

    // Redirect if already approved - ONLY after both auth and application data are loaded
    useEffect(() => {
        if (!authLoading && !isLoading) {
            if (profile?.is_seller || status === 'approved') {
                navigate('/seller');
            }
        }
    }, [profile, status, navigate, authLoading, isLoading]);

    // Exit Prevention Logic
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (step < 4 && status === 'not_applied') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [step, status]);

    const handleNext = () => {
        setStep(p => p + 1);
        saveDraft(formData);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        const result = await submitApplication(formData);
        if (result.success) {
            window.scrollTo(0, 0);
        } else {
            console.error('Submission failed:', result.error);
            alert(`Submission failed: ${result.error || 'Unknown error'}`);
        }
    };

    const updateField = (field: keyof SellerApplicationData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent: 'links', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // ==================== LOADING STATE ====================
    if (isLoading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-textMuted">Loading application status...</p>
                </div>
            </div>
        );
    }

    // ==================== AUTHENTICATION CHECK ====================
    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-accent-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-textMain mb-3">
                        Authentication Required
                    </h1>
                    <p className="text-textMuted mb-6">
                        Please log in to apply as a seller on our platform.
                    </p>
                    <button
                        onClick={() => navigate('/login', { state: { from: '/apply-to-sell' } })}
                        className="w-full py-3 bg-accent-primary text-white rounded-lg font-bold hover:bg-accent-secondary transition-colors"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    // ==================== REJECTED HARD STATE ====================
    if (status === 'rejected_hard' && !isReapplying) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="text-red-500" size={48} />
                </div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-4">
                    Application Declined
                </h1>
                <p className="text-textSecondary mb-6 leading-relaxed">
                    Thank you for your interest in becoming a seller. After careful review, we're unable to approve your application at this time.
                </p>

                {rejectionData?.reason && (
                    <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl mb-8 text-left w-full">
                        <p className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-2">
                            <Building size={14} /> Reason for Decline
                        </p>
                        <p className="text-textMain text-sm leading-relaxed">{rejectionData.reason}</p>
                    </div>
                )}

                <div className="w-full space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-accent-primary text-white rounded-lg font-bold hover:bg-accent-secondary transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> Continue as Buyer
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="w-full py-3 border border-border rounded-lg font-medium hover:bg-surfaceHighlight transition-colors flex items-center justify-center gap-2"
                    >
                        <LifeBuoy size={18} /> Contact Support
                    </button>
                </div>

                <p className="mt-8 text-xs text-textMuted">
                    Note: This decision is final and reapplication is not available.
                </p>
            </div>
        );
    }

    // ==================== REJECTED SOFT STATE ====================
    if (status === 'rejected_soft' && !isReapplying) {
        const reapplyDate = rejectionData?.reapplyDate ? new Date(rejectionData.reapplyDate) : new Date();
        const canReapply = new Date() >= reapplyDate;
        const daysLeft = Math.max(0, Math.ceil((reapplyDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

        return (
            <div className="min-h-screen pt-24 pb-20 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="text-amber-500" size={48} />
                </div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-4">
                    Application Needs Improvement
                </h1>
                <p className="text-textSecondary mb-6 leading-relaxed">
                    Your application wasn't approved this time, but you can improve and resubmit.
                </p>

                {rejectionData?.reason && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl mb-6 text-left w-full">
                        <p className="text-xs font-bold text-amber-600 uppercase mb-2 flex items-center gap-2">
                            <Building size={14} /> Feedback from Review Team
                        </p>
                        <p className="text-textMain text-sm leading-relaxed">{rejectionData.reason}</p>
                    </div>
                )}

                {canReapply ? (
                    <div className="w-full space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600 font-medium">
                            ✓ You're now eligible to reapply
                        </div>
                        <button
                            onClick={handleStartReapply}
                            className="w-full py-3 bg-accent-primary text-white rounded-lg font-bold hover:bg-accent-secondary transition-colors"
                        >
                            Improve & Reapply
                        </button>
                        <button
                            onClick={() => navigate('/seller-guidelines')}
                            className="w-full py-3 border border-border rounded-lg font-medium hover:bg-surfaceHighlight transition-colors"
                        >
                            View Seller Guidelines
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="p-4 bg-surface border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-textMuted">Reapplication available in:</span>
                                <span className="text-2xl font-bold text-textMain">{daysLeft}</span>
                            </div>
                            <p className="text-xs text-textMuted">
                                {daysLeft === 1 ? 'day' : 'days'} remaining
                            </p>
                        </div>
                        <button
                            disabled
                            className="w-full py-3 bg-surfaceHighlight text-textMuted rounded-lg font-bold cursor-not-allowed border border-border"
                        >
                            Reapply (Locked)
                        </button>
                        <button
                            onClick={() => navigate('/seller-guidelines')}
                            className="w-full py-3 border border-border rounded-lg font-medium hover:bg-surfaceHighlight transition-colors"
                        >
                            View Seller Guidelines
                        </button>
                    </div>
                )}

                <button
                    onClick={() => navigate('/')}
                    className="mt-6 text-accent-primary hover:text-accent-secondary font-medium"
                >
                    ← Back to Home
                </button>
            </div>
        );
    }

    // ==================== PENDING REVIEW STATE ====================
    if (status === 'pending') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={48} className="text-amber-500" />
                </div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-4">
                    Application Under Review
                </h1>
                <p className="text-textMuted text-lg mb-8 max-w-md mx-auto">
                    Thanks for applying! Our team is reviewing your project details. This usually takes <strong>3–4 hours</strong>.
                </p>

                <div className="bg-surface border border-border rounded-2xl p-6 text-left max-w-lg mx-auto">
                    <h3 className="text-sm font-bold text-textMain uppercase mb-4">What happens next?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-textMuted">We verify your project exists and is functional</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-textMuted">We assess code quality and ownership rights</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Clock size={18} className="text-textMuted mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-textMuted">You'll receive an email with our decision</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-8 text-accent-primary hover:text-accent-secondary font-medium"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // ==================== APPLICATION FORM (not_applied or reapplying) ====================
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* MOTIVATION SECTION (Only visible on Step 1) */}
            {step === 1 && (
                <div className="bg-surfaceHighlight border-b border-border py-16 px-4 mb-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-textMain mb-4">
                            Turn Your Project Into a Revenue-Generating Asset
                        </h1>
                        <p className="text-xl text-textMuted mb-8">
                            Reach founders who are actively buying SaaS MVPs. No marketing, no cold outreach.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-textMain">
                            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border shadow-sm">
                                <Shield size={16} className="text-green-500" />
                                <span>Curated Marketplace</span>
                            </div>
                            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border shadow-sm">
                                <CheckCircle size={16} className="text-blue-500" />
                                <span>Fair Revenue Split</span>
                            </div>
                            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border shadow-sm">
                                <Clock size={16} className="text-purple-500" />
                                <span>Avg. Review: 3–4 Hours</span>
                            </div>
                        </div>

                        <p className="mt-6 text-xs text-textMuted bg-blue-500/5 inline-block px-4 py-2 rounded-lg border border-blue-500/10">
                            ℹ️ This isn't a test. We just want to understand your project so we can position it better.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto px-4">
                {/* PROGRESS BAR */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-xs font-bold text-textMuted uppercase mb-2">
                        <span>Step {step} of 3</span>
                        <span>{Math.round((step / 3) * 100)}% Complete</span>
                    </div>
                    <div className="h-2 bg-surfaceHighlight rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* STEP 1: ABOUT YOU */}
                {step === 1 && (
                    <div className="bg-surface border border-border rounded-2xl p-8 animate-slide-up">
                        <h2 className="text-2xl font-display font-bold text-textMain mb-6">About You</h2>

                        {/* Name (Read-only) */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-2">Full Name</label>
                            <input
                                disabled
                                value={profile?.full_name || ''}
                                className="w-full bg-surfaceHighlight/50 border border-border rounded-xl px-4 py-3 text-textMain opacity-70 cursor-not-allowed"
                            />
                        </div>

                        {/* Applicant Type */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-3">You are:</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { id: 'solo', label: 'Solo Builder' },
                                    { id: 'team', label: 'Team' },
                                    { id: 'agency', label: 'Agency' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => updateField('applicantType', type.id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${formData.applicantType === type.id
                                            ? 'bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary'
                                            : 'bg-surfaceHighlight border-border hover:border-accent-primary/50'
                                            }`}
                                    >
                                        <div className="font-medium text-textMain">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intent */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-3">Why are you submitting?</label>
                            <div className="space-y-3">
                                {[
                                    { id: 'earn', label: 'Earn from existing projects', desc: 'Monetize side-projects I already built' },
                                    { id: 'validate', label: 'Validate an idea', desc: 'See if there is demand for my code' },
                                    { id: 'share', label: 'Share production-ready SaaS', desc: 'Selling a serious business asset' }
                                ].map((intent) => (
                                    <button
                                        key={intent.id}
                                        onClick={() => updateField('applicationIntent', intent.id)}
                                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${formData.applicationIntent === intent.id
                                            ? 'bg-accent-primary/5 border-accent-primary ring-1 ring-accent-primary'
                                            : 'bg-surfaceHighlight border-border hover:border-accent-primary/50'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-textMain">{intent.label}</div>
                                            <div className="text-sm text-textMuted">{intent.desc}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.applicationIntent === intent.id
                                            ? 'border-accent-primary bg-accent-primary text-white'
                                            : 'border-border group-hover:border-accent-primary'
                                            }`}>
                                            {formData.applicationIntent === intent.id && <Check size={12} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-textMuted">
                                This helps us match you with the right buyers.
                            </p>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!formData.applicantType || !formData.applicationIntent}
                            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-textInverse font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue to Project Details <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* STEP 2: ABOUT PROJECT */}
                {step === 2 && (
                    <div className="bg-surface border border-border rounded-2xl p-8 animate-slide-up">
                        <button onClick={() => setStep(1)} className="text-xs text-textMuted hover:text-textMain mb-4 flex items-center gap-1">
                            ← Back
                        </button>
                        <h2 className="text-2xl font-display font-bold text-textMain mb-6">About Your Project</h2>

                        {/* Product Type */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-3">Product Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['SaaS MVP', 'Boilerplate', 'Micro-SaaS'].map((type) => {
                                    const id = type.toLowerCase().replace(' ', '_').replace('-', '_');
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => updateField('productType', id)}
                                            className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${formData.productType === id
                                                ? 'bg-accent-primary/5 border-accent-primary text-accent-primary'
                                                : 'bg-surfaceHighlight border-border text-textMuted hover:border-accent-primary/50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-3">Current Status</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { id: 'live', label: 'Built & Live' },
                                    { id: 'mvp_ready', label: 'MVP Ready' },
                                    { id: 'in_progress', label: 'In Progress' }
                                ].map((stat) => (
                                    <button
                                        key={stat.id}
                                        onClick={() => updateField('productStatus', stat.id)}
                                        className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${formData.productStatus === stat.id
                                            ? 'bg-accent-primary/5 border-accent-primary text-accent-primary'
                                            : 'bg-surfaceHighlight border-border text-textMuted hover:border-accent-primary/50'
                                            }`}
                                    >
                                        {stat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-2">Tech Stack</label>
                            <input
                                type="text"
                                placeholder="e.g. Next.js, Supabase, Tailwind, Stripe"
                                value={formData.techStack || ''}
                                onChange={(e) => updateField('techStack', e.target.value)}
                                className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none placeholder:text-textMuted/50"
                            />
                            <p className="mt-2 text-xs text-textMuted">Check all that apply. This helps buyers filter.</p>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!formData.productType || !formData.productStatus || !formData.techStack}
                            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-textInverse font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Next: Quality & Rights <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* STEP 3: QUALITY & OWNERSHIP */}
                {step === 3 && (
                    <div className="bg-surface border border-border rounded-2xl p-8 animate-slide-up">
                        <button onClick={() => setStep(2)} className="text-xs text-textMuted hover:text-textMain mb-4 flex items-center gap-1">
                            ← Back
                        </button>
                        <h2 className="text-2xl font-display font-bold text-textMain mb-6">Quality & Ownership</h2>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-textMuted uppercase mb-2">Short Description</label>
                            <textarea
                                placeholder="What problem does your project solve? (1-2 sentences)"
                                rows={3}
                                value={formData.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none placeholder:text-textMuted/50 resize-none"
                            />
                        </div>

                        {/* Links (Optional) */}
                        <div className="mb-8 space-y-4">
                            <label className="block text-xs font-bold text-textMuted uppercase">
                                Helper Links (Optional but Recommended)
                            </label>

                            <input
                                type="text"
                                placeholder="GitHub Repo URL"
                                value={formData.links?.github || ''}
                                onChange={(e) => updateNestedField('links', 'github', e.target.value)}
                                className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Live Demo URL"
                                    value={formData.links?.demo || ''}
                                    onChange={(e) => updateNestedField('links', 'demo', e.target.value)}
                                    className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Website URL"
                                    value={formData.links?.website || ''}
                                    onChange={(e) => updateNestedField('links', 'website', e.target.value)}
                                    className="w-full bg-surfaceHighlight border border-border rounded-xl px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                />
                            </div>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <CheckCircle size={12} /> Optional links increase approval speed significantly.
                            </p>
                        </div>

                        {/* Rights Confirmation */}
                        <div className="mb-8 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-xl">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasFullRights || false}
                                    onChange={(e) => updateField('hasFullRights', e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-border text-accent-primary focus:ring-accent-primary"
                                />
                                <div className="text-sm">
                                    <span className="font-bold text-textMain">I own 100% of the rights to this project.</span>
                                    <p className="text-textMuted mt-1">I confirm this is my original work and I have the right to sell it.</p>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.description || !formData.hasFullRights || isSubmitting}
                            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-textInverse font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>Submit Application <ChevronRight size={18} /></>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Wrap the entire component in Error Boundary
const ApplyToSell: React.FC = () => {
    return (
        <ErrorBoundary>
            <ApplyToSellContent />
        </ErrorBoundary>
    );
};

export default ApplyToSell;
