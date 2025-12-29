import React from 'react';

const BenefitGrid = () => {
    return (
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tighter">
                    Don't start from zero.
                </h2>
                <p className="text-textMuted text-lg font-light leading-relaxed">
                    Most "boilerplates" are just thin wrappers. SprintSaaS is a complete commercial architecture.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. Stop Reinventing Auth */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: Realistic Login UI */}
                        <div className="w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-border p-5 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="w-8 h-8 rounded mb-4 bg-accent-primary flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white/90"></div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] text-textMuted mb-1 font-medium">Email</div>
                                    <div className="h-7 w-full bg-surfaceHighlight border border-border rounded px-2 flex items-center text-[10px] text-textMain">
                                        user@example.com
                                    </div>
                                </div>
                                <div className="h-7 w-full bg-black dark:bg-white text-white dark:text-black rounded font-medium text-[10px] flex items-center justify-center">
                                    Sign In
                                </div>
                            </div>
                            {/* Success Overlay */}
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-full px-2 py-0.5 transform scale-90">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-[8px] font-bold text-green-700 dark:text-green-300">Auth Ready</span>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Stop Reinventing Auth</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Why spend 2 weeks on login? We include Magic Links, OAuth, and Password Reset. Fully styled.
                    </p>
                </div>

                {/* 2. Day 1 Revenue */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: Subscription/Invoice UI */}
                        <div className="w-56 flex flex-col gap-2 transform group-hover:-translate-y-1 transition-transform duration-500">
                            {/* Card 1: Active Subscription */}
                            <div className="bg-white dark:bg-zinc-900 border border-border rounded-lg p-3 shadow-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">P</div>
                                    <div>
                                        <div className="text-xs font-bold text-textMain">Pro Plan</div>
                                        <div className="text-[10px] text-textMuted">Monthly</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-textMain">$29.00</div>
                                    <div className="text-[9px] text-green-600 font-medium">Active</div>
                                </div>
                            </div>

                            {/* Card 2: Invoice (Behind) */}
                            <div className="bg-surfaceHighlight border border-border rounded-lg p-3 shadow-sm flex items-center justify-between opacity-60 scale-95 mx-2">
                                <div className="flex gap-2">
                                    <div className="h-2 w-12 bg-gray-300 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Day 1 Revenue</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Stripe is pre-integrated. Checkouts, customer portals, and webhooks are handled. Just add keys.
                    </p>
                </div>

                {/* 3. Not a Spaghetti Mess */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: IDE/Code Window */}
                        <div className="w-56 bg-[#1e1e1e] rounded-lg shadow-xl overflow-hidden border border-gray-800 font-mono text-[10px] transform group-hover:scale-105 transition-transform duration-500">
                            <div className="bg-[#2d2d2d] px-3 py-1.5 flex gap-1.5 items-center border-b border-gray-700">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                <div className="text-gray-500 ml-2">App.tsx</div>
                            </div>
                            <div className="p-3 text-gray-300 leading-tight">
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">1</span>
                                    <span><span className="text-[#c586c0]">export</span> <span className="text-[#569cd6]">const</span> App = () ={'>'} {'{'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">2</span>
                                    <span className="pl-2"><span className="text-[#569cd6]">return</span> (</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">3</span>
                                    <span className="pl-4 text-[#ce9178]">&lt;AuthProvider&gt;</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">4</span>
                                    <span className="pl-6 text-[#ce9178]">&lt;Component /&gt;</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">5</span>
                                    <span className="pl-4 text-[#ce9178]">&lt;/AuthProvider&gt;</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">6</span>
                                    <span>);</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-600 select-none">7</span>
                                    <span>{'}'};</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Not a Spaghetti Mess</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Strictly typed TypeScript. Modular folder structure. Designed to scale, not just to demo.
                    </p>
                </div>

                {/* 4. Ghost-town Prevention */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: Search Result Card */}
                        <div className="w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-border p-4 transform group-hover:-translate-y-1 transition-transform duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full bg-accent-primary/20 flex items-center justify-center">
                                    <div className="w-3 h-3 text-accent-primary font-serif font-bold flex items-center justify-center pt-0.5">S</div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-[10px] text-textMain font-medium leading-none">SprintSaaS</div>
                                    <div className="text-[9px] text-textMuted">https://sprintsaas.com</div>
                                </div>
                            </div>
                            <div className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] font-medium leading-tight mb-1 hover:underline cursor-pointer">
                                Launch your SaaS in days, not months
                            </div>
                            <div className="text-[10px] text-textMuted leading-snug">
                                The world's most complete Next.js starter kit. Includes auth, payments, database...
                            </div>
                            {/* Badge */}
                            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-green-200">
                                SEO: 100
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Ghost-town Prevention</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Meta tags, OpenGraph, sitemap.xml, and JSON-LD structured data are automatically generated.
                    </p>
                </div>

                {/* 5. Database Nightmares? Gone. */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: Database Table UI */}
                        <div className="w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-border overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
                            {/* Toolbar */}
                            <div className="bg-surfaceHighlight border-b border-border p-2 flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-zinc-600"></div>
                                <div className="h-2 w-12 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
                            </div>
                            {/* Header */}
                            <div className="flex bg-surfaceHighlight/50 border-b border-border text-[9px] font-bold text-textMuted py-2 px-3">
                                <div className="w-8">id</div>
                                <div className="w-20">email</div>
                                <div className="flex-1">role</div>
                            </div>
                            {/* Rows */}
                            <div className="text-[9px] text-textMain py-2 px-3 border-b border-border/50 flex items-center">
                                <div className="w-8 font-mono opacity-50">1</div>
                                <div className="w-20 truncate">alex@fm.com</div>
                                <div className="flex-1"><span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold">admin</span></div>
                            </div>
                            <div className="text-[9px] text-textMain py-2 px-3 border-b border-border/50 flex items-center">
                                <div className="w-8 font-mono opacity-50">2</div>
                                <div className="w-20 truncate">sam@ui.com</div>
                                <div className="flex-1"><span className="bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold">user</span></div>
                            </div>
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-1 text-center text-[9px] text-blue-600 font-medium">
                                + RLS Policies Secured
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Database Nightmares? Gone.</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Supabase schema included. Row Level Security (RLS) policies pre-written to protect your user data.
                    </p>
                </div>

                {/* 6. Scale without Rewrite */}
                <div className="group bg-surface border border-border rounded-3xl p-8 hover:border-borderHover hover:shadow-lg transition-all duration-300">
                    <div className="h-52 mb-8 bg-surfaceHighlight/30 rounded-2xl border border-border/50 relative overflow-hidden flex items-center justify-center group-hover:bg-surfaceHighlight/50 transition-colors">
                        {/* Illustration: Metric Card */}
                        <div className="w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-border p-4 transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-[10px] font-medium text-textMuted uppercase tracking-wider">Requests / sec</div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="text-2xl font-bold text-textMain mb-2 font-mono">14,205</div>

                            {/* Fake Sparkline */}
                            <div className="flex items-end gap-[2px] h-8 w-full opacity-80">
                                {[40, 60, 45, 70, 65, 80, 75, 90, 85, 95, 100, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-accent-primary rounded-t-[1px]" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.05) }}></div>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-2 border-t border-border pt-2">
                                <div className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">p99: 12ms</div>
                                <div className="text-[8px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">0 errors</div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-3">Scale without Rewrite</h3>
                    <p className="text-textMuted text-sm leading-relaxed">
                        Start with a simplified monolith, but formatted to split into microservices easily when you hit scale.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default BenefitGrid;
