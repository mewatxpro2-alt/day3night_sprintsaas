import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, AlertCircle, Globe, Tag, Image as ImageIcon, FileText, ChevronRight, ChevronLeft, ShieldCheck, Info, Cpu, Terminal, Video, X, Loader2, Link as LinkIcon, Code2, ListChecks, Images, FolderArchive, FileDown, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

import { useSubmitKit } from '../hooks/useSubmission';

const STEPS = [
  { id: 1, label: 'Details', icon: Globe },
  { id: 2, label: 'Pricing', icon: Tag },
  { id: 3, label: 'Media', icon: ImageIcon },
  { id: 4, label: 'Resources', icon: FolderArchive },
  { id: 5, label: 'Submit', icon: FileText },
];

const CATEGORIES = ['SaaS', 'E-commerce', 'Agency', 'Portfolio', 'Fintech', 'AI Tool', 'Dashboard', 'Mobile App', 'Landing Page', 'Admin Panel'];

const TECH_STACK_OPTIONS = ['React', 'Next.js', 'Vue', 'Supabase', 'Firebase', 'Tailwind CSS', 'Stripe', 'Prisma', 'PostgreSQL', 'MongoDB', 'Node.js', 'Express', 'TypeScript'];
const SETUP_TIME_OPTIONS = ['5-10 mins', '15-30 mins', '1-2 hours'];
const DELIVERABLES_OPTIONS = ['Pre-configured Auth & DB', 'One-click Deployment', 'Commercial Use Allowed', 'No Subscription / Lock-in'];
const PERFECT_FOR_OPTIONS = ['SaaS MVP launches', 'Internal tools', 'Freelance deliverables', 'Learning modern stacks'];
const NOT_FOR_OPTIONS = ['Complete beginners', 'No-code users', 'Users needing finished product'];
const WHAT_BUYER_GETS_OPTIONS = ['Source code', 'Deployment access', 'Download / repo access', 'Documentation', 'Support'];

// Resource file types
interface ResourceFile {
  file: File;
  type: 'zip' | 'pdf' | 'md' | 'figma' | 'video' | 'image' | 'other';
  description: string;
  linkedDeliverable: string;
}

const RESOURCE_TYPES = [
  { value: 'zip', label: 'Code (ZIP)', accept: '.zip,.rar,.tar,.gz' },
  { value: 'pdf', label: 'Document (PDF)', accept: '.pdf' },
  { value: 'md', label: 'Markdown (MD)', accept: '.md' },
  { value: 'figma', label: 'Design File', accept: '.fig,.sketch,.xd,.pdf' },
  { value: 'video', label: 'Video', accept: '.mp4,.mov,.webm' },
  { value: 'image', label: 'Image', accept: '.png,.jpg,.jpeg,.gif,.webp' },
  { value: 'other', label: 'Other', accept: '*' },
];

