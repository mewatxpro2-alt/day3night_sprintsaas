import React from 'react';
import { Search, FileCode, CreditCard, Download, Rocket, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const HowItWorks: React.FC = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: Search,
            title: "1. Browse Blueprints",
            description: "Explore our catalog of production-ready SaaS architectures. Filter by tech stack (Next.js, Supabase, Node) or use case (AI, Fintech, E-commerce)."
        },
        {
            icon: FileCode,
            title: "2. Review the Tech",
            description: "Each listing details the exact stack, database schema, and included features. Check the live demo to verify the quality before you commit."
        },
        {
            icon: CreditCard,
            title: "3. Secure One-Time Purchase",
            description: "Pay a flat fee for the license. No recurring subscriptions. Complete your purchase via our secure payment processor."
        },
        {
            icon: Download,
            title: "4. Instant Source Access",
            description: "Immediately receive access to the private GitHub repository and documentation. Clone the code and start building locally."
        },
        {
            icon: Rocket,
            title: "5. Build & Ship",
            description: "Customize the code, add your branding, and deploy. You save months of foundational work and go straight to market."
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6">
                    How Buying Works
                </h1>
                <p className="text-xl text-textSecondary mb-16 leading-relaxed">
                    We've removed the friction from buying software assets.
                    Go from "browsing" to "`git clone`" in under 5 minutes.
                </p>

                <div className="relative border-l border-border ml-4 md:ml-8 mb-16 space-y-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative pl-12 md:pl-16">
                            <div className="absolute -left-[21px] md:-left-[21px] top-1 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-accent-primary shadow-sm">
                                <step.icon size={18} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-2">{step.title}</h3>
                            <p className="text-textMuted leading-relaxed max-w-lg">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-surfaceHighlight border border-border rounded-xl p-8 mb-12">
                    <h3 className="text-lg font-bold text-textMain mb-2">Why buy a blueprint?</h3>
                    <p className="text-textMuted mb-6">
                        Building a SaaS from scratch takes 3-6 months. Buying a blueprint lets you skip the auth, stripe integration, database setup, and UI scaffolding. You start at the finish line of "MVP" and keep going.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => navigate('/mvp-kits')}>
                        Start Browsing <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
