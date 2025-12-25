import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Code, Zap, Github, Chrome, Figma, Framer, Codepen, Gitlab, Command, Box, Cpu, Search, Filter, ShieldCheck, Terminal, FileCode, GitMerge, Lock } from 'lucide-react';
import Button from '../components/Button';
import FeaturedCard from '../components/FeaturedCard';
import { ViewState } from '../types';
import { MOCK_LISTINGS } from '../constants';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  onListingClick: (id: string) => void;
}

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
      {/* Moving Gradient Beam - Uses Primary (Green) */}
      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(var(--text-primary)/0.2)_50%,rgb(var(--accent-primary))_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Button Content */}
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
      {/* Alpha Masks */}
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


const HandpickedSection = ({ onListingClick, onViewMore }: { onListingClick: (id: string) => void, onViewMore: () => void }) => {
  const [activeTab, setActiveTab] = useState('All');
  
  const categories = [
    { label: 'All', count: null },
    { label: 'SaaS Kits', count: 847 },
    { label: 'Marketplaces', count: 623 },
    { label: 'Portfolios', count: 412 },
    { label: 'Agency OS', count: 298 },
    { label: 'Fintech', count: 186 },
    { label: 'Health', count: 142 },
  ];

  return (
    <section className="py-24 px-6 max-w-[1400px] mx-auto">
      {/* Header Badge: Badge Role -> Orange (Secondary) */}
      <Reveal>
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-secondary/20 bg-accent-secondary/5 text-accent-secondary text-[11px] font-mono uppercase tracking-wider">
             <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse"></span>
             Curated Drops
          </span>
        </div>
      </Reveal>

      {/* Title Row */}
      <Reveal delay={100}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-textMain tracking-tight">
            Launch this weekend.
          </h2>
          
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

      {/* Tabs */}
      <Reveal delay={200}>
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveTab(cat.label)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === cat.label 
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {MOCK_LISTINGS.slice(0, 3).map((listing, i) => (
          <Reveal key={listing.id} delay={i * 100} className="h-full">
             <FeaturedCard listing={listing} onClick={onListingClick} />
          </Reveal>
        ))}
      </div>

      {/* View More Action - Green (Primary Action) */}
      <Reveal delay={200}>
        <div className="flex justify-center">
             <Button 
                onClick={onViewMore} 
                className="h-14 px-8 rounded-full border border-border bg-surface hover:bg-surfaceHighlight hover:border-accent-primary/50 text-textMain group"
             >
                <span className="text-sm font-medium tracking-wide">More MVP Kits</span>
                <div className="ml-3 w-6 h-6 rounded-full bg-surfaceHighlight flex items-center justify-center group-hover:bg-accent-primary group-hover:text-accentFg-primary transition-colors duration-300">
                    <ArrowRight size={14} />
                </div>
            </Button>
        </div>
      </Reveal>
    </section>
  );
};

