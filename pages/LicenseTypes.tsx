import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X, Crown, Zap, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const LicenseTypes: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                title="Simple Licensing."
                description="We offer three clear tiers. Whether you're an indie hacker launching one product or an agency needing exclusivity, we have you covered."
                tag="No Complications"
                gradient="from-indigo-500/20 to-transparent"
            />

            <div className="px-6 max-w-7xl mx-auto pb-24 animate-slide-up">

                {/* Visual License Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

                    {/* Standard */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 dark:hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-sm dark:shadow-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-white/20" />
                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Standard</h3>
                        <p className="text-gray-600 dark:text-zinc-400 text-sm mb-6 min-h-[40px]">Perfect for launching your first SaaS product quickly on a budget.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Full Source Access</li>
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> 1 Commercial Project</li>
                            <li className="flex gap-2 text-sm text-gray-400 dark:text-zinc-500"><X size={16} /> Non-Exclusive</li>
                        </ul>
                    </div>

                    {/* Extended */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-purple-500/20 dark:hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-sm dark:shadow-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Extended</h3>
                        <p className="text-gray-600 dark:text-zinc-400 text-sm mb-6 min-h-[40px]">Commonly for larger teams needing priority support and more reach.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Priority Support</li>
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> 1 Commercial Project</li>
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Limited Sales Cap (Low Supply)</li>
                        </ul>
                    </div>

                    {/* Buyout */}
                    <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/10 dark:to-transparent border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors shadow-lg dark:shadow-none">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <Crown size={24} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Buyout</h3>
                        <p className="text-gray-600 dark:text-zinc-400 text-sm mb-6 min-h-[40px]">Complete exclusivity. We remove the listing and transfer full rights to you.</p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Full IP Transfer</li>
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Unlimited Projects</li>
                            <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300"><Check size={16} className="text-emerald-500" /> Item Permanently Delisted</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] shadow-sm dark:shadow-none">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                                <th className="p-6 text-gray-500 dark:text-zinc-400 font-medium text-sm w-1/4">Comparison</th>
                                <th className="p-6 text-gray-900 dark:text-white font-bold text-sm w-1/4">Standard</th>
                                <th className="p-6 text-gray-900 dark:text-white font-bold text-sm w-1/4">Extended</th>
                                <th className="p-6 text-emerald-600 dark:text-emerald-400 font-bold text-sm w-1/4">Buyout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 text-gray-500 dark:text-zinc-400 text-sm">Best For</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">Indie Hackers</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">Serious Founders</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">Agencies / Enterprise</td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 text-gray-500 dark:text-zinc-400 text-sm">Availability</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">High (e.g., 20)</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">Low (e.g., 5)</td>
                                <td className="p-6 text-emerald-600 dark:text-emerald-400 text-sm font-bold">Singular (1)</td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 text-gray-500 dark:text-zinc-400 text-sm">SaaS Projects</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">1 End Product</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">1 End Product</td>
                                <td className="p-6 text-gray-900 dark:text-white text-sm">Unlimited</td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 text-gray-500 dark:text-zinc-400 text-sm">Exclusivity</td>
                                <td className="p-6 text-gray-400 dark:text-zinc-600 font-mono text-xs">-</td>
                                <td className="p-6 text-gray-400 dark:text-zinc-600 font-mono text-xs">-</td>
                                <td className="p-6 text-emerald-600 dark:text-emerald-400 text-sm">Immediate Delisting</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center mt-20">
                    <Button size="lg" onClick={() => navigate('/mvp-kits')}>
                        Find Your Blueprint <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LicenseTypes;
