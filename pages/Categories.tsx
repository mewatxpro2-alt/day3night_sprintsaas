import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Zap, Building2, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

import Button from '../components/Button';
import { useCategories } from '../hooks/useCategories';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading, error } = useCategories();

  // EXPERT SEO & COPY: Focus on BUSINESS OUTCOME, not just tech category.
  const categoryOverrides: Record<string, { desc: string; cta: string, altTitle?: string }> = {
    "SaaS": {
      desc: "Multi-tenant B2B architectures with billing, auth, and team management.",
      cta: "View B2B Platforms",
      altTitle: "B2B SaaS"
    },
    "E-commerce": {
      desc: "High-volume storefronts with inventory, cart logic, and payment processing.",
      cta: "View Marketplaces",
      altTitle: "E-commerce"
    },
    "Portfolio": {
      desc: "Agency-grade personal branding sites designed to capture high-ticket leads.",
      cta: "View Lead Gen Sites",
      altTitle: "Lead Gen & Brand"
    },
    "Agency": {
      desc: "Complete operating systems for service businesses. Client portals & invoicing.",
      cta: "View Agency OS",
      altTitle: "Agency Systems"
    },
    "Micro-SaaS": {
      desc: "Single-purpose tools for niche dominance and rapid weekend launches.",
      cta: "View Micro-SaaS",
      altTitle: "Micro Tools"
    },
    "Landing Page": {
      desc: "High-performance marketing pages optimized for SEO and conversion.",
      cta: "View Funnels",
      altTitle: "Marketing Funnels"
    }
  };

  if (isLoading) {
    return (
      <div className="pt-36 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
          <p className="text-textMuted text-sm">Loading profit models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-36 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error loading data. <button onClick={() => window.location.reload()} className="underline">Refresh</button></p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header - Serious, Trust-Focused */}
      <div className="mb-20 animate-slide-up">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tight">
            Choose Your Revenue Model.
          </h1>



          <p className="text-textSecondary text-xl font-light leading-relaxed max-w-2xl">
            Don't build from scratch. Acquire <strong className="font-medium text-textMain">audited, revenue-ready source code</strong> and start selling in days, not months.
          </p>
        </div>
      </div>

      {/* Categories Grid - Simplified, Business-First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {categories.map((cat, i) => {
          const override = categoryOverrides[cat.title as string];
          const displayTitle = override?.altTitle || cat.title;
          const displayDesc = override?.desc || cat.description;
          const displayCta = override?.cta || `Browse ${cat.title}`;

          return (
            <div
              key={cat.id}
              className="group relative rounded-xl bg-surface border border-border transition-all duration-300 flex flex-col cursor-pointer overflow-hidden hover:bg-accent-primary/5 hover:border-accent-primary/20"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate('/mvp-kits')}
            >
              {/* Simplified Header */}
              <div className="p-6 pb-2 flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-surfaceHighlight border border-border flex items-center justify-center text-textMuted group-hover:bg-white group-hover:text-accent-primary transition-colors duration-300">
                  {/* Dynamic Icon placeholder or generic */}
                  <Zap size={18} />
                </div>
                {/* Count Badge - Subtle */}
                <span className="text-[10px] font-mono font-medium text-textMuted/60 bg-surfaceHighlight px-2 py-1 rounded-md border border-border group-hover:border-accent-primary/10 transition-colors">
                  {cat.listing_count} ASSETS
                </span>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-textMain mb-3 group-hover:text-accent-primary transition-colors">
                  {displayTitle}
                </h2>

                <p className="text-textMuted text-sm leading-relaxed mb-8 flex-1 opacity-90">
                  {displayDesc}
                </p>

                {/* Action - Minimal */}
                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-textMain group-hover:text-accent-primary transition-colors">
                  {displayCta}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;