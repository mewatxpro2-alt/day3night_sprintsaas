import React from 'react';
import { Lock, CreditCard, FileCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const TrustSecurity: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6 text-center">
                    Trust & Security
                </h1>
                <p className="text-xl text-textSecondary mb-16 text-center max-w-2xl mx-auto leading-relaxed">
                    Your intellectual property and financial data are safe with us.
                    We use industry-standard encryption and vetting processes.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-surface border border-border p-8 rounded-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-accent-primary/10 text-accent-primary rounded-xl flex items-center justify-center">
                                <CreditCard size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain">Secure Payments</h3>
                        </div>
                        <p className="text-textMuted leading-relaxed mb-4">
                            We do not store your credit card information. All transactions are securely processed by Stripe, a PCI Service Provider Level 1 certified processor.
                        </p>
                        <ul className="text-sm text-textSecondary space-y-2">
                            <li className="flex items-center gap-2"><Lock size={12} /> SSL Encrypted Connection</li>
                            <li className="flex items-center gap-2"><Lock size={12} /> 3D Secure Authentication</li>
                        </ul>
                    </div>

                    <div className="bg-surface border border-border p-8 rounded-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-accent-secondary/10 text-accent-secondary rounded-xl flex items-center justify-center">
                                <FileCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain">Code Safety</h3>
                        </div>
                        <p className="text-textMuted leading-relaxed mb-4">
                            Every uploaded asset is scanned for malicious code, backdoors, and hardcoded secrets before it goes live on the marketplace.
                        </p>
                        <ul className="text-sm text-textSecondary space-y-2">
                            <li className="flex items-center gap-2"><ShieldCheck size={12} /> Automated Vulnerability Scanning</li>
                            <li className="flex items-center gap-2"><RefreshCw size={12} /> Manual Engineer Review</li>
                        </ul>
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-textMain mb-6">Buyer Protection</h2>
                    <div className="bg-surfaceHighlight/30 border border-border rounded-xl p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h3 className="font-bold text-textMain mb-2">Dispute Resolution</h3>
                                <p className="text-textMuted text-sm leading-relaxed">
                                    If the product you receive is significantly different from the description or doesn't work as advertised, we hold the payment in escrow and mediate the dispute. You are protected from scams.
                                </p>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-textMain mb-2">Intellectual Property</h3>
                                <p className="text-textMuted text-sm leading-relaxed">
                                    Sellers sign a strict agreement guaranteeing they own the rights to the code they sell. We take immediate action against any reported IP infringement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-textMuted mb-6">Have a specific security question?</p>
                    <Button variant="outline" onClick={() => navigate('/contact')}>
                        Contact Security Team
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrustSecurity;
