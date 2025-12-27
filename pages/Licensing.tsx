import React from 'react';
import { ShieldCheck, Check, X, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Licensing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6">
                    Licensing Explained
                </h1>
                <p className="text-xl text-textSecondary mb-12 leading-relaxed">
                    SprintSaaS sells **commercial usage rights** to production-ready B2B SaaS source code.
                    You own the freedom to build, launch, and monetize.
                </p>

                {/* Core Rights */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-textMain mb-6">What You Can Do</h2>
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Check className="text-green-500" size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-textMain mb-2">Build & Monetize SaaS Products</h3>
                                <p className="text-textMuted">Use the source code to build a SaaS application, charge users for access, and sell subscriptions or lifetime deals. You keep 100% of your revenue.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Check className="text-green-500" size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-textMain mb-2">Modify Everything</h3>
                                <p className="text-textMuted">You have full access to the source code (backend, frontend, database). Change the design, features, and logic to fit your brand.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Check className="text-green-500" size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-textMain mb-2">Unlimited Internal Use</h3>
                                <p className="text-textMuted">Use the code for unlimited internal projects, dashboards, or tools within your own company.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Restrictions */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-textMain mb-6">What You Cannot Do</h2>
                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-6 bg-surface border border-border rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/20"></div>
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <X className="text-red-500" size={18} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-textMain mb-2">Resell the Source Code</h3>
                                <p className="text-textMuted">You cannot resell, redistribute, or open-source the blueprint code itself as a standalone product, library, or starter kit.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Style Clarity */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-textMain mb-6">Common Questions</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-semibold text-textMain mb-2">Can I sell the company I build?</h3>
                            <p className="text-textMuted">Yes. If you build a SaaS product using our blueprint and acquire customers, you can sell that entire business (including the code running it) to a third party.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-textMain mb-2">Do I need to attribute SprintSaaS?</h3>
                            <p className="text-textMuted">No. You do not need to show "Powered by SprintSaaS" anywhere on your site.</p>
                        </div>
                    </div>
                </section>

                <div className="flex gap-4 border-t border-border pt-8">
                    <Button onClick={() => navigate('/mvp-kits')}>
                        Browse Blueprints <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/license-types')}>
                        Compare License Tiers
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Licensing;
