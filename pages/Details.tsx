import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Globe, Layout, ShieldCheck, MessageCircle, Star, Play, Loader2, Maximize2, Lock, CheckCircle, FileText, Clock, GitBranch, Zap, Bookmark, XCircle, HelpCircle, PackageCheck, FileCode } from 'lucide-react';
import { Listing } from '../types';
import Button from '../components/Button';

interface DetailsProps {
  listing: Listing;
  onBack: () => void;
}

const Details: React.FC<DetailsProps> = ({ listing, onBack }) => {
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="pt-24 pb-20 animate-slide-up min-h-screen">
      {/* Navigation / Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-textMuted hover:text-textMain transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Catalog
          </button>
          
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-textMuted mr-2">
              <ShieldCheck size={14} className="text-accent-primary" />
              Verified Logic
            </span>
            {/* Feature 3: Save for Later (Soft Exit) */}
            <Button 
              variant="ghost" 
              icon={<Bookmark size={16} className={isSaved ? "fill-current" : ""} />}
              onClick={() => setIsSaved(!isSaved)}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" icon={<MessageCircle size={16} />}>Ask Builder</Button>
            <Button icon={<Lock size={14} />}>
              {listing.price > 0 ? `Get Full Access • $${listing.price}` : 'Download Kit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Preview & Narrative */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Simulated Browser Window */}
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl ring-1 ring-white/5">
            <div className="h-10 bg-[#0A0A0B] border-b border-border flex items-center px-4 gap-4 justify-between">
              <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              
              {/* URL Bar */}
              <div className="flex-1 flex justify-center max-w-md">
                <div className="w-full px-4 py-1 rounded bg-black/40 text-xs text-textMuted font-mono flex items-center justify-center gap-2 overflow-hidden truncate border border-white/5">
                  <Lock size={10} className="text-accent-primary shrink-0" />
                  <span className="opacity-50">https://</span>
                  <span className="text-white opacity-80">{listing.previewUrl ? new URL(listing.previewUrl).hostname : `production.${listing.id}.app`}</span>
                </div>
              </div>

              {/* External Link Action */}
              <div className="flex items-center">
                 {listing.previewUrl && (
                   <a 
                     href={listing.previewUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-textMuted hover:text-white transition-colors p-1"
                     title="Open in new tab"
                   >
                     <Maximize2 size={14} />
                   </a>
                 )}
              </div>
            </div>
            
            <div className="relative aspect-video w-full bg-[#050505] overflow-hidden group">
              {listing.previewUrl && isPreviewActive ? (
                <>
                  {/* Loader */}
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface z-10">
                      <Loader2 className="animate-spin text-accent-primary mb-2" size={32} />
                      <p className="text-xs text-textMuted font-mono tracking-widest">CONNECTING TO PRODUCTION BUILD...</p>
                    </div>
                  )}
                  {/* Live Iframe */}
                  <iframe 
                    src={listing.previewUrl}
                    className={`w-full h-full border-0 transition-opacity duration-700 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
                    loading="lazy"
                    onLoad={() => setIframeLoaded(true)}
                  />
                  
                  <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-1000 ${iframeLoaded ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
                     <span className="px-4 py-2 bg-black/80 rounded-full text-[10px] text-white/70 border border-white/10 backdrop-blur-md shadow-lg font-mono">
                       Interactive Sandbox Environment
                     </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Static Placeholder */}
                  <img 
                    src={listing.image} 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-[1.02] group-hover:opacity-100" 
                    alt="Preview"
                  />
                  
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all duration-300 group-hover:bg-black/40">
                     <Button 
                       onClick={() => setIsPreviewActive(true)}
                       className="shadow-[0_0_50px_-10px_rgba(209,242,94,0.4)] scale-100 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-accent-primary/20"
                       size="lg"
                       icon={<Play size={18} fill="currentColor" />}
                     >
                        Launch Interactive Preview
                     </Button>
                     <p className="mt-6 text-xs text-white/70 font-medium tracking-widest uppercase flex items-center gap-2">
                       <Zap size={12} className="text-accent-primary" />
                       Real Production Build
                     </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Narrative / Description */}
          <div className="prose prose-invert max-w-none text-textMain">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-6">
               <h1 className="text-3xl font-display font-bold text-textMain m-0 tracking-tight">{listing.title}</h1>
               <div className="flex items-center gap-2">
                  <Star size={16} className="text-accent-secondary fill-accent-secondary" />
                  <span className="text-textMain font-medium">{listing.creator.rating}</span>
                  <span className="text-textMuted text-sm">({listing.views} views)</span>
               </div>
            </div>
            
            <h3 className="text-lg font-bold text-textMain">Why start with this foundation?</h3>
            <p className="text-textMuted leading-relaxed text-lg">
              {listing.description} Stop wasting weeks on boilerplate. This kit provides a battle-tested architecture that handles 
              <span className="text-textMain font-bold"> Authentication, Database, and Payments</span> out of the box. 
              It's clean, strictly typed, and designed for immediate scalability.
            </p>

            {/* ROI Anchor */}
            <div className="my-8 p-5 rounded-lg bg-surfaceHighlight border border-border flex items-center gap-5">
               <div className="p-3 bg-accent-primary/10 rounded-full text-accent-primary border border-accent-primary/20">
                 <Clock size={24} />
               </div>
               <div>
                 <p className="text-textMuted text-xs font-mono uppercase tracking-wider mb-1">Estimated ROI</p>
                 <p className="text-textMain font-medium">
                   Saves ~160 hours of development time. <span className="text-textMuted">(Worth $15,000+ in engineering costs)</span>
                 </p>
               </div>
            </div>

            {/* Feature 4 & 5: Use Cases & "Not For" (Churn Reduction) */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
               <div>
                  <h4 className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
                     <CheckCircle size={16} className="text-accent-primary" />
                     Perfect for
                  </h4>
                  <ul className="space-y-3">
                     {[
                        'SaaS MVP launches', 
                        'High-performance internal tools', 
                        'Freelance client deliverables',
                        'Learning modern stack patterns'
                     ].map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-textMuted">
                           <span className="w-1 h-1 rounded-full bg-accent-primary/50 mt-2 shrink-0"></span>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>
               
               <div className="bg-surfaceHighlight/30 p-5 rounded-xl border border-border/50">
                  <h4 className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
                     <XCircle size={16} className="text-textMuted" />
                     Who this is NOT for
                  </h4>
                  <ul className="space-y-3">
                     {[
                        'Complete beginners to web dev',
                        'Users looking for "No-code" tools',
                        'Those needing a finished product',
                     ].map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-textMuted">
                           <span className="w-1 h-1 rounded-full bg-textMuted/40 mt-2 shrink-0"></span>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {isPreviewActive && (
              <div className="mt-4 p-4 rounded-lg bg-green-500/5 border border-green-500/10 flex items-start gap-3 animate-fade-in">
                 <div className="p-1.5 bg-green-500/10 rounded-full text-green-400 mt-0.5">
                   <Lock size={14} />
                 </div>
                 <div>
                   <h4 className="text-green-400 font-bold text-sm">You are viewing the Live Demo</h4>
                   <p className="text-green-400/60 text-xs mt-1">
                     The codebase you purchase is identical to this deployment. All data is sandboxed.
                   </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: The "Spec Sheet" Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          
          {/* Main "Purchase" Card */}
          <div className="p-6 rounded-xl bg-surface border border-border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[50px] rounded-full pointer-events-none" />
            
            <h3 className="text-xs font-bold text-textMuted mb-4 uppercase tracking-widest font-mono">Technical Manifest</h3>
            
            {/* Feature 2: Time to First Value */}
            <div className="mb-6 flex items-center gap-2 text-xs font-medium text-textMain bg-surfaceHighlight border border-border px-3 py-2 rounded-lg">
               <Zap size={14} className="text-accent-secondary" />
               <span>Avg. setup time: 15-30 mins</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {listing.techStack.map(tech => (
                <span key={tech} className="px-3 py-1.5 rounded-md border border-border bg-surfaceHighlight text-sm text-textMain hover:border-borderHover transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest font-mono mb-2">Deliverables</h3>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-textMuted text-sm group">
                  <GitBranch size={16} className="text-accent-primary mt-0.5 group-hover:text-textMain transition-colors" /> 
                  <span className="group-hover:text-textMain transition-colors">Private Github Repo Access</span>
                </li>
                <li className="flex items-start gap-3 text-textMuted text-sm group">
                  <ShieldCheck size={16} className="text-accent-primary mt-0.5 group-hover:text-textMain transition-colors" /> 
                  <span className="group-hover:text-textMain transition-colors">Pre-configured Auth & DB</span>
                </li>
                <li className="flex items-start gap-3 text-textMuted text-sm group">
                  <Globe size={16} className="text-accent-primary mt-0.5 group-hover:text-textMain transition-colors" /> 
                  <span className="group-hover:text-textMain transition-colors">One-click Deployment</span>
                </li>
                 <li className="flex items-start gap-3 text-textMuted text-sm group">
                  <FileText size={16} className="text-accent-primary mt-0.5 group-hover:text-textMain transition-colors" /> 
                  <span className="group-hover:text-textMain transition-colors">Unlimited Commercial Use</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
                 <Button className="w-full h-12 text-base font-semibold shadow-[0_0_20px_-5px_rgba(209,242,94,0.3)]">
                    Get Full Access • ${listing.price}
                 </Button>
                 
                 {/* Feature 6: Ask Before Purchase */}
                 <button className="w-full mt-3 text-xs text-textMuted hover:text-textMain transition-colors flex items-center justify-center gap-1.5 py-1">
                    <HelpCircle size={12} />
                    Still unsure? Ask a quick question.
                 </button>

                 {/* Feature 1 & 7: Assurance Box */}
                 <div className="mt-6 p-3 rounded-lg bg-surfaceHighlight border border-border">
                    <ul className="space-y-2">
                       <li className="flex items-center gap-2 text-[11px] text-textMuted">
                          <PackageCheck size={12} className="text-textMain shrink-0" />
                          <span>Instant access after payment</span>
                       </li>
                       <li className="flex items-center gap-2 text-[11px] text-textMuted">
                          <FileCode size={12} className="text-textMain shrink-0" />
                          <span>Full source code included</span>
                       </li>
                       <li className="flex items-center gap-2 text-[11px] text-textMuted">
                          <ShieldCheck size={12} className="text-textMain shrink-0" />
                          <span>No lock-in or subscription</span>
                       </li>
                    </ul>
                 </div>

                 <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                    <Lock size={12} className="text-textMuted" />
                    <p className="text-[10px] text-textMuted uppercase tracking-wider">Secure Encrypted Checkout</p>
                 </div>
            </div>
          </div>

          {/* Creator Profile */}
          <div className="p-6 rounded-xl bg-surface border border-border flex items-center gap-4">
            <img src={listing.creator.avatar} alt={listing.creator.name} className="w-12 h-12 rounded-full border border-border" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-textMain text-sm">{listing.creator.name}</span>
                {/* Verified -> Blue (Tertiary) */}
                {listing.creator.verified && <ShieldCheck size={14} className="text-accent-tertiary" />}
              </div>
              <p className="text-xs text-textMuted mt-0.5">Verified Merchant</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">Profile</Button>
          </div>
          
          <div className="text-center">
             <p className="text-xs text-textMuted leading-relaxed max-w-[250px] mx-auto">
               Code is manually audited for security and performance before listing.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Details;