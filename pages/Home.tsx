import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Zap, Github, Chrome, Figma, Framer, Codepen, Gitlab, Command, Box, Cpu, Search, Filter, ShieldCheck, Terminal, FileCode, GitMerge, Lock, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import FeaturedCard from '../components/FeaturedCard';

import { useFeaturedListings, useListings } from '../hooks/useListings';
import { useCategories } from '../hooks/useCategories';

// --- Animation Components ---

const KineticFlip = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const height = "1.1em";

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= words.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="inline-grid overflow-hidden align-bottom" style={{ height: height, lineHeight: height }}>
      <div
        className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateY(-${index * 100}%)` }}
      >
        {words.map((w, i) => (
          <div key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-textMain via-textMain to-textMuted whitespace-nowrap h-full">
            {w}
          </div>
        ))}
      </div>
    </div>
  );
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '50px' });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Internal Components ---

const BorderBeamButton = () => {
  return (
    <button className="group relative rounded-full p-[1px] overflow-hidden bg-transparent transition-transform active:scale-[0.98]">
      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(var(--text-primary)/0.2)_50%,rgb(var(--accent-primary))_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative h-full w-full bg-surface rounded-full px-8 py-3 flex items-center gap-2 border border-border group-hover:bg-surfaceHighlight transition-colors z-10 shadow-sm">
        <span className="text-xs font-bold tracking-widest uppercase text-textMain">View Live Demos</span>
        <ArrowRight size={16} className="text-textMain group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </button>
  );
};

const LogoMarquee = () => {
  const logos = [
    { Icon: Github, name: "Github" },
    { Icon: Chrome, name: "Chrome" },
    { Icon: Figma, name: "Figma" },
    { Icon: Framer, name: "Framer" },
    { Icon: Codepen, name: "Codepen" },
    { Icon: Gitlab, name: "Gitlab" },
    { Icon: Command, name: "Command" },
    { Icon: Box, name: "Sandbox" },
    { Icon: Cpu, name: "Vercel" },
  ];

  return (
    <div className="w-full py-16 border-y border-border bg-background relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex overflow-hidden">
        <div className="flex animate-marquee min-w-full shrink-0 items-center gap-24 pr-24">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center gap-3 text-textMuted group-hover:text-textMain transition-colors opacity-80 hover:scale-105 duration-500">
              <logo.Icon size={28} strokeWidth={1.5} />
            </div>
          ))}
        </div>
        <div className="flex animate-marquee min-w-full shrink-0 items-center gap-24 pr-24" aria-hidden="true">
          {logos.map((logo, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-3 text-textMuted group-hover:text-textMain transition-colors opacity-80 hover:scale-105 duration-500">
              <logo.Icon size={28} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Handpicked Section Component ---

const HandpickedSection = () => {
  const navigate = useNavigate();
  const { listings: featured, isLoading: isFeaturedLoading, error } = useFeaturedListings(3);
  const [activeTab, setActiveTab] = useState('All');
  const { listings, isLoading } = useListings({ limit: 6 });
  const { categories } = useCategories();

  // Build category tabs with real counts
  const categoryTabs = [
    { label: 'All', count: null },
    ...categories.slice(0, 6).map(cat => ({
      label: cat.title === 'SaaS' ? 'SaaS Kits' : cat.title,
      count: cat.listing_count
    }))
  ];

  return (
    <section className="py-24 px-6 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-secondary/20 bg-accent-secondary/5 text-accent-secondary text-[11px] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse"></span>
            Curated Drops
          </span>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-1 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-textMain tracking-tighter">
              Launch this weekend.
            </h2>

          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-textMuted hover:text-textMain hover:border-borderHover transition-all bg-surface text-[13px] font-medium">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-textMuted hover:text-textMain hover:border-borderHover transition-all bg-surface text-[13px] font-medium">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {categoryTabs.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(cat.label)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${activeTab === cat.label
                ? 'bg-textMain text-background border border-textMain shadow-lg'
                : 'bg-transparent text-textMuted hover:text-textMain border border-transparent hover:bg-surfaceHighlight'
                }`}
            >
              {cat.label}
              {cat.count && <span className={`text-[10px] ${activeTab === cat.label ? 'opacity-60' : 'opacity-40'}`}>{cat.count}</span>}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featured.map((listing, i) => (
            <Reveal key={listing.id} delay={i * 100} className="h-full">
              <FeaturedCard listing={listing} onClick={(id) => navigate(`/listing/${id}`)} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={200}>
        <div className="flex justify-center mt-16">
          <Button
            variant="outline"
            onClick={() => navigate('/mvp-kits')}
            className="group h-auto py-1 pl-6 pr-1.5 rounded-full border-border bg-surface hover:bg-surfaceHighlight hover:border-accent-primary/20 text-textMain gap-3 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="text-sm font-semibold tracking-wide">Browse Blueprints</span>
            <div className="w-9 h-9 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-textMuted group-hover:bg-accent-primary group-hover:text-black group-hover:border-accent-primary transition-all duration-300 shadow-sm">
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Button>
        </div>
      </Reveal>
    </section>
  );
};

