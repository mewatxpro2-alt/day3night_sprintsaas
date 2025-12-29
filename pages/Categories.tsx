import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Layers, Globe, Briefcase, Cpu, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useCategories } from '../hooks/useCategories';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading, error } = useCategories();

  const categoryConfig: Record<string, { desc: string; cta: string, altTitle?: string, icon: any, gradient: string }> = {
    "SaaS": {
      desc: "Multi-tenant B2B architectures with billing, auth, and team management pre-configured.",
      cta: "Explore B2B Kits",
      altTitle: "B2B SaaS",
      icon: Layers,
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    "E-commerce": {
      desc: "High-volume marketplaces with robust inventory, cart logic, and payment processing.",
      cta: "View Marketplaces",
      altTitle: "E-Commerce",
      icon: Globe,
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    "Portfolio": {
      desc: "Agency-grade personal branding sites designed to capture high-ticket leads.",
      cta: "View Portfolios",
      altTitle: "Lead Gen & Brand",
      icon: Briefcase,
      gradient: "from-orange-500/20 to-amber-500/20"
    },
    "Agency": {
      desc: "Complete operating systems for service businesses. Client portals, invoicing, and CRM.",
      cta: "View Agency OS",
      altTitle: "Agency Systems",
      icon: Zap,
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    "Micro-SaaS": {
      desc: "Sniper-focused tools for niche dominance. Built for rapid weekend launches.",
      cta: "View Micro Tools",
      altTitle: "Micro-SaaS",
      icon: MousePointer2,
      gradient: "from-cyan-500/20 to-blue-500/20"
    },
    "Landing Page": {
      desc: "High-performance marketing funnels optimized for maximum SEO and conversion.",
      cta: "View Funnels",
      altTitle: "Marketing Engines",
      icon: Cpu,
      gradient: "from-rose-500/20 to-red-500/20"
    }
  };

  if (isLoading) {
    return (
      <div className="pt-36 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
          <p className="text-textMuted font-mono text-xs uppercase tracking-widest">Loading Models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-36 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
        <p className="text-red-400">Unable to load revenue models. <button onClick={() => window.location.reload()} className="underline hover:text-red-300">Retry</button></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-32 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-accent-primary/5 blur-[120px] rounded-full pointer-events-none opacity-40" />

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-mono text-accent-primary uppercase tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            Verified Source Code
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter"
          >
            Choose Your <br className="hidden md:block" /> Revenue Model.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-textMuted font-light max-w-2xl mx-auto leading-relaxed"
          >
            Don't start from zero. Acquire <span className="text-textMain font-medium border-b border-accent-primary/30">audited, production-ready</span> architectures and deploy your product this weekend.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const config = categoryConfig[cat.title as string] || {
              desc: cat.description,
              cta: `View ${cat.title}`,
              altTitle: cat.title,
              icon: Zap,
              gradient: "from-zinc-500/20 to-zinc-500/20"
            };

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.1) }}
                onClick={() => navigate('/mvp-kits')}
                className="group relative h-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-3xl p-8 cursor-pointer overflow-hidden transition-all duration-500"
              >
                {/* Hover Gradient Blob */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${config.gradient} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon & Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-textMuted group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-lg">
                      <config.icon size={22} strokeWidth={1.5} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono font-medium text-textMuted/60 group-hover:text-textMain group-hover:border-white/10 transition-colors">
                      {cat.listing_count} ASSETS
                    </span>
                  </div>

                  {/* Text */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-textMain mb-3 group-hover:text-white transition-colors tracking-tight">
                      {config.altTitle}
                    </h3>
                    <p className="text-textMuted text-sm leading-relaxed font-normal opacity-80 group-hover:opacity-100 transition-opacity">
                      {config.desc}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex items-center gap-3 text-sm font-semibold text-textMuted group-hover:text-accent-primary transition-colors">
                    <span>{config.cta}</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Categories;