// --- New Stats Board Component ---
const StatsBoard = () => {
  const stats = [
    { value: "2,400+", label: "Curated Websites", sub: "and growing daily" },
    { value: "12K+", label: "Active Founders", sub: "shipping products" },
    { value: "$2.4M", label: "Creator Revenue", sub: "paid out in 2024" },
    { value: "48hrs", label: "Avg. Launch Time", sub: "vs 3 months typical" },
  ];

  return (
    <section className="py-12 px-6 max-w-[1400px] mx-auto">
      <Reveal>
        {/* The Card Container */}
        <div className="relative rounded-3xl bg-surface border border-border overflow-hidden ring-1 ring-border shadow-2xl group">
          
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-textMain/20 to-transparent opacity-50" />
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--text-primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--text-primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_100%)] pointer-events-none" />

          {/* Glow uses Green (Primary) */}
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {stats.map((stat, i) => (
              <div key={i} className="group/stat relative p-8 md:p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-surfaceHighlight/50">
                
                {i !== 0 && (
                  <div className="hidden lg:block absolute left-0 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                )}
                <div className="lg:hidden absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="relative transform transition-transform duration-500 group-hover/stat:-translate-y-1">
                   {/* Text Gradient uses Green (Primary) */}
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


// --- New Engineering Standard Section ---
const EngineeringStandard = () => {
  return (
    <section className="py-24 px-6 border-t border-border bg-surfaceHighlight/30">
      <div className="max-w-7xl mx-auto">
        <Reveal>
            <div className="mb-16 md:flex md:justify-between md:items-end">
               <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tight">
                    We reject 95% of submissions.
                  </h2>
                  <p className="text-textMuted text-lg font-light leading-relaxed">
                    Every codebase is manually audited against our 4-point engineering standard. If it's not production-ready, it's not here.
                  </p>
               </div>
               <div className="hidden md:block mt-6 md:mt-0">
                  <span className="text-textMuted font-mono text-xs border border-border bg-surface px-3 py-1.5 rounded-md">
                    Technical Manifest v2.4
                  </span>
               </div>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             {
               icon: FileCode,
               title: "Strict Type Safety",
               desc: "End-to-end type safety with TypeScript. Zod validation for all API inputs. No `any` types allowed."
             },
             {
               icon: Zap,
               title: "Modern Performance",
               desc: "Server Components (RSC) by default. Optimized images. Sub-100kb initial JS bundle targets."
             },
             {
               icon: Lock,
               title: "Security Hardened",
               desc: "Row Level Security (RLS) configured. HttpOnly cookies for auth. OWASP protection standards."
             },
             {
               icon: GitMerge,
               title: "Clean Abstractions",
               desc: "Modular architecture designed for extension. DRY principles. Zero spaghetti code."
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

const Home: React.FC<HomeProps> = ({ onNavigate, onListingClick }) => {
  return (
    <main>
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
         {/* Ambient Background Glow */}
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-primary/5 rounded-full blur-[160px] pointer-events-none opacity-40" />
         
         <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10 animate-slide-up">
           
             {/* Badge: Orange (Emphasis) */}
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surfaceHighlight border border-border text-[11px] font-mono text-textMuted mb-8 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse"></span>
                v2.4: Updated for Next.js 14 & Server Actions
             </div>
             
             <h1 className="text-5xl md:text-8xl font-display font-bold text-textMain tracking-tighter leading-[1] mb-8">
               Skip the first 200 hours.<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-textMain via-textMain to-textMuted">
                 Shipped in <KineticFlip words={['months.', 'weeks.', 'days.']} />
               </span>
             </h1>
             
             <p className="text-lg md:text-xl text-textMuted/80 max-w-xl mx-auto mb-10 leading-relaxed font-light">
               Stop wasting weeks on boilerplate. Acquire <strong>audited, type-safe</strong> full-stack architectures. Built for founders who value code quality.
             </p>
             
             <div className="flex flex-wrap justify-center items-center gap-5">
               <Button size="lg" onClick={() => onNavigate(ViewState.EXPLORE)} className="h-12 px-8 shadow-xl shadow-accent-primary/10">
                  Explore Architectures
               </Button>
               <BorderBeamButton />
             </div>

             <div className="mt-16 flex justify-center items-center gap-8 text-[13px] text-textMuted font-mono opacity-70">
                <Reveal delay={400}>
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full bg-surface border border-border" />
                          ))}
                       </div>
                       <span>2,400+ Active Builders</span>
                    </div>
                </Reveal>
                <div className="w-px h-3 bg-border" />
                <Reveal delay={500}>
                    <span className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-textMain" />
                      Strict Code Audit Process
                    </span>
                </Reveal>
             </div>
         </div>
      </section>

      {/* Handpicked Section */}
      <HandpickedSection onListingClick={onListingClick} onViewMore={() => onNavigate(ViewState.EXPLORE)} />

      {/* Stats Board Section */}
      <StatsBoard />

      {/* Infinite Logo Marquee */}
      <LogoMarquee />

      {/* Feature Cards Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal>
            <div className="mb-16 md:text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tight">
                    Not themes. <br/>Full-stack engines.
                </h2>
                <p className="text-textMuted text-lg font-light leading-relaxed">
                    We sell complete SaaS foundations so you can focus on business logic, not pixels.
                </p>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Reveal delay={0} className="h-full">
                <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-premium">
                    <div className="aspect-[4/3] w-full bg-surfaceHighlight rounded-xl border border-border p-5 flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors shadow-inner ring-1 ring-inset ring-border">
                        <div className="flex justify-between items-start mb-auto">
                            {/* Checkmark -> Green */}
                            <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                                <Check size={14} className="text-accent-primary" />
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
                    
                    <h3 className="text-lg font-bold text-textMain mb-2">Scalable by Default</h3>
                    <p className="text-textMuted leading-relaxed text-sm opacity-80">
                        Includes RBAC, Tenant isolation, and database migration scripts. Built to handle 10k+ users from day one.
                    </p>
                </div>
            </Reveal>

            {/* Card 2 */}
            <Reveal delay={100} className="h-full">
                <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-premium">
                    <div className="aspect-[4/3] w-full bg-surfaceHighlight rounded-xl border border-border p-5 flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors shadow-inner ring-1 ring-inset ring-border">
                        <div className="flex justify-between items-center mb-4">
                            {/* Terminal -> Blue (Tech/Info) */}
                            <div className="w-8 h-8 rounded-full bg-accent-tertiary/10 border border-accent-tertiary/20 flex items-center justify-center">
                                <Terminal size={14} className="text-accent-tertiary" />
                            </div>
                            <div className="px-2 py-0.5 rounded text-[10px] bg-surface border border-border text-textMuted font-mono">
                                .tsx
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 font-mono text-[10px] text-textMuted/60 p-1">
                            <div className="flex gap-2"><span className="text-accent-tertiary">import</span> <span>Auth</span></div>
                            <div className="flex gap-2"><span className="text-accent-secondary">const</span> <span className="text-textMain">User</span> = () ={'>'} {'{'}</div>
                            <div className="pl-4 text-accent-primary/50">{'// strict types'}</div>
                            <div className="pl-4 flex gap-2"><span className="text-accent-secondary">return</span> <span className="text-textMain/30">{'<Dashboard />'}</span></div>
                            <div>{'}'}</div>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-textMain mb-2">Zero Legacy Code</h3>
                    <p className="text-textMuted leading-relaxed text-sm opacity-80">
                        Next.js 14, Tailwind, and Supabase ready. No jQuery or unmaintained libraries. Strictly typed TypeScript.
                    </p>
                </div>
            </Reveal>

             {/* Card 3 */}
            <Reveal delay={200} className="h-full">
                <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-borderHover transition-colors hover:shadow-premium">
                    <div className="aspect-[4/3] w-full bg-surfaceHighlight rounded-xl border border-border flex flex-col relative overflow-hidden mb-6 group-hover:border-borderHover transition-colors shadow-inner ring-1 ring-inset ring-border">
                        <div className="h-8 border-b border-border bg-surface flex items-center px-3 gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                            <div className="w-2 h-2 rounded-full bg-green-500/20" />
                        </div>
                        <div className="flex-1 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-accent-primary/5" />
                             {/* Zap -> Orange (Emphasis/Power) or Green (Action)? Prompt says Orange for emphasis. Let's use Green here as it represents "Live" power */}
                             <div className="w-12 h-12 rounded-full bg-accent-primary text-accentFg-primary flex items-center justify-center shadow-[0_0_30px_-10px_rgba(var(--accent-primary)/0.5)] transform group-hover:scale-110 transition-transform">
                                <Zap size={20} fill="currentColor" />
                             </div>
                             <div className="absolute bottom-4 right-8 text-textMuted/40">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transform translate-y-2 -translate-x-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"><path d="M5.5 3.21l10.08 5.11a2 2 0 0 1 .6 3.17l-3.23 3.96 2.5 4.33c.43.75.17 1.7-.58 2.13l-1.73 1a1.53 1.53 0 0 1-2.13-.58l-2.5-4.33-2.92 3.58a2 2 0 0 1-3.5-1.42V4.5a2 2 0 0 1 3.41-1.29z"></path></svg>
                             </div>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-textMain mb-2">Interactive Sandbox</h3>
                    <p className="text-textMuted leading-relaxed text-sm opacity-80">
                        Don't guess based on screenshots. Verify the code quality and user flow in a live sandbox before you buy.
                    </p>
                </div>
            </Reveal>
        </div>
      </section>

      {/* NEW: Engineering Standard Section */}
      <EngineeringStandard />

      {/* CTA Section */}
      <section className="py-32 px-6">
        <Reveal>
            <div className="max-w-4xl mx-auto text-center bg-surface border border-border p-12 md:p-24 rounded-[32px] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none" />
              
              <h2 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6 relative z-10 tracking-tight">
                Stop reinventing auth.
              </h2>
              <p className="text-lg text-textMuted mb-10 max-w-xl mx-auto relative z-10 font-light">
                Join 15,000+ technical founders using WebCatalog Pro foundations to reach Product-Market Fit.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                 <input 
                    type="email" 
                    placeholder="founder@startup.com" 
                    className="bg-surfaceHighlight border border-border rounded-lg px-6 py-3.5 text-textMain placeholder:text-textMuted/50 focus:outline-none focus:border-textMain/20 focus:ring-1 focus:ring-textMain/10 w-full sm:w-80 transition-all"
                 />
                 <Button size="lg" onClick={() => onNavigate(ViewState.SIGN_IN)} className="h-auto py-3.5">Create Free Account</Button>
              </div>
              <p className="mt-6 text-xs text-textMuted opacity-50">Instant access to code repositories after purchase. No credit card required to explore.</p>
            </div>
        </Reveal>
      </section>
    </main>
  );
};

export default Home;