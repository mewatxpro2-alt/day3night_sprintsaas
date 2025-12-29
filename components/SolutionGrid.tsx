import React from 'react';
import { Check, Zap, CreditCard } from 'lucide-react';

const SolutionGrid = () => {
    return (
        <section className="pt-24 pb-48 px-6 max-w-[1400px] mx-auto bg-gray-50/50 dark:bg-background transition-colors duration-300">
            <div className="text-center mb-20 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 tracking-tight leading-tight">
                    Don’t start from zero. <br />
                    <span className="text-accent-primary">Start from momentum.</span>
                </h2>
                <p className="text-textMuted text-xl font-light leading-relaxed">
                    SprintSaaS gives you proven starting points — not empty templates.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Card 1: Validate Faster */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Problem Statement / Doc */}
                        <div className="w-32 h-40 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-4 transform group-hover:-translate-y-1 transition-transform duration-300 absolute bottom-[-20px]">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 rounded-full mb-3 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded"></div>
                                <div className="h-2 w-2/3 bg-slate-100 dark:bg-white/10 rounded"></div>
                                <div className="h-2 w-4/5 bg-slate-100 dark:bg-white/10 rounded"></div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Validate Faster</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Every kit starts with a real-world use case, not a blank idea. You see what already works before writing a single line of code.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Built from real problems</span>
                    </div>
                </div>

                {/* Card 2: Launch-Ready Foundations */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Auth/UI Snippet */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-4 w-40 transform group-hover:scale-105 transition-transform duration-300">
                            <div className="flex justify-between items-center mb-3">
                                <div className="w-16 h-2 bg-slate-100 dark:bg-white/10 rounded"></div>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-8 bg-slate-50 dark:bg-white/5 rounded border border-slate-100 dark:border-white/5"></div>
                                <div className="h-8 bg-slate-900 dark:bg-black rounded flex items-center justify-center">
                                    <div className="w-12 h-1 bg-slate-600 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Launch-Ready Foundations</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Auth, payments, dashboards, and roles are already wired. This is the boring but critical work — done once, properly.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Production, not prototypes</span>
                    </div>
                </div>

                {/* Card 3: Revenue-Aware by Design */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Revenue/Pricing */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 p-4 w-36 relative">
                            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                                $29/mo
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <div className="w-16 h-2 bg-slate-100 dark:bg-white/10 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-green-500" />
                                    <div className="w-full h-1.5 bg-slate-50 dark:bg-white/5 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-3 h-3 text-green-500" />
                                    <div className="w-full h-1.5 bg-slate-50 dark:bg-white/5 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Revenue-Aware by Design</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Pricing logic, purchase flows, and upgrade paths are part of the system from day one.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Monetization Native</span>
                    </div>
                </div>

                {/* Card 4: Learn by Shipping */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Iteration Loop */}
                        <div className="w-32 h-32 relative flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 z-10 w-36 text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1">DEPLOYED</div>
                                <div className="h-1.5 w-16 bg-green-400 rounded-full mx-auto"></div>
                            </div>
                            {/* Orbiting elements */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-white/10 text-[9px] text-slate-400">Edit</div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-white/10 text-[9px] text-slate-400">Fix</div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Learn by Shipping</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Start small, ship fast, and improve with real feedback instead of endless planning and rewrites.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Edit, launch, iterate</span>
                    </div>
                </div>

                {/* Card 5: Trust-First Architecture */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Code Structure */}
                        <div className="w-36 bg-gray-900 rounded-lg p-3 shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300 flex flex-col gap-2">
                            <div className="flex gap-1.5 mb-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex gap-2">
                                    <div className="w-2 h-1 bg-purple-400 rounded"></div>
                                    <div className="w-12 h-1 bg-slate-600 rounded"></div>
                                </div>
                                <div className="flex gap-2 pl-2">
                                    <div className="w-8 h-1 bg-slate-500 rounded"></div>
                                </div>
                                <div className="flex gap-2 pl-4">
                                    <div className="w-12 h-1 bg-slate-500 rounded"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-10 h-1 bg-slate-600 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Trust-First Architecture</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Clean structure, clear data flow, and sensible defaults — so users trust what you launch.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Built to be taken seriously</span>
                    </div>
                </div>

                {/* Card 6: Scale When It Makes Sense */}
                <div className="bg-white dark:bg-surface rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div className="h-48 bg-slate-50 dark:bg-white/5 rounded-xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/10 relative">
                        {/* Visual: Simple Growth Graph */}
                        <div className="w-40 h-28 flex items-end justify-between p-2">
                            <div className="w-6 bg-blue-100 dark:bg-blue-900/40 rounded-t h-[30%] group-hover:h-[35%] transition-all duration-500"></div>
                            <div className="w-6 bg-blue-200 dark:bg-blue-800/60 rounded-t h-[45%] group-hover:h-[50%] transition-all duration-500 delay-75"></div>
                            <div className="w-6 bg-blue-300 dark:bg-blue-600/80 rounded-t h-[60%] group-hover:h-[70%] transition-all duration-500 delay-100"></div>
                            <div className="w-6 bg-blue-500 rounded-t h-[80%] group-hover:h-[95%] transition-all duration-500 delay-150 relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Scale
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-textMain mb-2">Scale When It Makes Sense</h3>
                    <p className="text-textMuted text-sm leading-relaxed mb-4 flex-grow">
                        Begin simple. Expand confidently when users and revenue justify it.
                    </p>
                    <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                        <span className="text-xs font-semibold text-textMain uppercase tracking-wider text-slate-500 dark:text-slate-400">Grow only what proves itself</span>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SolutionGrid;