const Submit: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { submitKit, uploadProgress, isLoading: isSubmitting } = useSubmitKit();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Core Info
    projectName: '',
    tagline: '',
    shortSummary: '',
    description: '',
    category: 'SaaS',

    // URLs
    liveUrl: '',
    repoUrl: '',

    // Technical
    techStack: [] as string[],
    setupTime: '15-30 mins',
    architectureNotes: '',

    // Pricing & Access
    price: '',
    accessType: 'one-time',
    lifetimeAccess: true,
    whatBuyerGets: [] as string[],

    // Features & Content
    features: '',
    deliverables: [] as string[],
    perfectFor: [] as string[],
    notFor: [] as string[],

    // Media
    thumbnailFile: null as File | null,
    videoFile: null as File | null,
    screenshotFiles: [] as File[],

    // Declarations
    ownerDeclaration: false,
    rightsDeclaration: false,

    // License Configuration
    licenseStandardEnabled: true,
    licenseStandardPrice: '',  // Will default to price
    licenseStandardMax: '20',
    licenseExtendedEnabled: false,
    licenseExtendedPrice: '',
    licenseExtendedMax: '5',
    licenseBuyoutEnabled: false,
    licenseBuyoutPrice: '',
  });

  // Resource files (separate from formData for easier management)
  const [resourceFiles, setResourceFiles] = useState<ResourceFile[]>([]);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  // Previews
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

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
        setError('Thumbnail must be under 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, thumbnailFile: file }));
      setThumbnailPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Video must be under 50MB');
        return;
      }
      setFormData(prev => ({ ...prev, videoFile: file }));
      setVideoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      const newFiles = fileArray.slice(0, 5); // Max 5 screenshots
      const previews = newFiles.map((f: File) => URL.createObjectURL(f));
      setFormData(prev => ({ ...prev, screenshotFiles: [...prev.screenshotFiles, ...newFiles].slice(0, 5) }));
      setScreenshotPreviews(prev => [...prev, ...previews].slice(0, 5));
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnailFile: null }));
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, videoFile: null }));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeScreenshot = (index: number) => {
    URL.revokeObjectURL(screenshotPreviews[index]);
    setFormData(prev => ({
      ...prev,
      screenshotFiles: prev.screenshotFiles.filter((_, i) => i !== index)
    }));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to toggle items in array fields
  const toggleArrayItem = (field: 'techStack' | 'deliverables' | 'perfectFor' | 'notFor' | 'whatBuyerGets', item: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  // Resource file handlers
  const handleAddResource = (file: File, type: ResourceFile['type']) => {
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 50 * 1024 * 1024; // 100MB for video, 50MB for others
    if (file.size > maxSize) {
      setError(`File ${file.name} is too large. Maximum size is ${type === 'video' ? '100MB' : '50MB'}`);
      return;
    }

    setResourceFiles(prev => [...prev, {
      file,
      type,
      description: '',
      linkedDeliverable: ''
    }]);
    setError(null);
  };

  const handleRemoveResource = (index: number) => {
    setResourceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateResourceDescription = (index: number, description: string) => {
    setResourceFiles(prev => prev.map((r, i) => i === index ? { ...r, description } : r));
  };

  const handleUpdateResourceDeliverable = (index: number, linkedDeliverable: string) => {
    setResourceFiles(prev => prev.map((r, i) => i === index ? { ...r, linkedDeliverable } : r));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1 validation
    if (currentStep === 1) {
      if (!formData.projectName.trim()) {
        setError('Kit name is required');
        return;
      }
      if (!formData.shortSummary.trim()) {
        setError('Short summary is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Technical description is required');
        return;
      }
    }

    // Step 2 validation
    if (currentStep === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Please enter a valid price');
        return;
      }
      if (formData.techStack.length === 0) {
        setError('Please select at least one technology');
        return;
      }
      if (formData.whatBuyerGets.length === 0) {
        setError('Please select what the buyer will receive');
        return;
      }
    }

    // Step 4 validation (Resources)
    if (currentStep === 4) {
      if (resourceFiles.length === 0) {
        setError('You must upload at least one resource file (e.g., source code ZIP)');
        return;
      }
      // Check if source code is included
      const hasCode = resourceFiles.some(r => r.type === 'zip');
      if (!hasCode) {
        setError('You must upload the source code (ZIP file) for buyers');
        return;
      }
    }

    if (currentStep < 5) {
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

  const handleSubmitForm = async () => {
    setError(null);

    if (!formData.ownerDeclaration || !formData.rightsDeclaration) {
      setError('You must accept both declarations to submit');
      return;
    }

    const result = await submitKit({
      // Core Info
      projectName: formData.projectName,
      tagline: formData.tagline,
      shortSummary: formData.shortSummary,
      description: formData.description,
      category: formData.category,

      // URLs
      liveUrl: formData.liveUrl,
      repoUrl: formData.repoUrl,

      // Technical
      techStack: formData.techStack.join(', '), // Convert array to comma-separated string for now
      setupTime: formData.setupTime,
      architectureNotes: formData.architectureNotes,

      // Pricing
      price: formData.price,

      // Features & Content
      features: formData.features,
      deliverables: formData.deliverables,
      perfectFor: formData.perfectFor,
      notFor: formData.notFor,
      whatBuyerGets: formData.whatBuyerGets,

      // Media
      thumbnailFile: formData.thumbnailFile || undefined,
      videoFile: formData.videoFile || undefined,
      screenshotFiles: formData.screenshotFiles.length > 0 ? formData.screenshotFiles : undefined,

      // Resource Files
      resourceFiles: resourceFiles.length > 0 ? resourceFiles : undefined,

      // Declarations
      ownerDeclaration: formData.ownerDeclaration,
      rightsDeclaration: formData.rightsDeclaration,
    });

    if (result.success) {
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } else {
      setError(result.error || 'Failed to submit. Please try again.');
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      screenshotPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <ShieldCheck size={48} className="text-textMuted mb-6" />
        <h2 className="text-2xl font-display font-bold text-textMain mb-4">Sign In Required</h2>
        <p className="text-textSecondary mb-6">You must be signed in to submit a kit for review.</p>
        <Button onClick={() => navigate('/signin')}>Sign In</Button>
      </div>
    );
  }

  // Redirect non-sellers
  if (!profile?.is_seller) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <ShieldCheck size={48} className="text-accent-primary mb-6" />
        <h2 className="text-2xl font-display font-bold text-textMain mb-4">Seller Account Required</h2>
        <p className="text-textSecondary mb-6">
          You need to be an approved seller to submit kits to the marketplace.
        </p>
        <Button onClick={() => navigate('/apply-to-sell')}>Apply to Sell</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-accent-primary/10 text-accent-primary rounded-full flex items-center justify-center mb-8 border border-accent-primary/20 shadow-[0_0_30px_-10px_rgba(var(--accent-primary)/0.2)]">
          <Terminal size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-display font-bold text-textMain mb-4">Submission Received!</h2>
        <p className="text-textSecondary mb-8 leading-relaxed">
          Your kit <span className="text-textMain font-mono text-sm bg-surfaceHighlight px-1.5 py-0.5 rounded border border-border">{formData.projectName}</span> is now under review. Our team will audit your code within 48 hours.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/seller/submissions')}>View My Submissions</Button>
          <Button onClick={() => navigate('/')}>Return to Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-20 px-6 max-w-7xl mx-auto animate-slide-up min-h-screen flex flex-col lg:flex-row gap-12">
      {/* LEFT COLUMN: Form */}
      <div className="lg:w-2/3">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-accent-primary text-xs font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
            Creator Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4 tracking-tighter">Submit a Market-Ready SaaS</h1>
          <div className="w-24 mb-6">

          </div>
          <p className="text-textSecondary text-lg font-light max-w-2xl leading-relaxed">
            Join other founders earning passive income. We manually audit every submission to ensure high standards for our buyers.
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
              <span className="text-sm text-textMain font-medium">
                {uploadProgress < 90 ? 'Uploading files...' : 'Saving submission...'}
              </span>
              <span className="text-sm text-accent-primary font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-surfaceHighlight rounded-full overflow-hidden">
              <div className="h-full bg-accent-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-12 border-b border-border pb-6">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10" />
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center gap-3 bg-background pr-4 last:pr-0">
                  <div className={`w-8 h-8 rounded text-xs font-mono font-bold flex items-center justify-center transition-all duration-300 border ${isActive
                    ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                    : isCompleted ? 'bg-surfaceHighlight text-textMain border-border' : 'bg-surface text-textMuted border-border'
                    }`}>
                    {isCompleted ? <Check size={14} /> : step.id}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-textMain' : 'text-textMuted'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface border border-border rounded-xl p-8 relative overflow-hidden shadow-soft">
          <form onSubmit={handleNext} className="space-y-8">

            {/* STEP 1: Details */}
            {currentStep === 1 && (
              <div className="space-y-10 animate-fade-in">
                {/* Section A: Product Identity */}
                <div className="space-y-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-bold text-textMain">Product Identity</h3>
                    <p className="text-xs text-textSecondary">How your product will appear in the marketplace listings.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Product Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        required
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="e.g. Acme SaaS Starter"
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-medium placeholder:text-textMuted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">Primary Category <span className="text-red-400">*</span></label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                      Tagline <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g. The complete Next.js boilerplate for B2B SaaS"
                      maxLength={100}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-textMuted/50"
                    />
                    <p className="text-xs text-textMuted flex justify-between">
                      <span>Catchy, benefit-driven hook.</span>
                      <span>{formData.tagline.length}/100</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                      Short Summary <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      name="shortSummary"
                      value={formData.shortSummary}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Save 200+ hours of dev time with pre-built auth, payments, and admin dashboard."
                      maxLength={120}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-textMuted/50"
                    />
                    <p className="text-xs text-textMuted text-right">{formData.shortSummary.length}/120</p>
                  </div>
                </div>

                {/* Section B: Technical Specs */}
                <div className="space-y-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-bold text-textMain">Technical Specs</h3>
                    <p className="text-xs text-textSecondary">Help developers understand your stack and quality.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon size={12} /> Live Demo URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="liveUrl"
                        value={formData.liveUrl}
                        onChange={handleInputChange}
                        type="url"
                        placeholder="https://demo.myapp.com"
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-mono text-sm placeholder:text-textMuted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider flex items-center gap-2">
                        <Code2 size={12} /> GitHub Repo URL <span className="text-textMuted normal-case">(Private)</span>
                      </label>
                      <input
                        name="repoUrl"
                        value={formData.repoUrl}
                        onChange={handleInputChange}
                        type="url"
                        placeholder="https://github.com/username/repo"
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-mono text-sm placeholder:text-textMuted/50"
                      />
                      <p className="text-[10px] text-textMuted">Used only for our manual code audit. Not shared with buyers.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                      Technical Deep Dive <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder={"Explain the architecture, key libraries, and design patterns used.\n\nExample:\n- Built on Next.js 14 (App Router)\n- Uses Supabase for Auth & Database\n- Stripe Connect for payments\n- 100% TypeScript strict mode"}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all resize-none font-mono text-sm placeholder:text-textMuted/50 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider flex items-center gap-2">
                      <ListChecks size={12} /> Key Features List
                    </label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder={"• Authentication (Google/GitHub)\n• Stripe Subscription (Webhooks handled)\n• User Dashboard & Settings\n• Admin Panel\n• Dark Mode System"}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all resize-none text-sm placeholder:text-textMuted/50 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-fade-in">

                {/* Pricing Strategy */}
                <div className="space-y-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-bold text-textMain">Pricing & Stack</h3>
                    <p className="text-xs text-textSecondary">Set a fair price and define what's inside the box.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Listing Price (USD) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-mono">$</span>
                        <input
                          required
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          type="number"
                          min="1"
                          placeholder="99"
                          className="w-full bg-surfaceHighlight border border-border rounded-lg pl-8 pr-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all font-mono text-lg"
                        />
                      </div>
                      <p className="text-xs text-textMuted">Most popular range: $49 – $149</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Core Tech Stack <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TECH_STACK_OPTIONS.map(tech => (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => toggleArrayItem('techStack', tech)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${formData.techStack.includes(tech)
                              ? 'bg-accent-primary text-black border border-accent-primary shadow-sm'
                              : 'bg-surfaceHighlight text-textMuted border border-border hover:border-accent-primary/40 hover:text-textMain'
                              }`}
                          >
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                      Setup Complexity <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="setupTime"
                      value={formData.setupTime}
                      onChange={handleInputChange}
                      className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                    >
                      {SETUP_TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* License Configuration */}
                <div className="space-y-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-bold text-textMain">License Configuration</h3>
                    <p className="text-xs text-textSecondary">Control how many buyers can purchase this asset. Limits help preserve value.</p>
                  </div>

                  {/* License Explanation */}
                  <div className="p-4 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
                    <p className="text-sm text-textSecondary leading-relaxed">
                      <strong className="text-textMain">Why limits?</strong> These blueprints are sold as execution-ready foundations.
                      We limit how many founders can start from the same base to preserve long-term value.
                      Success depends on execution, not code secrecy.
                    </p>
                  </div>

                  {/* Standard License */}
                  <div className={`p-5 rounded-xl border transition-all ${formData.licenseStandardEnabled ? 'border-accent-primary/40 bg-accent-primary/5' : 'border-border bg-surfaceHighlight'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-textMain">Standard License</h4>
                        <p className="text-xs text-textMuted">Launch, modify, and monetize. Multiple buyers allowed.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.licenseStandardEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, licenseStandardEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surfaceHighlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                      </label>
                    </div>
                    {formData.licenseStandardEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-textMuted">Price (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                            <input
                              type="number"
                              name="licenseStandardPrice"
                              value={formData.licenseStandardPrice}
                              onChange={handleInputChange}
                              placeholder={formData.price || "Same as base"}
                              className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-2 text-textMain text-sm focus:border-accent-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-textMuted">Max Buyers</label>
                          <input
                            type="number"
                            name="licenseStandardMax"
                            value={formData.licenseStandardMax}
                            onChange={handleInputChange}
                            min="1"
                            max="100"
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-textMain text-sm focus:border-accent-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extended License */}
                  <div className={`p-5 rounded-xl border transition-all ${formData.licenseExtendedEnabled ? 'border-accent-secondary/40 bg-accent-secondary/5' : 'border-border bg-surfaceHighlight'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-textMain">Extended License</h4>
                        <p className="text-xs text-textMuted">Same rights, fewer buyers. Less market competition.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.licenseExtendedEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, licenseExtendedEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surfaceHighlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-secondary"></div>
                      </label>
                    </div>
                    {formData.licenseExtendedEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-textMuted">Price (USD) <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                            <input
                              type="number"
                              name="licenseExtendedPrice"
                              value={formData.licenseExtendedPrice}
                              onChange={handleInputChange}
                              required={formData.licenseExtendedEnabled}
                              placeholder="199"
                              className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-2 text-textMain text-sm focus:border-accent-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-textMuted">Max Buyers</label>
                          <input
                            type="number"
                            name="licenseExtendedMax"
                            value={formData.licenseExtendedMax}
                            onChange={handleInputChange}
                            min="1"
                            max="20"
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-textMain text-sm focus:border-accent-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buyout License */}
                  <div className={`p-5 rounded-xl border transition-all ${formData.licenseBuyoutEnabled ? 'border-red-500/40 bg-red-500/5' : 'border-border bg-surfaceHighlight'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-textMain">Buyout License</h4>
                        <p className="text-xs text-textMuted">Exclusive ownership. Asset removed from marketplace after sale.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.licenseBuyoutEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, licenseBuyoutEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surfaceHighlight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </div>
                    {formData.licenseBuyoutEnabled && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-textMuted">Buyout Price (USD) <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted text-sm">$</span>
                            <input
                              type="number"
                              name="licenseBuyoutPrice"
                              value={formData.licenseBuyoutPrice}
                              onChange={handleInputChange}
                              required={formData.licenseBuyoutEnabled}
                              placeholder="999"
                              className="w-full bg-surface border border-border rounded-lg pl-7 pr-3 py-2 text-textMain text-sm focus:border-accent-primary focus:outline-none"
                            />
                          </div>
                          <p className="text-xs text-textMuted">Typically 5-10x the standard price. Requires admin approval before purchase.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deliverables Scope */}
                <div className="space-y-6">
                  <div className="border-b border-border pb-2 mb-4">
                    <h3 className="text-lg font-bold text-textMain">Deliverables</h3>
                    <p className="text-xs text-textSecondary">What exactly does the buyer get?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Included Items */}
                    <div className="space-y-3">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Included Features
                      </label>
                      <div className="space-y-2">
                        {DELIVERABLES_OPTIONS.map(item => (
                          <label key={item} className="flex items-center gap-3 p-3 rounded-lg bg-surfaceHighlight border border-border hover:border-accent-primary/30 cursor-pointer transition-all group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.deliverables.includes(item) ? 'bg-accent-primary border-accent-primary' : 'border-textMuted/50'}`}>
                              <input
                                type="checkbox"
                                checked={formData.deliverables.includes(item)}
                                onChange={() => toggleArrayItem('deliverables', item)}
                                className="hidden"
                              />
                              {formData.deliverables.includes(item) && <Check size={10} className="text-black" />}
                            </div>
                            <span className="text-sm text-textMain group-hover:text-textMain/90">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Buyer Rights */}
                    <div className="space-y-3">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Usage Rights
                      </label>
                      <div className="space-y-2">
                        {WHAT_BUYER_GETS_OPTIONS.map(item => (
                          <label key={item} className="flex items-center gap-3 p-3 rounded-lg bg-surfaceHighlight border border-border hover:border-accent-primary/30 cursor-pointer transition-all group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.whatBuyerGets.includes(item) ? 'bg-accent-primary border-accent-primary' : 'border-textMuted/50'}`}>
                              <input
                                type="checkbox"
                                checked={formData.whatBuyerGets.includes(item)}
                                onChange={() => toggleArrayItem('whatBuyerGets', item)}
                                className="hidden"
                              />
                              {formData.whatBuyerGets.includes(item) && <Check size={10} className="text-black" />}
                            </div>
                            <span className="text-sm text-textMain group-hover:text-textMain/90">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="space-y-4">
                  <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs text-textMuted block mb-2">Ideal For (Green Flags)</span>
                      <div className="flex flex-wrap gap-2">
                        {PERFECT_FOR_OPTIONS.map(item => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem('perfectFor', item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${formData.perfectFor.includes(item)
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-surfaceHighlight text-textMuted border-border hover:border-textMuted'
                              }`}
                          >
                            + {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-textMuted block mb-2">Not For (Red Flags)</span>
                      <div className="flex flex-wrap gap-2">
                        {NOT_FOR_OPTIONS.map(item => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem('notFor', item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${formData.notFor.includes(item)
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-surfaceHighlight text-textMuted border-border hover:border-textMuted'
                              }`}
                          >
                            - {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission Box - Improved */}
                <div className="bg-surfaceHighlight rounded-xl border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent-tertiary/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="text-accent-tertiary" size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-textMain font-medium">90% Revenue Share</p>
                      <p className="text-xs text-textSecondary max-w-sm leading-relaxed">
                        We charge a flat 10% commission to handle global tax compliance, merchant of record duties, and hosting.
                      </p>
                    </div>
                  </div>
                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="text-right bg-background border border-border rounded-lg p-3 min-w-[140px]">
                      <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Your Take</p>
                      <p className="text-2xl font-display font-bold text-accent-primary">
                        ${(parseFloat(formData.price) * 0.9).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* STEP 3: Media */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-2 mb-4">
                  <h3 className="text-lg font-bold text-textMain">Visual Showcase</h3>
                  <p className="text-xs text-textSecondary">Good visuals can increase conversion by 300%.</p>
                </div>

                {/* Thumbnail */}
                <div className="space-y-3">
                  <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                    Cover Image <span className="text-red-400">*</span>
                  </label>
                  <input ref={thumbnailInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailChange} className="hidden" />

                  {thumbnailPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border group shadow-sm">
                      <img src={thumbnailPreview} alt="Thumbnail" className="w-full aspect-video object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={removeThumbnail} className="px-4 py-2 bg-red-500/90 text-white rounded-lg font-medium shadow-lg hover:bg-red-500 transition-colors">
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => thumbnailInputRef.current?.click()} className="border-2 border-dashed border-border hover:border-accent-primary/50 hover:bg-surfaceHighlight/50 rounded-xl p-12 text-center cursor-pointer group bg-surface transition-all">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-surfaceHighlight text-textMuted border border-border rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-accent-primary/30 group-hover:text-accent-primary transition-all duration-300">
                          <ImageIcon size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-textMain font-medium text-base">Click to upload cover</p>
                          <p className="text-textMuted text-xs">1920x1080 (16:9) • max 5MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video */}
                <div className="space-y-3">
                  <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider flex items-center justify-between">
                    <span>Demo Video <span className="text-accent-primary">(Highly Recommended)</span></span>
                  </label>
                  <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" onChange={handleVideoChange} className="hidden" />

                  {videoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-black shadow-sm">
                      <video src={videoPreview} className="w-full aspect-video" controls />
                      <button type="button" onClick={removeVideo} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-lg text-white transition-colors backdrop-blur-sm">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-border hover:border-accent-primary/50 hover:bg-surfaceHighlight/50 rounded-xl p-12 text-center cursor-pointer group bg-surface transition-all">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-surfaceHighlight text-textMuted border border-border rounded-full flex items-center justify-center group-hover:scale-110 group-hover:border-accent-primary/30 group-hover:text-accent-primary transition-all duration-300">
                          <Video size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-textMain font-medium text-base">Upload Walkthrough</p>
                          <p className="text-textMuted text-xs">MP4 • max 50MB • Show the core workflow</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshots */}
                <div className="space-y-3">
                  <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                    Gallery Screenshots
                  </label>
                  <input ref={screenshotInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleScreenshotChange} className="hidden" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {screenshotPreviews.map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-video group">
                        <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeScreenshot(i)} className="p-2 bg-white/10 text-white rounded-full hover:bg-red-500 hover:text-white transition-colors backdrop-blur-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {screenshotPreviews.length < 5 && (
                      <div onClick={() => screenshotInputRef.current?.click()} className="border border-dashed border-border hover:border-accent-primary/50 rounded-lg aspect-video flex flex-col items-center justify-center cursor-pointer bg-surfaceHighlight/30 hover:bg-surfaceHighlight transition-all gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-textMuted group-hover:text-accent-primary group-hover:border-accent-primary/30 transition-all">
                          <Upload size={14} />
                        </div>
                        <p className="text-[10px] text-textMuted font-medium">Add Image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Resources */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-2 mb-4">
                  <h3 className="text-lg font-bold text-textMain">Asset Delivery</h3>
                  <p className="text-xs text-textSecondary">Upload the files immediate buyers will receive.</p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6 flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-textMain mb-1">Secure Transfer Protocol</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      Files are encrypted at rest. We automatically scan all uploads for hardcoded API keys and secrets. <br />
                      <span className="text-blue-400 font-medium">Please remove .env files before zipping.</span>
                    </p>
                  </div>
                </div>

                {/* Upload Zones */}
                <div className="space-y-4">
                  <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                    Upload Files
                  </label>
                  <p className="text-xs text-textMuted -mt-2 mb-2">Supported: ZIP (Required for Code), PDF, MD</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {RESOURCE_TYPES.map(rt => (
                      <div key={rt.value} className="relative group">
                        <input
                          type="file"
                          accept={rt.accept}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAddResource(file, rt.value as ResourceFile['type']);
                            e.target.value = '';
                          }}
                          className="hidden"
                          id={`resource-${rt.value}`}
                        />
                        <label
                          htmlFor={`resource-${rt.value}`}
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-accent-primary/40 hover:bg-surfaceHighlight/50 rounded-xl cursor-pointer bg-surface transition-all text-center h-full group-hover:-translate-y-1"
                        >
                          <div className="w-10 h-10 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center mb-3 text-textMuted group-hover:text-accent-primary group-hover:scale-110 transition-all">
                            <FolderArchive size={18} />
                          </div>
                          <span className="text-sm text-textMain font-medium">{rt.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Files List */}
                {resourceFiles.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Files to be delivered ({resourceFiles.length})
                      </label>
                      <span className="text-xs text-accent-primary flex items-center gap-1">
                        <Check size={12} /> Ready for encryption
                      </span>
                    </div>

                    <div className="space-y-3">
                      {resourceFiles.map((resource, index) => (
                        <div key={index} className="bg-surface rounded-xl border border-border p-4 shadow-sm hover:border-accent-primary/20 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-surfaceHighlight rounded-lg flex items-center justify-center border border-border">
                                <FileDown size={20} className="text-textMain" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-textMain truncate max-w-[200px]">
                                  {resource.file.name}
                                </p>
                                <p className="text-[11px] font-mono text-textMuted uppercase mt-1">
                                  {(resource.file.size / 1024 / 1024).toFixed(2)} MB • {resource.type}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveResource(index)}
                              className="p-2 text-textMuted hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase text-textMuted tracking-wider font-semibold mb-1.5 block">Display Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Full Source Code v1.0"
                                value={resource.description}
                                onChange={(e) => handleUpdateResourceDescription(index, e.target.value)}
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-sm text-textMain placeholder:text-textMuted/50 focus:border-accent-primary focus:outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase text-textMuted tracking-wider font-semibold mb-1.5 block">Contents</label>
                              <select
                                value={resource.linkedDeliverable}
                                onChange={(e) => handleUpdateResourceDeliverable(index, e.target.value)}
                                className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:border-accent-primary focus:outline-none transition-all"
                              >
                                <option value="">Select contents...</option>
                                {formData.whatBuyerGets.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Status */}
                <div className="bg-surfaceHighlight/30 border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-mono text-textMuted uppercase tracking-wider">Required Files Status</p>
                    {resourceFiles.some(r => r.type === 'zip') && (
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 font-medium">Ready to Submit</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${resourceFiles.some(r => r.type === 'zip') ? 'bg-accent-primary border-accent-primary text-black' : 'border-border bg-surface text-transparent'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-medium ${resourceFiles.some(r => r.type === 'zip') ? 'text-textMain' : 'text-textMuted'}`}>
                        Source Code (ZIP)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${resourceFiles.some(r => r.type === 'pdf' || r.type === 'md') ? 'bg-accent-primary border-accent-primary text-black' : 'border-border bg-surface text-transparent'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-medium ${resourceFiles.some(r => r.type === 'pdf' || r.type === 'md') ? 'text-textMain' : 'text-textMuted'}`}>
                        Documentation (PDF/MD)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Final Review */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-2 mb-4">
                  <h3 className="text-lg font-bold text-textMain">Ready to Launch?</h3>
                  <p className="text-xs text-textSecondary">Double check your listing details before going live.</p>
                </div>

                {/* Listing Preview Card */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-48 bg-surfaceHighlight">
                    {formData.thumbnailFile ? (
                      <img
                        src={URL.createObjectURL(formData.thumbnailFile)}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-textMuted">
                        <ImageIcon size={48} opacity={0.2} />
                      </div>
                    )}

                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                      ${formData.price}
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2">
                      {formData.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] rounded-md border border-white/10 shadow-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-accent-primary text-xs font-mono uppercase tracking-wider mb-1">{formData.category}</div>
                        <h3 className="text-xl font-display font-bold text-textMain">{formData.projectName || "Untitled Project"}</h3>
                        <p className="text-textSecondary text-sm mt-1">{formData.tagline || "No tagline provided"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wider">Deliverables</p>
                        <p className="text-sm font-medium text-textMain mt-0.5">{resourceFiles.length} File(s)</p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted uppercase tracking-wider">Est. Setup</p>
                        <p className="text-sm font-medium text-textMain mt-0.5">{formData.setupTime}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Description Preview</p>
                      <p className="text-sm text-textSecondary line-clamp-3">{formData.description || "No description provided."}</p>
                    </div>
                  </div>
                </div>

                {/* Creator Pledge */}
                <div className="bg-surfaceHighlight/30 rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} className="text-accent-primary" />
                    <span className="text-sm font-bold text-textMain uppercase tracking-wider">Creator Pledge</span>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-surfaceHighlight transition-colors cursor-pointer group">
                      <input type="checkbox" name="ownerDeclaration" checked={formData.ownerDeclaration} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-accent-primary" />
                      <div>
                        <p className="text-sm font-medium text-textMain group-hover:text-accent-primary transition-colors">I own 100% of this code</p>
                        <p className="text-xs text-textMuted leading-relaxed">I am the original author and have the right to sell it.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-surfaceHighlight transition-colors cursor-pointer group">
                      <input type="checkbox" name="rightsDeclaration" checked={formData.rightsDeclaration} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-accent-primary" />
                      <div>
                        <p className="text-sm font-medium text-textMain group-hover:text-accent-primary transition-colors">No copyright infringement</p>
                        <p className="text-xs text-textMuted leading-relaxed">This project does not contain unauthorized assets or keys.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
              {currentStep > 1 ? (
                <Button type="button" variant="ghost" onClick={handleBack} icon={<ChevronLeft size={16} />}>Back</Button>
              ) : <div />}

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                disabled={currentStep === 5 && (!formData.ownerDeclaration || !formData.rightsDeclaration)}
                className="min-w-[160px]"
                icon={currentStep < 5 ? <ChevronRight size={16} /> : undefined}
              >
                {currentStep === 5 ? 'Submit for Review' : 'Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Help */}
      <div className="hidden lg:block lg:w-1/3">
        <div className="sticky top-28 space-y-8">
          {/* Approval Tips */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-textMain">
              <ShieldCheck size={18} className="text-accent-primary" />
              <span className="text-sm font-bold uppercase tracking-wider">The Audit Checklist</span>
            </div>
            <ul className="space-y-4">
              {[
                { label: "Live Demo URL", sub: "Must be publicly accessible" },
                { label: "High-Quality Video", sub: "Show the full user flow (60s+)" },
                { label: "Documentation", sub: "README or Setup Guide included" },
                { label: "No Critical Bugs", sub: "We test every submission manually" },
                { label: "Fair Pricing", sub: "Comparable to market standards" }
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-textSecondary group hover:text-textMain transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary/40 mt-1.5 group-hover:bg-accent-primary transition-colors" />
                  <div>
                    <span className="font-medium block">{tip.label}</span>
                    <span className="text-xs text-textMuted">{tip.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Box */}
          <div className="p-6 rounded-xl border border-border bg-surfaceHighlight/50">
            <div className="flex items-center gap-3 mb-3 text-textMain">
              <div className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center">
                <Info size={16} />
              </div>
              <span className="font-bold text-sm">Creator Support</span>
            </div>
            <p className="text-textSecondary text-sm leading-relaxed mb-4">
              Not sure if your product fits? Send us a draft or ask about pricing strategy.
            </p>
            <a href="mailto:khnnabubakar786@gmail.com" className="text-xs font-mono text-accent-primary hover:underline">khnnabubakar786@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;