// --- Stats Board Component ---
const StatsBoard = () => {
  const { listings } = useListings({});

  // Calculate real stats from data
  const totalListings = listings.length;
  const totalViews = listings.reduce((acc, l) => acc + (l.views_count || 0), 0);
  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  const stats = [
    { value: totalListings > 0 ? `${totalListings}+` : "0", label: "Curated Blueprints", sub: "Production-ready" },
    { value: formatNumber(totalViews), label: "Monthly Founder Traffic", sub: "Project Discovery" },
    { value: "90%", label: "Developer Revenue Share", sub: "Fair Share" },
    { value: "24hr", label: "Manual Code Audit", sub: "Quality Verification" },
  ];

  return (
    <section className="py-12 px-6 max-w-[1400px] mx-auto">
      <Reveal>
        <div className="relative rounded-3xl bg-surface border border-border overflow-hidden ring-1 ring-border shadow-2xl group">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-textMain/20 to-transparent opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--text-primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--text-primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)] pointer-events-none" />
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {stats.map((stat, i) => (
              <div key={i} className="group/stat relative p-8 md:p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-surfaceHighlight/50">
                {i !== 0 && (
                  <div className="hidden lg:block absolute left-0 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                )}
                <div className="lg:hidden absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="relative transform transition-transform duration-500 group-hover/stat:-translate-y-1">
                  <div className="absolute -inset-4 bg-accent-primary/10 blur-2xl rounded-full opacity-0 dark:group-hover/stat:opacity-100 transition-opacity duration-500" />
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-accent-primary to-accent-primary-dim tracking-tight mb-3 relative z-10 drop-shadow-sm">
                    {stat.value}
                  </h3>
                </div>

                <div className="space-y-1 relative z-10">
                  <p className="text-sm font-semibold text-textMain/90">{stat.label}</p>
                  <p className="text-[11px] font-mono text-textMuted/80 uppercase tracking-widest">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};


// --- Engineering Standard Section ---
const EngineeringStandard = () => {
  return (
    <section className="py-24 px-6 border-t border-border bg-surfaceHighlight/30">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="mb-16 md:flex md:justify-between md:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tighter">
                Built for Production. Ready for Revenue.
              </h2>
              <p className="text-textMuted text-lg font-light leading-relaxed">
                These are not demos or tutorials. Every codebase is manually reviewed for real-world production readiness. If it's not ready to scale and monetize immediately, it doesn't get in.
              </p>
            </div>
            <div className="hidden md:block mt-6 md:mt-0">
              <span className="text-textMuted font-mono text-xs border border-border bg-surface px-3 py-1.5 rounded-md">
                Commercial Architecture
              </span>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FileCode,
              title: "Production-Safe by Default",
              desc: "End-to-end type safety and strict validation. We prevent runtime errors so you don't have to debug them in production."
            },
            {
              icon: Zap,
              title: "Fast at Scale — Not Just in Demos",
              desc: "Optimized for real-world traffic, not localhost. Server Components and database indexing are pre-configured for speed."
            },
            {
              icon: Lock,
              title: "Security You Don't Have to Re-Think",
              desc: "Authentication, RLS, and data protection are standard. We handle the critical security plumbing so you can focus on product."
            },
            {
              icon: GitMerge,
              title: "Easy to Extend. Hard to Break.",
              desc: "Modular architecture built for team growth. Add features without rewriting the core. Clean, maintainable, and predictable."
            }
          ].map((item, i) => (
            <Reveal key={i} delay={i * 100} className="h-full">
              <div className="group h-full p-8 rounded-2xl bg-surface border border-border hover:border-borderHover transition-colors hover:bg-surfaceHighlight relative overflow-hidden shadow-sm hover:shadow-premium">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="w-10 h-10 rounded-lg bg-surfaceHighlight ring-1 ring-border flex items-center justify-center text-textMuted mb-6 group-hover:text-textMain group-hover:scale-110 transition-all duration-300">
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="text-textMain font-bold mb-3 text-lg">{item.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed opacity-80">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


// --- Main Home Component ---

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  return (
    <main>
      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-primary/5 rounded-full blur-[160px] pointer-events-none opacity-40" />

        <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10 animate-slide-up">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surfaceHighlight border border-border text-[11px] font-mono text-textMuted mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse"></span>
            Delivered: Full Source Code & Commercial License
          </div>

          <div className="w-fit mx-auto flex flex-col items-center mb-10">
            <h1 className="text-5xl md:text-8xl font-display font-bold text-textMain tracking-tighter leading-[1] mb-2 text-center">
              Start with a finished SaaS.
            </h1>
            <div className="w-1/2 min-w-[180px] h-px bg-border/50 my-6" />
            <h1 className="text-5xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-textMain via-textMain to-textMuted tracking-tighter leading-[1] mt-2">
              Not an empty repo.
            </h1>
          </div>

          <p className="text-lg md:text-xl text-textMuted/80 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            <strong>Don't start from zero.</strong> Acquire production-ready SaaS blueprints and market-tested MVPs. Built by founders, for founders.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-5">
            <Button size="lg" onClick={() => navigate('/mvp-kits')} className="h-12 px-8 shadow-xl shadow-accent-primary/10">
              Browse Blueprints
            </Button>
            <button
              onClick={() => navigate('/submit')}
              className="group relative h-12 px-8 rounded-lg bg-surface border border-border hover:border-textMain/20 hover:bg-surfaceHighlight transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-sm font-bold text-textMain">Sell Your Code</span>
              <ArrowRight size={16} className="text-textMuted group-hover:translate-x-1 group-hover:text-textMain transition-all" />
            </button>
          </div>

          <div className="mt-16 flex justify-center items-center gap-8 text-[13px] text-textMuted font-mono opacity-70">
            <Reveal delay={400}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full bg-surface border border-border" />
                  ))}
                </div>
                <span>2,400+ Verified Buyers</span>
              </div>
            </Reveal>
            <div className="w-px h-3 bg-border" />
            <Reveal delay={500}>
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-textMain" />
                Verified Production Quality
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Handpicked Section */}
      <HandpickedSection />

      {/* Stats Board Section */}
      <StatsBoard />

      {/* Infinite Logo Marquee */}
      <LogoMarquee />

      {/* Feature Cards Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal>
          <div className="mb-16 md:text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tighter">
              Real Products. <br />Not Just Code.
            </h2>

            <p className="text-textMuted text-lg font-light leading-relaxed">
              Buy a codebase that has already been built, tested, and sometimes even launched. Skip the validation phase and start iterating.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Reveal delay={0} className="h-full">
            <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-xl dark:hover:shadow-premium">
              <div className="aspect-[4/3] w-full bg-surface rounded-xl border border-border p-5 flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors duration-500 group-hover:bg-accent-primary/5 shadow-inner ring-1 ring-inset ring-border">
                <div className="flex justify-between items-start mb-auto">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center transition-colors group-hover:bg-accent-primary/10 group-hover:border-accent-primary/20">
                    <Check size={14} className="text-textMuted transition-colors group-hover:text-accent-primary" />
                  </div>
                  <div className="flex gap-1.5 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-textMain/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-textMain/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-textMain/40" />
                  </div>
                </div>
                <div className="w-8 h-1.5 bg-textMain/10 rounded-full mb-3" />
                <div className="w-full flex-1 bg-surface rounded border border-border mb-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-textMain/5 to-transparent opacity-50" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-textMain/10 rounded-full" />
                  <div className="w-2/3 h-1.5 bg-textMain/10 rounded-full" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-textMain mb-2">Production Ready</h3>
              <p className="text-textMuted leading-relaxed text-sm opacity-80">
                Includes RBAC, Tenant isolation, and database migration scripts. Save 200+ dev hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="h-full">
            <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-xl dark:hover:shadow-premium">
              <div className="aspect-[4/3] w-full bg-surface rounded-xl border border-border p-5 flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors duration-500 group-hover:bg-accent-primary/5 shadow-inner ring-1 ring-inset ring-border">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center transition-colors group-hover:bg-accent-primary/10 group-hover:border-accent-primary/20">
                    <Terminal size={14} className="text-textMuted transition-colors group-hover:text-accent-primary" />
                  </div>
                  <div className="px-2 py-0.5 rounded text-[10px] bg-surface border border-border text-textMuted font-mono">
                    .tsx
                  </div>
                </div>
                <div className="flex-1 space-y-2 font-mono text-[10px] text-textMuted/60 p-1">
                  <div className="flex gap-2"><span className="text-textMuted group-hover:text-accent-primary transition-colors">import</span> <span>Auth</span></div>
                  <div className="flex gap-2"><span className="text-textMuted group-hover:text-accent-secondary transition-colors">const</span> <span className="text-textMain">User</span> = {'() => {'}</div>
                  <div className="pl-4 text-textMuted/50 group-hover:text-accent-primary/50 transition-colors">{'// strict types'}</div>
                  <div className="pl-4 flex gap-2"><span className="text-textMuted group-hover:text-accent-secondary transition-colors">return</span> <span className="text-textMain/30">{'<Dashboard />'}</span></div>
                  <div>{'}'}</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-textMain mb-2">Modern Stack Only</h3>
              <p className="text-textMuted leading-relaxed text-sm opacity-80">
                Next.js 14, Tailwind, and Supabase ready. No jQuery. No old deps. Strictly typed TypeScript.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200} className="h-full">
            <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-xl dark:hover:shadow-premium">
              <div className="aspect-[4/3] w-full bg-surface rounded-xl border border-border flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors duration-500 group-hover:bg-accent-primary/5 shadow-inner ring-1 ring-inset ring-border">
                <div className="h-8 border-b border-border bg-surface flex items-center px-3 gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/20 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="w-2 h-2 rounded-full bg-green-500/20 grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <div className="flex-1 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent group-hover:bg-accent-primary/5 transition-colors" />
                  <div className="w-12 h-12 rounded-full bg-surface border border-border text-textMuted flex items-center justify-center shadow-sm transform group-hover:scale-110 group-hover:bg-accent-primary group-hover:text-accentFg-primary group-hover:border-transparent group-hover:shadow-[0_0_30px_-10px_rgba(var(--accent-primary)/0.5)] transition-all duration-300">
                    <Zap size={20} fill="currentColor" />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-textMain mb-2">Test Before Buying</h3>
              <p className="text-textMuted leading-relaxed text-sm opacity-80">
                Don't guess based on screenshots. Deploy a live demo instance in 1-click.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Engineering Standard Section */}
      <EngineeringStandard />

      {/* CTA Section */}
      <section className="py-32 px-6">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center bg-surface border border-border p-12 md:p-24 rounded-[32px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6 relative z-10 tracking-tighter">
              Your Next Startup is Waiting.
            </h2>
            <p className="text-lg text-textMuted mb-10 max-w-xl mx-auto relative z-10 font-light">
              Join 15,000+ technical founders turning unused assets into revenue and new products.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <input
                type="email"
                placeholder="founder@startup.com"
                className="bg-surfaceHighlight border border-border rounded-lg px-6 py-3.5 text-textMain placeholder:text-textMuted/50 focus:outline-none focus:border-textMain/20 focus:ring-1 focus:ring-textMain/10 w-full sm:w-80 transition-all"
              />
              <Button size="lg" onClick={() => navigate('/signin')} className="h-auto py-3.5">Create Free Account</Button>
            </div>
            <p className="mt-6 text-xs text-textMuted opacity-50">Instant access to code repositories after purchase. No credit card required to explore.</p>
          </div>
        </Reveal>
      </section>
    </main>
  );
};

export default Home;