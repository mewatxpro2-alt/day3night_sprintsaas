import React from 'react';
import { Check, Info, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const LicenseTypes: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 text-center">
                    Choose the Right License
                </h1>
                <p className="text-xl text-textSecondary mb-16 leading-relaxed text-center max-w-2xl mx-auto">
                    We offer three clear tiers. Whether you're an indie hacker launching one product or an agency needing exclusivity, we have you covered.
                </p>

                {/* Comparison Table */}
                <div className="overflow-x-auto mb-16">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-border text-textMuted font-medium w-1/4">Feature</th>
                                <th className="p-4 border-b border-border bg-surfaceHighlight/50 text-textMain font-bold text-lg w-1/4">Standard</th>
                                <th className="p-4 border-b border-border text-textMain font-bold text-lg w-1/4">Extended</th>
                                <th className="p-4 border-b border-border text-textMain font-bold text-lg w-1/4 text-accent-primary">Buyout</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr>
                                <td className="p-4 text-textMuted font-medium">Best For</td>
                                <td className="p-4 text-textMain">Indie Hackers</td>
                                <td className="p-4 text-textMain">Serious Founders</td>
                                <td className="p-4 text-textMain">Enterprise / Agencies</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-textMuted font-medium">Availability</td>
                                <td className="p-4 text-textMain">High (e.g. 20 copies)</td>
                                <td className="p-4 text-textMain">Low (e.g. 5 copies)</td>
                                <td className="p-4 text-textMain font-bold text-accent-primary">Exclusive (1 copy)</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-textMuted font-medium">SaaS Projects</td>
                                <td className="p-4 text-textMain">1 End Product</td>
                                <td className="p-4 text-textMain">1 End Product</td>
                                <td className="p-4 text-textMain">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-textMuted font-medium">Source Access</td>
                                <td className="p-4"><Check size={20} className="text-green-500" /></td>
                                <td className="p-4"><Check size={20} className="text-green-500" /></td>
                                <td className="p-4"><Check size={20} className="text-green-500" /></td>
                            </tr>
                            <tr>
                                <td className="p-4 text-textMuted font-medium">Asset Removal</td>
                                <td className="p-4 text-textMuted">-</td>
                                <td className="p-4 text-textMuted">-</td>
                                <td className="p-4 text-textMain text-sm">Item removed from market</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* License Definitions */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div>
                        <h3 className="text-xl font-bold text-textMain mb-3">Standard License</h3>
                        <p className="text-textMuted leading-relaxed">
                            The default choice. Perfect for launching a single SaaS product quickly. You get full source access and commercial rights, but others can buy the same base.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-textMain mb-3">Extended License</h3>
                        <p className="text-textMuted leading-relaxed">
                            For founders who want less competition. We sell fewer copies of this tier, ensuring your codebase remains more unique in the market.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-textMain mb-3 text-accent-primary">Buyout License</h3>
                        <p className="text-textMuted leading-relaxed">
                            Complete exclusivity. Once you buy this, we take the listing down. No one else can ever buy it again. Required approval from the seller.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center border-t border-border pt-12">
                    <Button className="h-12 px-8 text-lg" onClick={() => navigate('/mvp-kits')}>
                        Find Your Blueprint <ArrowRight size={20} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LicenseTypes;
