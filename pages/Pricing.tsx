import React from 'react';
import { Check, ShieldCheck, Zap, Users } from 'lucide-react';
import Button from '../components/Button';

const Pricing: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-slide-up min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        {/* Info Pill -> Blue (Tertiary) */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-accent-tertiary/30 text-accent-tertiary text-sm font-medium bg-accent-tertiary/5 mb-6">
          Pricing Plans
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tight">
          Stop reinventing the wheel.
        </h1>
        <p className="text-textMuted text-lg leading-relaxed">
          Access <span className="text-textMain font-medium">$50,000+</span> worth of production-ready architecture for the price of a lunch.
          <br className="hidden md:block" /> Ship your next idea this weekend, not next month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
        {/* Explorer Plan (Free) */}
        <div className="p-8 rounded-2xl bg-surface border border-border hover:border-borderHover transition-colors shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 rounded bg-surfaceHighlight text-textMuted">
               <Zap size={18} />
             </div>
             <h3 className="text-lg font-bold text-textMain">Explorer</h3>
          </div>
          <p className="text-textMuted text-sm mb-6 min-h-[40px]">
            For evaluating code quality and browsing the full catalog.
          </p>
          <div className="mb-8">
             <span className="text-4xl font-display font-bold text-textMain">$0</span>
             <span className="text-textMuted font-medium">/forever</span>
          </div>
          <Button variant="outline" className="w-full mb-6">Create Free Account</Button>
          <p className="text-xs text-center text-textMuted mb-6">No credit card required</p>
          
          <div className="space-y-4 pt-6 border-t border-border">
             <p className="text-xs font-bold text-textMain uppercase tracking-wider">Includes</p>
             <ul className="space-y-3">
               {[
                 'Browse full catalog (50+ kits)', 
                 'Inspect live production demos', 
                 'Access open-source kits', 
                 'Join community Discord'
               ].map(feature => (
                 <li key={feature} className="flex items-start gap-3 text-sm text-textMuted">
                   <Check size={16} className="text-textMain/40 mt-0.5 shrink-0" /> {feature}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Pro Plan (Hero) */}
        <div className="relative p-8 rounded-2xl bg-surface dark:bg-[#0F0F12] border border-accent-primary/50 dark:border-accent-primary/20 ring-1 ring-accent-primary/20 dark:ring-0 shadow-premium transform md:-translate-y-4 z-10 flex flex-col">
          {/* Recommended Badge -> Orange (Emphasis) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-secondary text-accentFg-secondary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
            Recommended for Founders
          </div>
          
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 rounded bg-accent-primary text-accentFg-primary">
               <ShieldCheck size={18} />
             </div>
             <h3 className="text-lg font-bold text-textMain dark:text-white">All-Access Pro</h3>
          </div>
          
          <p className="text-textMuted text-sm mb-6 min-h-[40px]">
            Ship unlimited projects. One subscription, access to <strong>everything</strong>.
          </p>
          
          <div className="mb-8">
             <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-textMain dark:text-white">$29</span>
                <span className="text-textMuted font-medium">/month</span>
             </div>
             {/* Text Green */}
             <p className="text-xs text-accent-primary mt-2 font-medium">Billed monthly. Cancel anytime.</p>
          </div>
          
          <Button variant="primary" className="w-full mb-4 shadow-lg h-12 text-base">Get Full Access</Button>
          <p className="text-xs text-center text-textMuted mb-8 flex items-center justify-center gap-1">
            <ShieldCheck size={12} /> 7-day money-back guarantee
          </p>
          
          <div className="space-y-4 pt-6 border-t border-border dark:border-white/10">
             <p className="text-xs font-bold text-textMain dark:text-white uppercase tracking-wider flex justify-between">
                <span>Everything in Explorer, plus:</span>
             </p>
             <ul className="space-y-3">
               {[
                 'Unlimited downloads (All 50+ Kits)', 
                 'Commercial usage license', 
                 'Private Github Repo access', 
                 'Priority creator support',
                 'New kits added monthly'
               ].map(feature => (
                 <li key={feature} className="flex items-start gap-3 text-sm text-textMain dark:text-white font-medium">
                   <Check size={16} className="text-accent-primary mt-0.5 shrink-0" /> {feature}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        {/* Agency Plan */}
        <div className="p-8 rounded-2xl bg-surface border border-border hover:border-borderHover transition-colors shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 rounded bg-surfaceHighlight text-textMuted">
               <Users size={18} />
             </div>
             <h3 className="text-lg font-bold text-textMain">Agency Partner</h3>
          </div>
          <p className="text-textMuted text-sm mb-6 min-h-[40px]">
            Scale your client operations with white-label rights and team seats.
          </p>
          <div className="mb-8">
             <span className="text-4xl font-display font-bold text-textMain">$99</span>
             <span className="text-textMuted font-medium">/month</span>
          </div>
          <Button variant="outline" className="w-full mb-6">Contact Sales</Button>
          <p className="text-xs text-center text-textMuted mb-6">Invoice billing available</p>
          
          <div className="space-y-4 pt-6 border-t border-border">
             <p className="text-xs font-bold text-textMain uppercase tracking-wider">Everything in Pro, plus:</p>
             <ul className="space-y-3">
               {[
                 '5 Team member seats', 
                 'White-label client rights', 
                 'Dedicated account manager', 
                 'Custom feature requests',
                 'SLA & Contract billing'
               ].map(feature => (
                 <li key={feature} className="flex items-start gap-3 text-sm text-textMuted">
                   <Check size={16} className="text-textMain/40 mt-0.5 shrink-0" /> {feature}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
      
      {/* Trust Footer */}
      <div className="mt-20 pt-10 border-t border-border text-center">
         <p className="text-textMuted text-sm mb-4">Trusted by engineering teams at</p>
         <div className="flex justify-center gap-8 opacity-40 grayscale mix-blend-multiply dark:mix-blend-screen">
             <span className="font-display font-bold text-lg text-textMain">ACME Corp</span>
             <span className="font-display font-bold text-lg text-textMain">HyperGrowth</span>
             <span className="font-display font-bold text-lg text-textMain">NextGen</span>
             <span className="font-display font-bold text-lg text-textMain">Stark Ind</span>
         </div>
      </div>
    </div>
  );
};

export default Pricing;