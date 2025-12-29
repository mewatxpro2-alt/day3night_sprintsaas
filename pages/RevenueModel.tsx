import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, DollarSign, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const RevenueModel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                title="Transparent Revenue Model."
                description="Fair pricing for everyone. No hidden fees. No recurring subscriptions to access your assets."
                tag="Zero-Hidden-Fees"
                gradient="from-accent-primary/20 to-transparent"
            />

            <div className="px-6 max-w-7xl mx-auto pb-24">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20 animate-slide-up">
                    {/* Buyer Card - Glassmorphism */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 dark:hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-sm dark:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

                        <div className="w-14 h-14 bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/10 rounded-2xl flex items-center justify-center mb-8 text-emerald-500 dark:text-emerald-400">
                            <DollarSign size={28} />
                        </div>

                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">For Buyers</h2>

                        <ul className="space-y-5">
                            <li className="flex gap-4 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
                                    <ShieldCheck size={12} />
                                </div>
                                <div>
                                    <strong className="text-gray-900 dark:text-white block mb-1">Pay Once, Own Forever</strong>
                                    <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">Flat fee per license. No recurring "access fees" to download your code.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
                                    <Zap size={12} />
                                </div>
                                <div>
                                    <strong className="text-gray-900 dark:text-white block mb-1">100% You</strong>
                                    <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">You keep 100% of the revenue you generate from your SaaS. We take 0% commission on your success.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-8 rounded-3xl hover:border-purple-500/20 dark:hover:bg-white/[0.04] transition-colors relative overflow-hidden group shadow-sm dark:shadow-none">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />

                        <div className="w-14 h-14 bg-purple-50 dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-2xl flex items-center justify-center mb-8 text-purple-500 dark:text-purple-400">
                            <Percent size={28} />
                        </div>

                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">For Sellers</h2>

                        <ul className="space-y-5">
                            <li className="flex gap-4 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-500 shrink-0">
                                    <ShieldCheck size={12} />
                                </div>
                                <div>
                                    <strong className="text-gray-900 dark:text-white block mb-1">90% Payout</strong>
                                    <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">You keep 90% of every sale. We take a flat 10% to cover Stripe fees, hosting, and platform marketing.</p>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <div className="mt-1 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-500 shrink-0">
                                    <Zap size={12} />
                                </div>
                                <div>
                                    <strong className="text-gray-900 dark:text-white block mb-1">Dynamic Pricing</strong>
                                    <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">You control the pricing for Standard, Extended, and Buyout licenses.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">Why this model?</h2>
                    <p className="text-gray-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                        We believe platform incentives should align with user success. We make money only when sellers make money. We don't charge listing fees, and we don't charge buyers monthly fees to "maintain" access to code they bought.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/submit')}>
                            Start Selling <ArrowRight size={16} className="ml-2" />
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => navigate('/mvp-kits')}>
                            Browse Marketplace
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueModel;
