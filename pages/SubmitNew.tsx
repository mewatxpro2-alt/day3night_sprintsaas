import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload, Check, AlertCircle, Globe, Tag, Image as ImageIcon, FileText,
    ChevronRight, ChevronLeft, ShieldCheck, Info, Cpu, Terminal, Video, X,
    Loader2, Link as LinkIcon, Code2, ListChecks, Images, FolderArchive,
    FileDown, Trash2, User, Shield, Sparkles, Plus, Minus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { useSubmitKit } from '../hooks/useSubmission';

// =====================================================
// CONFIGURATION CONSTANTS
// =====================================================

const STEPS = [
    { id: 1, label: 'Product', icon: Globe },
    { id: 2, label: 'Pricing', icon: Tag },
    { id: 3, label: 'Media', icon: ImageIcon },
    { id: 4, label: 'Details', icon: FileText },
    { id: 5, label: 'Seller', icon: User },
    { id: 6, label: 'Trust', icon: Shield },
    { id: 7, label: 'Review', icon: Check },
];

const CATEGORIES = ['SaaS', 'Boilerplate', 'API', 'Tool', 'Template', 'Dashboard', 'Mobile App', 'E-commerce'];
const PRODUCT_STAGES = [
    { value: 'mvp', label: 'MVP', desc: 'Early stage, core features only' },
    { value: 'production', label: 'Production Ready', desc: 'Battle-tested, full features' },
    { value: 'experimental', label: 'Experimental', desc: 'Cutting-edge, may have rough edges' },
];
const CURRENCIES = [
    { value: 'INR', label: '₹ INR', symbol: '₹' },
    { value: 'USD', label: '$ USD', symbol: '$' },
];
const PRICING_TYPES = [
    { value: 'one-time', label: 'One-time Purchase' },
    { value: 'subscription', label: 'Subscription' },
];
const LICENSE_TYPES = [
    { value: 'personal', label: 'Personal', desc: 'Single developer, non-commercial' },
    { value: 'commercial', label: 'Commercial', desc: 'Use in client projects, monetize' },
    { value: 'unlimited', label: 'Unlimited', desc: 'No restrictions, full ownership' },
];
const TECH_STACK_OPTIONS = ['React', 'Next.js', 'Vue', 'Nuxt', 'Supabase', 'Firebase', 'Tailwind CSS', 'Stripe', 'Prisma', 'PostgreSQL', 'MongoDB', 'Node.js', 'Express', 'TypeScript', 'Python', 'Django', 'FastAPI'];
const SETUP_TIME_OPTIONS = [
    { value: '<30 min', label: 'Under 30 minutes' },
    { value: '1-2 hours', label: '1-2 hours' },
    { value: 'same-day', label: 'Same day' },
];
const COMPLEXITY_OPTIONS = [
    { value: 'beginner', label: 'Beginner', desc: 'Copy-paste setup, no coding needed' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Some dev experience helpful' },
    { value: 'advanced', label: 'Advanced', desc: 'Requires technical knowledge' },
];
const PERFECT_FOR_OPTIONS = ['SaaS MVP launches', 'Internal tools', 'Freelance deliverables', 'Learning modern stacks', 'Startup prototypes', 'Agency projects'];
const NOT_FOR_OPTIONS = ['Complete beginners', 'No-code users', 'Users needing finished product', 'Non-technical founders'];
const EXPERIENCE_LEVELS = [
    { value: 'beginner', label: 'Beginner', desc: '< 2 years' },
    { value: 'intermediate', label: 'Intermediate', desc: '2-5 years' },
    { value: 'expert', label: 'Expert', desc: '5+ years' },
];
const SUPPORT_LEVELS = [
    { value: 'none', label: 'No Support', desc: 'Documentation only' },
    { value: 'email', label: 'Email Support', desc: 'Response within 48 hours' },
    { value: 'discord', label: 'Discord Community', desc: 'Community + creator access' },
    { value: 'dedicated', label: 'Dedicated Support', desc: 'Priority 1:1 assistance' },
];

// =====================================================
// FORM STATE INTERFACE
// =====================================================

interface FormData {
    // Step 1: Basic Product Info
    projectName: string;
    tagline: string;
    category: string;
    productStage: string;

    // Step 2: Pricing
    price: string;
    currency: string;
    pricingType: string;
    licenseType: string;

    // Step 3: Media
    thumbnailFile: File | null;
    screenshotFiles: File[];
    demoVideoUrl: string;

    // Step 4: Details
    executiveSummary: string;
    problemItSolves: string;
    features: string[];
    techStack: string[];
    setupTime: string;
    complexityLevel: string;
    perfectFor: string[];
    notFor: string[];

    // Step 5: Seller
    sellerDisplayName: string;
    sellerBio: string;
    sellerExperienceLevel: string;
    sellerPriorProjects: string;
    sellerPortfolioUrl: string;

    // Step 6: Trust
    supportLevel: string;
    hasRefundPolicy: boolean;
    hasMaintenanceCommitment: boolean;

    // Step 7: Declarations
    ownerDeclaration: boolean;
    rightsDeclaration: boolean;

    // Existing fields for compatibility
    liveUrl: string;
    repoUrl: string;
}

// =====================================================
// COMPONENT
// =====================================================

const Submit: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, isAuthenticated } = useAuth();
    const { submitKit, uploadProgress, isLoading: isSubmitting } = useSubmitKit();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // File refs
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const screenshotInputRef = useRef<HTMLInputElement>(null);

    // Previews
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState<FormData>({
        // Step 1
        projectName: '',
        tagline: '',
        category: 'SaaS',
        productStage: 'mvp',
        // Step 2
        price: '',
        currency: 'INR',
        pricingType: 'one-time',
        licenseType: 'personal',
        // Step 3
        thumbnailFile: null,
        screenshotFiles: [],
        demoVideoUrl: '',
        // Step 4
        executiveSummary: '',
        problemItSolves: '',
        features: [''],
        techStack: [],
        setupTime: '1-2 hours',
        complexityLevel: 'intermediate',
        perfectFor: [],
        notFor: [],
        // Step 5
        sellerDisplayName: profile?.full_name || '',
        sellerBio: '',
        sellerExperienceLevel: 'intermediate',
        sellerPriorProjects: '0',
        sellerPortfolioUrl: '',
        // Step 6
        supportLevel: 'email',
        hasRefundPolicy: false,
        hasMaintenanceCommitment: false,
        // Step 7
        ownerDeclaration: false,
        rightsDeclaration: false,
        // Compatibility
        liveUrl: '',
        repoUrl: '',
    });

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Cover image must be under 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, thumbnailFile: file }));
            setThumbnailPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files).slice(0, 5);
            const previews = fileArray.map(f => URL.createObjectURL(f));
            setFormData(prev => ({ ...prev, screenshotFiles: [...prev.screenshotFiles, ...fileArray].slice(0, 5) }));
            setScreenshotPreviews(prev => [...prev, ...previews].slice(0, 5));
        }
    };

    const removeThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnailFile: null }));
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
    };

    const removeScreenshot = (index: number) => {
        URL.revokeObjectURL(screenshotPreviews[index]);
        setFormData(prev => ({
            ...prev,
            screenshotFiles: prev.screenshotFiles.filter((_, i) => i !== index)
        }));
        setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleArrayItem = (field: keyof FormData, item: string) => {
        setFormData(prev => {
            const currentArray = prev[field] as string[];
            const newArray = currentArray.includes(item)
                ? currentArray.filter(i => i !== item)
                : [...currentArray, item];
            return { ...prev, [field]: newArray };
        });
    };

    const addFeature = () => {
        setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const updateFeature = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === index ? value : f)
        }));
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateStep = (step: number): boolean => {
        setError(null);

        switch (step) {
            case 1:
                if (!formData.projectName.trim()) { setError('Product name is required'); return false; }
                if (formData.projectName.length > 60) { setError('Product name must be under 60 characters'); return false; }
                if (!formData.tagline.trim()) { setError('Value proposition is required'); return false; }
                if (formData.tagline.length > 120) { setError('Value proposition must be under 120 characters'); return false; }
                return true;

            case 2:
                const price = parseFloat(formData.price);
                if (isNaN(price) || price <= 0) { setError('Enter a valid price'); return false; }
                return true;

            case 3:
                if (!formData.thumbnailFile) { setError('Cover image is required'); return false; }
                return true;

            case 4:
                if (!formData.executiveSummary.trim()) { setError('Executive summary is required'); return false; }
                if (formData.executiveSummary.length < 100) { setError('Executive summary must be at least 100 characters'); return false; }
                if (formData.techStack.length === 0) { setError('Select at least one technology'); return false; }
                return true;

            case 5:
                if (!formData.sellerDisplayName.trim()) { setError('Display name is required'); return false; }
                return true;

            case 6:
                return true;

            case 7:
                if (!formData.ownerDeclaration || !formData.rightsDeclaration) {
                    setError('You must accept both declarations');
                    return false;
                }
                return true;

            default:
                return true;
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        if (currentStep < 7) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmitForm();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmitForm = async () => {
        setError(null);

        const result = await submitKit({
            projectName: formData.projectName,
            tagline: formData.tagline,
            shortSummary: formData.tagline,
            description: formData.executiveSummary,
            category: formData.category,
            liveUrl: formData.liveUrl,
            repoUrl: formData.repoUrl,
            techStack: formData.techStack,
            setupTime: formData.setupTime,
            architectureNotes: '',
            price: formData.price,
            features: formData.features.filter(f => f.trim()).join('\n• '),
            deliverables: [],
            perfectFor: formData.perfectFor,
            notFor: formData.notFor,
            whatBuyerGets: [],
            thumbnailFile: formData.thumbnailFile || undefined,
            screenshotFiles: formData.screenshotFiles.length > 0 ? formData.screenshotFiles : undefined,
            ownerDeclaration: formData.ownerDeclaration,
            rightsDeclaration: formData.rightsDeclaration,
            // NEW FIELDS
            currency: formData.currency,
            pricingType: formData.pricingType,
            productStage: formData.productStage,
            licenseType: formData.licenseType,
            executiveSummary: formData.executiveSummary,
            problemItSolves: formData.problemItSolves,
            complexityLevel: formData.complexityLevel,
            sellerDisplayName: formData.sellerDisplayName,
            sellerBio: formData.sellerBio,
            sellerExperienceLevel: formData.sellerExperienceLevel,
            sellerPriorProjects: parseInt(formData.sellerPriorProjects) || 0,
            sellerPortfolioUrl: formData.sellerPortfolioUrl,
            supportLevel: formData.supportLevel,
            hasRefundPolicy: formData.hasRefundPolicy,
            hasMaintenanceCommitment: formData.hasMaintenanceCommitment,
            demoVideoUrl: formData.demoVideoUrl,
        });

        if (result.success) {
            setIsSuccess(true);
            window.scrollTo(0, 0);
        } else {
            setError(result.error || 'Failed to submit. Please try again.');
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            screenshotPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // =====================================================
    // RENDER GUARDS
    // =====================================================

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
                <ShieldCheck size={48} className="text-textMuted mb-6" />
                <h2 className="text-2xl font-display font-bold text-textMain mb-4">Sign In Required</h2>
                <p className="text-textSecondary mb-6">You must be signed in to submit a product.</p>
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </div>
        );
    }

    if (!profile?.is_seller) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
                <ShieldCheck size={48} className="text-accent-primary mb-6" />
                <h2 className="text-2xl font-display font-bold text-textMain mb-4">Seller Account Required</h2>
                <p className="text-textSecondary mb-6">You need to be an approved seller to submit products.</p>
                <Button onClick={() => navigate('/apply-to-sell')}>Apply to Sell</Button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-accent-primary/10 text-accent-primary rounded-full flex items-center justify-center mb-8 border border-accent-primary/20">
                    <Check size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-display font-bold text-textMain mb-4">Submission Received!</h2>
                <p className="text-textSecondary mb-8 leading-relaxed">
                    Your product <span className="text-textMain font-mono text-sm bg-surfaceHighlight px-1.5 py-0.5 rounded border border-border">{formData.projectName}</span> is now under review.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate('/seller/submissions')}>View Submissions</Button>
                    <Button onClick={() => navigate('/')}>Return Home</Button>
                </div>
            </div>
        );
    }

    // =====================================================
    // RENDER FORM STEPS
    // =====================================================

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Basic Product Info</h3>
                            <p className="text-sm text-textSecondary mt-1">Tell us what you're selling</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Product Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleInputChange}
                                maxLength={60}
                                placeholder="e.g. SaaSify Starter Kit"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                            />
                            <p className="text-xs text-textMuted text-right">{formData.projectName.length}/60</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                One-line Value Proposition <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="tagline"
                                value={formData.tagline}
                                onChange={handleInputChange}
                                maxLength={120}
                                placeholder="Ship your SaaS 10x faster with pre-built auth, payments, and dashboard"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                            />
                            <p className="text-xs text-textMuted text-right">{formData.tagline.length}/120</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Product Stage <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="productStage"
                                    value={formData.productStage}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {PRODUCT_STAGES.map(stage => (
                                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Live Demo URL
                            </label>
                            <input
                                name="liveUrl"
                                value={formData.liveUrl}
                                onChange={handleInputChange}
                                type="url"
                                placeholder="https://demo.yourproduct.com"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain font-mono text-sm focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Pricing</h3>
                            <p className="text-sm text-textSecondary mt-1">Set your price and license terms</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Price <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-mono">
                                        {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                                    </span>
                                    <input
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        type="number"
                                        min="1"
                                        placeholder="4999"
                                        className="w-full bg-surfaceHighlight border border-border rounded-lg pl-8 pr-4 py-3 text-textMain focus:border-accent-primary focus:outline-none font-mono text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {CURRENCIES.map(curr => (
                                        <option key={curr.value} value={curr.value}>{curr.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Pricing Type
                                </label>
                                <div className="space-y-2">
                                    {PRICING_TYPES.map(type => (
                                        <label key={type.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${formData.pricingType === type.value ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-accent-primary/40'}`}>
                                            <input
                                                type="radio"
                                                name="pricingType"
                                                value={type.value}
                                                checked={formData.pricingType === type.value}
                                                onChange={handleInputChange}
                                                className="mr-3"
                                            />
                                            <span className="text-textMain font-medium">{type.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    License Type
                                </label>
                                <div className="space-y-2">
                                    {LICENSE_TYPES.map(type => (
                                        <label key={type.value} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${formData.licenseType === type.value ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-accent-primary/40'}`}>
                                            <input
                                                type="radio"
                                                name="licenseType"
                                                value={type.value}
                                                checked={formData.licenseType === type.value}
                                                onChange={handleInputChange}
                                                className="mr-3 mt-0.5"
                                            />
                                            <div>
                                                <span className="text-textMain font-medium">{type.label}</span>
                                                <p className="text-xs text-textMuted">{type.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Product Media</h3>
                            <p className="text-sm text-textSecondary mt-1">Visual assets that sell your product</p>
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-3">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Cover Image <span className="text-red-400">*</span>
                            </label>
                            {thumbnailPreview ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                                    <img src={thumbnailPreview} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeThumbnail}
                                        className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent-primary/40 transition bg-surfaceHighlight">
                                    <ImageIcon size={40} className="text-textMuted mb-3" />
                                    <span className="text-textMain font-medium">Click to upload cover image</span>
                                    <span className="text-xs text-textMuted mt-1">PNG, JPG, WebP up to 5MB. 16:9 ratio recommended.</span>
                                    <input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Screenshots */}
                        <div className="space-y-3">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Gallery Screenshots <span className="text-textMuted">(1-5 images)</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {screenshotPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                                        <img src={preview} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeScreenshot(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded text-white hover:bg-black/80 transition"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {screenshotPreviews.length < 5 && (
                                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent-primary/40 transition bg-surfaceHighlight">
                                        <Plus size={24} className="text-textMuted mb-1" />
                                        <span className="text-xs text-textMuted">Add image</span>
                                        <input
                                            ref={screenshotInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleScreenshotChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Demo Video */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Demo Video URL <span className="text-textMuted">(optional)</span>
                            </label>
                            <input
                                name="demoVideoUrl"
                                value={formData.demoVideoUrl}
                                onChange={handleInputChange}
                                type="url"
                                placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain font-mono text-sm focus:border-accent-primary focus:outline-none"
                            />
                            <p className="text-xs text-textMuted">YouTube, Vimeo, or direct MP4 link</p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Product Details</h3>
                            <p className="text-sm text-textSecondary mt-1">Describe what makes your product valuable</p>
                        </div>

                        {/* Executive Summary */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Executive Summary <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                name="executiveSummary"
                                value={formData.executiveSummary}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="A production-ready Next.js boilerplate with authentication, payments, and admin dashboard. Built for founders who want to ship in days, not months..."
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none resize-none"
                            />
                            <p className="text-xs text-textMuted flex justify-between">
                                <span>300-500 characters recommended</span>
                                <span>{formData.executiveSummary.length} chars</span>
                            </p>
                        </div>

                        {/* Problem It Solves */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Problem It Solves
                            </label>
                            <textarea
                                name="problemItSolves"
                                value={formData.problemItSolves}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Building a SaaS from scratch takes 2-3 months of boilerplate work before you can focus on your actual product idea..."
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Core Features
                            </label>
                            <div className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            placeholder={`Feature ${index + 1}`}
                                            className="flex-1 bg-surfaceHighlight border border-border rounded-lg px-4 py-2 text-textMain focus:border-accent-primary focus:outline-none"
                                        />
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-textMuted hover:text-red-400 transition"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-2 text-sm text-accent-primary hover:underline"
                            >
                                <Plus size={14} /> Add feature
                            </button>
                        </div>

                        {/* Tech Stack */}
                        <div className="space-y-3">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Tech Stack <span className="text-red-400">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TECH_STACK_OPTIONS.map(tech => (
                                    <button
                                        key={tech}
                                        type="button"
                                        onClick={() => toggleArrayItem('techStack', tech)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.techStack.includes(tech)
                                            ? 'bg-accent-primary text-black border border-accent-primary'
                                            : 'bg-surfaceHighlight text-textMuted border border-border hover:border-accent-primary/40'
                                            }`}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Setup & Complexity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Setup Time
                                </label>
                                <select
                                    name="setupTime"
                                    value={formData.setupTime}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {SETUP_TIME_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Complexity Level
                                </label>
                                <select
                                    name="complexityLevel"
                                    value={formData.complexityLevel}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {COMPLEXITY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Perfect For / Not For */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Perfect For
                                </label>
                                <div className="space-y-2">
                                    {PERFECT_FOR_OPTIONS.map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.perfectFor.includes(item)}
                                                onChange={() => toggleArrayItem('perfectFor', item)}
                                                className="rounded border-border"
                                            />
                                            <span className="text-sm text-textMain">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Not For
                                </label>
                                <div className="space-y-2">
                                    {NOT_FOR_OPTIONS.map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.notFor.includes(item)}
                                                onChange={() => toggleArrayItem('notFor', item)}
                                                className="rounded border-border"
                                            />
                                            <span className="text-sm text-textMain">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Seller Profile</h3>
                            <p className="text-sm text-textSecondary mt-1">Build credibility with buyers</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Display Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="sellerDisplayName"
                                value={formData.sellerDisplayName}
                                onChange={handleInputChange}
                                placeholder="Your name or brand"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Short Bio <span className="text-textMuted">(max 120 chars)</span>
                            </label>
                            <textarea
                                name="sellerBio"
                                value={formData.sellerBio}
                                onChange={handleInputChange}
                                maxLength={120}
                                rows={2}
                                placeholder="Full-stack engineer with 8 years experience. Built and sold 3 SaaS products."
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none resize-none"
                            />
                            <p className="text-xs text-textMuted text-right">{formData.sellerBio.length}/120</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Experience Level
                                </label>
                                <select
                                    name="sellerExperienceLevel"
                                    value={formData.sellerExperienceLevel}
                                    onChange={handleInputChange}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                >
                                    {EXPERIENCE_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>{level.label} ({level.desc})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                    Prior Projects Completed
                                </label>
                                <input
                                    name="sellerPriorProjects"
                                    value={formData.sellerPriorProjects}
                                    onChange={handleInputChange}
                                    type="number"
                                    min="0"
                                    placeholder="5"
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Portfolio / GitHub URL <span className="text-textMuted">(optional)</span>
                            </label>
                            <input
                                name="sellerPortfolioUrl"
                                value={formData.sellerPortfolioUrl}
                                onChange={handleInputChange}
                                type="url"
                                placeholder="https://github.com/yourusername"
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain font-mono text-sm focus:border-accent-primary focus:outline-none"
                            />
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Trust Signals</h3>
                            <p className="text-sm text-textSecondary mt-1">Commitments that build buyer confidence</p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                                Support Level
                            </label>
                            <div className="space-y-2">
                                {SUPPORT_LEVELS.map(level => (
                                    <label key={level.value} className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${formData.supportLevel === level.value ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-accent-primary/40'}`}>
                                        <input
                                            type="radio"
                                            name="supportLevel"
                                            value={level.value}
                                            checked={formData.supportLevel === level.value}
                                            onChange={handleInputChange}
                                            className="mr-3 mt-0.5"
                                        />
                                        <div>
                                            <span className="text-textMain font-medium">{level.label}</span>
                                            <p className="text-xs text-textMuted">{level.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.hasRefundPolicy ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-accent-primary/40'}`}>
                                <div>
                                    <span className="text-textMain font-medium">Refund Policy</span>
                                    <p className="text-xs text-textMuted">Offer refunds within 14 days</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="hasRefundPolicy"
                                    checked={formData.hasRefundPolicy}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded border-border text-accent-primary"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${formData.hasMaintenanceCommitment ? 'border-accent-primary bg-accent-primary/5' : 'border-border hover:border-accent-primary/40'}`}>
                                <div>
                                    <span className="text-textMain font-medium">Maintenance Commitment</span>
                                    <p className="text-xs text-textMuted">Promise to fix critical bugs for 6 months</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="hasMaintenanceCommitment"
                                    checked={formData.hasMaintenanceCommitment}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded border-border text-accent-primary"
                                />
                            </label>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="border-b border-border pb-4">
                            <h3 className="text-xl font-bold text-textMain">Review & Submit</h3>
                            <p className="text-sm text-textSecondary mt-1">Confirm your submission details</p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-surfaceHighlight rounded-xl p-6 border border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">Product</span>
                                <span className="text-textMain font-medium">{formData.projectName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">Category</span>
                                <span className="text-textMain">{formData.category} • {formData.productStage.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">Price</span>
                                <span className="text-textMain font-mono font-bold">
                                    {CURRENCIES.find(c => c.value === formData.currency)?.symbol}{formData.price} ({formData.pricingType})
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">License</span>
                                <span className="text-textMain capitalize">{formData.licenseType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">Tech Stack</span>
                                <span className="text-textMain">{formData.techStack.slice(0, 3).join(', ')}{formData.techStack.length > 3 ? ` +${formData.techStack.length - 3}` : ''}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-textMuted text-sm">Support</span>
                                <span className="text-textMain capitalize">{formData.supportLevel}</span>
                            </div>
                        </div>

                        {/* Declarations */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-textMain">Legal Declarations</h4>
                            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent-primary/40 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="ownerDeclaration"
                                    checked={formData.ownerDeclaration}
                                    onChange={handleInputChange}
                                    className="mt-0.5 w-5 h-5 rounded border-border text-accent-primary"
                                />
                                <div>
                                    <span className="text-textMain font-medium">I own this product</span>
                                    <p className="text-xs text-textMuted mt-0.5">I confirm that I am the original creator and own all rights to distribute this product.</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent-primary/40 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rightsDeclaration"
                                    checked={formData.rightsDeclaration}
                                    onChange={handleInputChange}
                                    className="mt-0.5 w-5 h-5 rounded border-border text-accent-primary"
                                />
                                <div>
                                    <span className="text-textMain font-medium">I have redistribution rights</span>
                                    <p className="text-xs text-textMuted mt-0.5">Any third-party assets included have proper licensing for commercial redistribution.</p>
                                </div>
                            </label>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // =====================================================
    // MAIN RENDER
    // =====================================================

    return (
        <div className="pt-36 pb-20 px-6 max-w-4xl mx-auto animate-slide-up min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4 text-accent-primary text-xs font-mono uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                    Seller Portal
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4 tracking-tighter">Submit Your Product</h1>
                <p className="text-textSecondary text-lg font-light max-w-2xl leading-relaxed">
                    Complete all sections to submit for review. Our team audits every submission within 48 hours.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Progress */}
            {isSubmitting && uploadProgress > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-textMain font-medium">Uploading...</span>
                        <span className="text-sm text-accent-primary font-mono">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-surfaceHighlight rounded-full overflow-hidden">
                        <div className="h-full bg-accent-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Stepper */}
            <div className="mb-12 border-b border-border pb-6">
                <div className="flex justify-between items-center overflow-x-auto gap-2">
                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        return (
                            <div key={step.id} className="flex items-center gap-2 shrink-0">
                                <div className={`w-8 h-8 rounded text-xs font-mono font-bold flex items-center justify-center transition-all border ${isActive ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20' :
                                    isCompleted ? 'bg-surfaceHighlight text-textMain border-border' :
                                        'bg-surface text-textMuted border-border'
                                    }`}>
                                    {isCompleted ? <Check size={14} /> : step.id}
                                </div>
                                <span className={`text-sm font-medium hidden md:block ${isActive ? 'text-textMain' : 'text-textMuted'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form */}
            <div className="bg-surface border border-border rounded-xl p-8 shadow-soft">
                <form onSubmit={handleNext} className="space-y-8">
                    {renderStepContent()}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ChevronLeft size={16} />
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : currentStep === 7 ? (
                                'Submit for Review'
                            ) : (
                                <>Next <ChevronRight size={16} /></>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Submit;
