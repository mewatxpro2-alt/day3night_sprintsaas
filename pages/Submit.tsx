import React, { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, Globe, Tag, Image as ImageIcon, FileText, ChevronRight, ChevronLeft, ShieldCheck, Info, Save, Cpu, Terminal } from 'lucide-react';
import Button from '../components/Button';

const STEPS = [
  { id: 1, label: 'Manifest', icon: Globe },
  { id: 2, label: 'Commercials', icon: Tag },
  { id: 3, label: 'Assets', icon: ImageIcon },
  { id: 4, label: 'Review', icon: FileText },
];

const GUIDELINES = {
  1: {
    title: "Submission Standards",
    points: [
      "Production-ready code only. No 'WIP' repos.",
      "Must include strict TypeScript configuration.",
      "Documentation or Readme.md is required.",
      "Live demo must be publicly accessible."
    ]
  },
  2: {
    title: "Pricing Strategy",
    points: [
      "Most successful SaaS kits list between $129-$249.",
      "You keep 90% of revenue. Payouts via Stripe.",
      "One-time purchase license (Standard).",
      "We handle VAT and global tax compliance."
    ]
  },
  3: {
    title: "Asset Requirements",
    points: [
      "16:10 aspect ratio recommended (e.g., 2560x1600).",
      "Clean UI screenshots preferred over abstract art.",
      "No text-heavy marketing overlays.",
      "File size limit: 5MB per image."
    ]
  },
  4: {
    title: "Code Audit Process",
    points: [
      "Our engineers will clone your repo within 48h.",
      "We check for: Secrets, Type Safety, and Scalability.",
      "You will receive an email with the audit result.",
      "Approved kits are listed immediately."
    ]
  }
};

