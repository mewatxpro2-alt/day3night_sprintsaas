import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, ArrowRight, Store, CreditCard, Lock, Share2, LayoutDashboard, BadgeCheck, Minus } from 'lucide-react';
import Button from '../components/Button';

import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('seller');

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-slide-up min-h-screen">

      {/* --- HERO SECTION --- */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surfaceHighlight text-textMuted text-xs font-mono mb-4 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></span>
          Fair Marketplace Model
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-4 tracking-tighter leading-[1.1]">
          Buy Once. Own the Asset.
        </h1>

        <p className="text-lg text-textSecondary leading-relaxed max-w-2xl mx-auto font-light mb-6">
          Transparent pricing for builders buying and selling real SaaS blueprints.
          <br className="hidden md:block" />
          <span className="text-textMain font-medium">No subscriptions. No lock-in. No surprises.</span>
        </p>

        <div className="w-1/3 max-w-[150px] mx-auto opacity-50">

        </div>
      </div>

      {/* --- PRICING SPLIT SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">

        {/* 1. BUYER PRICING (Minimalist) */}
        <div className="p-8 md:p-10 rounded-3xl bg-surface border border-border hover:border-borderHover transition-all duration-300 relative group">
          <div className="absolute top-0 right-0 p-32 bg-accent-tertiary/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />

          {/* New Badge */}
          <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-surfaceHighlight border border-border text-[11px] font-bold uppercase tracking-wider text-textMuted">
            No Fees
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-surfaceHighlight flex items-center justify-center text-textMain border border-border">
              <CreditCard size={20} />
            </div>
            <h2 className="text-2xl font-bold text-textMain font-display">Asset Licensing</h2>
          </div>

          <p className="text-textSecondary text-lg leading-relaxed mb-8">
            Each SaaS kit is priced independently by the creator. You pay one standardized fee for lifetime access.
          </p>

          <div className="space-y-4 mb-10">
            {[
              { text: "One-time payment per asset", icon: Zap },
              { text: "Lifetime scheduled updates", icon: Check },
              { text: "Full commercial license", icon: ShieldCheck },
              // Bolded logic handled below via separate map or inline condition, 
              // but purely string map here makes bolding hard.
              // Let's refactor to allow bolding.
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-textMain">
                <div className="p-1 rounded-full bg-surfaceHighlight text-textMuted">
                  <item.icon size={14} />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
            {/* Explicitly add the bold item outside map for easy styling */}
            <div className="flex items-center gap-3 text-textMain">
              <div className="p-1 rounded-full bg-surfaceHighlight text-textMuted">
                <Minus size={14} />
              </div>
              <span className="font-bold text-textMain">0% Platform fees for buyers</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-surfaceHighlight/50 border border-border mb-8 text-center">
            <p className="text-sm text-textMuted uppercase tracking-wider font-semibold mb-1">Typical License Cost</p>
            <p className="text-4xl font-bold text-textMain">$49 <span className="text-lg text-textMuted font-normal">to</span> $199</p>
          </div>

          <Button
            variant="outline"
            className="w-full h-14 text-lg border-border hover:bg-surfaceHighlight"
            onClick={() => navigate('/mvp-kits')}
          >
            Browse Blueprints
          </Button>
        </div>


        {/* 2. SELLER PRICING (Highlighted) */}
        <div className="p-8 md:p-10 rounded-3xl bg-surface border border-accent-primary/30 ring-1 ring-accent-primary/20 hover:shadow-premium transition-all duration-300 relative overflow-hidden group">
          {/* Highlight Effect */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary opacity-80" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
                <Store size={20} />
              </div>
              <h2 className="text-2xl font-bold text-textMain font-display">Partner Models</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold uppercase tracking-wide border border-accent-primary/20">
              Partner Model
            </span>
          </div>

          <p className="text-textSecondary text-lg leading-relaxed mb-8 relative z-10">
            We only profit when you sell. No setup fees. No monthly costs. Just a clear commission on successful sales.
          </p>

          <div className="mb-10 relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-textMain tracking-tight">10-15%</span>
              <span className="text-xl text-textMuted font-medium">commission</span>
            </div>
            <p className="text-sm text-textMuted">Platform fee per guaranteed sale.</p>
          </div>

          <div className="space-y-4 mb-10 relative z-10">
            {[
              { text: "Secure payment processing (Razorpay)", icon: Lock },
              { text: "Automated asset delivery", icon: Share2 },
              { text: "Code audit & verification", icon: BadgeCheck },
              { text: "Seller dashboard & analytics", icon: LayoutDashboard },
              { text: "Dispute resolution & support", icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-textMain">
                <div className="p-1 rounded-full bg-accent-primary/10 text-accent-primary">
                  <item.icon size={14} />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            className="w-full h-14 text-lg shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate('/submit')}
          >
            Start Selling
          </Button>
          <p className="text-xs text-center text-textMuted mt-4">
            Approval required. We review every submission.
          </p>
        </div>

      </div>

      {/* --- OPTIONAL PLANS (Subtle) --- */}
      <div className="max-w-3xl mx-auto mt-24 text-center opacity-60 hover:opacity-100 transition-opacity duration-500">
        <div className="inline-block px-3 py-1 rounded-md bg-surface border border-border text-[10px] font-mono text-textMuted uppercase mb-4">
          Coming Q4 2025
        </div>
        <h3 className="text-xl font-bold text-textMain mb-2">Seller Pro (Optional)</h3>
        <p className="text-textMuted text-sm">
          Advanced analytics, lower commissions, and featured spots for power sellers. <br />
          Completely optional. Standard selling will always be free.
        </p>
      </div>

      {/* --- TRUST FOOTER --- */}
      <div className="mt-24 pt-12 border-t border-border/50 max-w-4xl mx-auto text-center">
        <p className="text-xl md:text-2xl font-display font-medium text-textMain mb-6">
          "This marketplace exists to turn real, tested SaaS projects into <br className="hidden md:block" /> reusable assets — not to trap users in subscriptions."
        </p>
        <div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder for Trust Logos if needed, strictly utilizing Lucide icons for now to keep it code-only */}
          <ShieldCheck size={32} />
          <BadgeCheck size={32} />
          <Zap size={32} />
        </div>
      </div>

    </div>
  );
};

export default Pricing;