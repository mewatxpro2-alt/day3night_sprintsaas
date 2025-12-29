import React, { useState } from 'react';
import Button from '../Button';

interface StepDetailsProps {
    intent: string;
    onComplete: (data: any) => void;
}

const StepDetails: React.FC<StepDetailsProps> = ({ intent, onComplete }) => {
    const isSeller = intent === 'sell';

    // Buyer/Explorer state
    const [interest, setInterest] = useState('');
    const [experience, setExperience] = useState('');

    // Seller state
    const [sellerType, setSellerType] = useState('');
    const [productFocus, setProductFocus] = useState('');
    const [readiness, setReadiness] = useState('');

    const handleContinue = () => {
        if (isSeller) {
            onComplete({
                seller_type: sellerType,
                seller_product_focus: productFocus,
                seller_readiness: readiness
            });
        } else {
            onComplete({
                interest_type: interest,
                experience_level: experience
            });
        }
    };

    if (isSeller) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-textMain">
                        Tell us about your seller journey
                    </h1>
                    <p className="text-textMuted text-lg">
                        This helps us match you with the right buyers.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Seller Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-textMain">What type of seller are you?</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {['Solo Developer', 'Agency', 'Indie Hacker', 'Team'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSellerType(opt)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${sellerType === opt
                                            ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-medium'
                                            : 'border-border bg-surface text-textMuted hover:border-accent-primary/30'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Focus */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-textMain">What are you planning to sell?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {['Full SaaS Business', 'MVP / Boilerplate', 'UI Kit / Component'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setProductFocus(opt)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${productFocus === opt
                                            ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-medium'
                                            : 'border-border bg-surface text-textMuted hover:border-accent-primary/30'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Readiness */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-textMain">How soon are you ready to list?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {['Ready Now', 'In a few weeks', 'Just Exploring'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setReadiness(opt)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${readiness === opt
                                            ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-medium'
                                            : 'border-border bg-surface text-textMuted hover:border-accent-primary/30'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            variant="primary"
                            className="w-full py-4 text-lg"
                            onClick={handleContinue}
                            disabled={!sellerType || !productFocus || !readiness}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Buyer / Explorer View
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-textMain">
                    What are you looking to build?
                </h1>
                <p className="text-textMuted text-lg">
                    We'll recommend the best blueprints for you.
                </p>
            </div>

            <div className="space-y-6">
                {/* Interest Type */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-textMain">Primary Interest</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['AI / LLM Wrappers', 'SaaS Tools', 'E-commerce', 'Micro-SaaS', 'Internal Tools', 'Mobile Apps'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setInterest(opt)}
                                className={`p-4 rounded-lg border text-left text-sm transition-all ${interest === opt
                                        ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-medium'
                                        : 'border-border bg-surface text-textMuted hover:border-accent-primary/30'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-textMain">Tech Experience Level</label>
                    <div className="flex gap-3">
                        {['Beginner', 'Intermediate', 'Pro Developer'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setExperience(opt)}
                                className={`flex-1 p-3 rounded-lg border text-sm transition-all ${experience === opt
                                        ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-medium'
                                        : 'border-border bg-surface text-textMuted hover:border-accent-primary/30'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        variant="primary"
                        className="w-full py-4 text-lg"
                        onClick={handleContinue}
                        disabled={!interest || !experience}
                    >
                        See My Recommendations
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StepDetails;
