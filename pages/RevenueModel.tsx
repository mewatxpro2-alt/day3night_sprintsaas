import React from 'react';
import { Percent, DollarSign, RefreshCw, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const RevenueModel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6">
                    Revenue Model
                </h1>
                <p className="text-xl text-textSecondary mb-12 leading-relaxed">
                    Transparent pricing for everyone. No hidden fees. No recurring subscriptions for assets.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* Buyer Card */}
                    <div className="bg-surface border border-border p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center mb-6 text-accent-primary">
                            <DollarSign size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-textMain mb-4">For Buyers</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-textMain shrink-0"></div>
                                <p className="text-textMuted"><strong className="text-textMain">Pay Once:</strong> Flat fee per license. You own the rights forever.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-textMain shrink-0"></div>
                                <p className="text-textMuted"><strong className="text-textMain">0% Commission:</strong> You keep 100% of the revenue you generate from your SaaS.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-textMain shrink-0"></div>
                                <p className="text-textMuted"><strong className="text-textMain">Free Updates:</strong> Get lifetime updates to the codebase if the seller publishes them.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-surface border border-border p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-accent-secondary/10 rounded-xl flex items-center justify-center mb-6 text-accent-secondary">
                            <Percent size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-textMain mb-4">For Sellers</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-textMain shrink-0"></div>
                                <p className="text-textMuted"><strong className="text-textMain">90% Payout:</strong> You keep 90% of every sale. We take a flat 10% commission to cover payment processing, hosting, and platform marketing.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-textMain shrink-0"></div>
                                <p className="text-textMuted"><strong className="text-textMain">Set Your Price:</strong> You control the pricing for Standard, Extended, and Buyout licenses.</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-textMain mb-6">Why this model?</h2>
                    <p className="text-textMuted max-w-2xl leading-relaxed mb-6">
                        We believe platform incentives should align with user success. We make money only when sellers make money. We don't charge listing fees, and we don't charge buyers monthly fees to "maintain" access to code they bought.
                    </p>
                </section>

                <div className="flex gap-4 border-t border-border pt-8">
                    <Button onClick={() => navigate('/submit')}>
                        Start Selling <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/mvp-kits')}>
                        Browse Marketplace
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RevenueModel;