const Submit: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const [formData, setFormData] = useState({
    projectName: '',
    liveUrl: '',
    category: 'SaaS',
    description: '',
    price: '',
    techStack: '',
    thumbnailName: ''
  });

  // Simulate auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => setIsSaved(true), 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setIsSaved(false);
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitForm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-8 border border-accent/20 shadow-[0_0_30px_-10px_rgba(209,242,94,0.3)]">
          <Terminal size={40} strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-4">Submission Queued</h2>
        <p className="text-textMuted mb-8 leading-relaxed">
          Your repository <span className="text-white font-mono text-sm bg-white/10 px-1.5 py-0.5 rounded">{formData.projectName || 'Untitled'}</span> has been added to the audit queue. Expect a technical review within 48 hours.
        </p>
        <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>Return to Catalog</Button>
            <Button onClick={() => { setIsSuccess(false); setCurrentStep(1); setFormData({ projectName: '', liveUrl: '', category: 'SaaS', description: '', price: '', techStack: '', thumbnailName: '' }); }}>Submit New Manifest</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto animate-slide-up min-h-screen flex flex-col lg:flex-row gap-12">
      
      {/* LEFT COLUMN: Form Context */}
      <div className="lg:w-2/3">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-textMuted text-xs font-mono uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Creator Portal
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">Submit Candidate for Audit</h1>
          <p className="text-textMuted text-lg font-light">
            We accept <span className="text-white font-medium">~5%</span> of submissions. Focus on code quality, type safety, and architecture.
          </p>
        </div>

        {/* Stepper (Linear/Technical) */}
        <div className="mb-12 border-b border-white/5 pb-6">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10" />
            
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div key={step.id} className="flex items-center gap-3 bg-background pr-4 last:pr-0">
                  <div 
                    className={`w-8 h-8 rounded text-xs font-mono font-bold flex items-center justify-center transition-all duration-300 border ${
                      isActive 
                        ? 'bg-accent text-black border-accent' 
                        : isCompleted 
                          ? 'bg-white/10 text-white border-transparent' 
                          : 'bg-transparent text-textMuted border-white/10'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : step.id}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-white' : 'text-textMuted'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#0A0A0B] border border-white/10 rounded-xl p-8 relative overflow-hidden ring-1 ring-white/5">
           {/* Auto-save Indicator */}
           <div className="absolute top-6 right-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider transition-opacity duration-500">
             {isSaved ? (
                <span className="text-textMuted flex items-center gap-1.5"><Save size={10} /> Draft Saved</span>
             ) : (
                <span className="text-accent flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Saving...</span>
             )}
           </div>

           <form onSubmit={handleNext} className="space-y-8">
              
              {/* STEP 1: Manifest */}
              {currentStep === 1 && (
                  <div className="space-y-8 animate-fade-in">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Repository / Product Name</label>
                        <input 
                          required
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleInputChange}
                          type="text" 
                          placeholder="e.g. Next.js SaaS Starter"
                          className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-medium placeholder:text-textMuted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Production Demo URL</label>
                        <div className="relative">
                            <input 
                              required
                              name="liveUrl"
                              value={formData.liveUrl}
                              onChange={handleInputChange}
                              type="url" 
                              placeholder="https://app.demo.com"
                              className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-mono text-sm placeholder:text-textMuted/30"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="flex w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                            </div>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1">Must be a live deployment. No localhost or staging.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Primary Category</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {['SaaS', 'E-commerce', 'Agency', 'Portfolio', 'Fintech', 'AI Tool'].map(cat => (
                           <button
                             type="button"
                             key={cat}
                             onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                             className={`px-4 py-3 rounded-md text-sm font-medium border transition-all text-left flex items-center justify-between ${
                                formData.category === cat 
                                  ? 'bg-accent/10 border-accent text-white' 
                                  : 'bg-[#050505] border-white/10 text-textMuted hover:border-white/20 hover:text-white'
                             }`}
                           >
                             {cat}
                             {formData.category === cat && <Check size={14} className="text-accent" />}
                           </button>
                         ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Technical Architecture</label>
                      <textarea 
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder={"- Auth: NextAuth v5 with Middleware\n- DB: Supabase (Postgres) with RLS enabled\n- Payments: Stripe Connect webhooks\n- Emails: Resend React Templates"}
                        className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all resize-none font-mono text-sm placeholder:text-textMuted/30 leading-relaxed"
                      />
                      <p className="text-[10px] text-textMuted mt-1 flex items-center gap-1">
                         <Info size={10} /> List key modules. Be specific about versions and security patterns.
                      </p>
                    </div>
                  </div>
              )}

              {/* STEP 2: Commercials */}
              {currentStep === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    
                    <div className="p-4 bg-accent/5 rounded border border-accent/10 flex gap-4 items-start">
                        <AlertCircle className="text-accent shrink-0 mt-0.5" size={18} />
                        <div className="space-y-1">
                            <p className="text-white text-sm font-bold">Standard Commission: 10%</p>
                            <p className="text-textMuted text-xs leading-relaxed">
                                You keep 90% of every sale. We handle global merchant-of-record compliance, tax collection, and fraud detection.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">License Price (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-mono">$</span>
                                <input 
                                    required
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    type="number" 
                                    min="0"
                                    placeholder="149"
                                    className="w-full bg-[#050505] border border-white/10 rounded-md pl-8 pr-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Core Tech Stack</label>
                            <input 
                                required
                                name="techStack"
                                value={formData.techStack}
                                onChange={handleInputChange}
                                type="text" 
                                placeholder="Next.js 14, Tailwind, Prisma, TRPC"
                                className="w-full bg-[#050505] border border-white/10 rounded-md px-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-textMuted/30"
                            />
                        </div>
                    </div>
                  </div>
              )}

              {/* STEP 3: Assets */}
              {currentStep === 3 && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="space-y-2">
                        <label className="text-xs font-mono font-medium text-textMuted uppercase tracking-wider">Cover Asset</label>
                        <div 
                            className={`border border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group relative overflow-hidden ${
                                formData.thumbnailName ? 'border-accent/50 bg-accent/5' : 'border-white/10 hover:border-white/20 bg-[#050505]'
                            }`}
                            onClick={() => setFormData(prev => ({...prev, thumbnailName: 'cover_v1.png'}))}
                        >
                            {formData.thumbnailName ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-accent text-black rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                                        <Check size={24} />
                                    </div>
                                    <p className="text-white font-medium text-lg">{formData.thumbnailName}</p>
                                    <p className="text-accent text-sm mt-1">Ready for upload</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-white/5 text-textMuted rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-white/10 group-hover:text-white">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-white font-medium mb-2">Click to Upload Cover</p>
                                    <p className="text-textMuted text-xs font-mono">PNG/JPG • Max 5MB • 16:10 Ratio</p>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
              )}

              {/* STEP 4: Review */}
              {currentStep === 4 && (
                  <div className="space-y-8 animate-fade-in">
                    
                    <div className="bg-[#050505] rounded-lg border border-white/10 divide-y divide-white/5">
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-textMuted text-xs font-mono uppercase">Repository</span>
                            <span className="text-white font-medium">{formData.projectName}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-textMuted text-xs font-mono uppercase">Category</span>
                            <span className="text-white font-medium">{formData.category}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <span className="text-textMuted text-xs font-mono uppercase">Listing Price</span>
                            <span className="text-white font-medium">${formData.price}</span>
                        </div>
                        <div className="p-4">
                            <span className="text-textMuted text-xs font-mono uppercase block mb-2">Tech Specs</span>
                            <p className="text-textMuted text-sm whitespace-pre-line font-mono text-[13px] bg-white/5 p-3 rounded border border-white/5">
                                {formData.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <ShieldCheck className="text-blue-400 mt-0.5 shrink-0" size={16} />
                        <div>
                             <p className="text-sm text-white font-medium mb-1">Ownership Confirmation</p>
                             <p className="text-xs text-textMuted leading-relaxed">
                                I confirm I am the original author of this code. I understand that plagiarized submissions result in an immediate, permanent ban from the marketplace.
                            </p>
                        </div>
                    </div>
                  </div>
              )}

              {/* Nav Buttons */}
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-white/5">
                 {currentStep > 1 ? (
                     <Button type="button" variant="ghost" onClick={handleBack} icon={<ChevronLeft size={16} />} className="text-textMuted hover:text-white">
                         Back
                     </Button>
                 ) : (
                     <div />
                 )}
                 
                 <Button type="submit" size="lg" isLoading={isSubmitting} className="min-w-[140px]" icon={currentStep < 4 ? <ChevronRight size={16} /> : undefined}>
                     {currentStep === 4 ? 'Submit for Audit' : 'Next Step'}
                 </Button>
              </div>

           </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Guidelines */}
      <div className="hidden lg:block lg:w-1/3">
         <div className="sticky top-28 space-y-6">
            
            {/* Guidelines Card */}
            <div className="bg-[#0A0A0B] border border-white/10 rounded-xl p-6 ring-1 ring-white/5">
               <div className="flex items-center gap-2 mb-4 text-accent">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                     {GUIDELINES[currentStep as keyof typeof GUIDELINES]?.title || "Guidelines"}
                  </span>
               </div>
               
               <ul className="space-y-3">
                  {GUIDELINES[currentStep as keyof typeof GUIDELINES]?.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-textMuted leading-relaxed">
                       <span className="w-1 h-1 rounded-full bg-white/30 mt-2 shrink-0"></span>
                       {point}
                    </li>
                  ))}
               </ul>
            </div>

            {/* Support Box */}
            <div className="p-6 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
               <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-textMuted mb-4">
                  <Cpu size={20} />
               </div>
               <h3 className="text-white font-bold text-sm mb-2">Technical Support</h3>
               <p className="text-textMuted text-xs leading-relaxed mb-4">
                  If your repo is private or requires special env keys for the audit, please email our engineering team after submission.
               </p>
               <div className="text-xs font-mono text-white/50 border-t border-white/5 pt-3">
                  engineers@webcatalog.pro
               </div>
            </div>

         </div>
      </div>

    </div>
  );
};

export default Submit;