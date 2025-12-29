import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface StepConfirmationProps {
    data: any;
    onComplete: () => void;
}

const StepConfirmation: React.FC<StepConfirmationProps> = ({ data, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [showButton, setShowButton] = useState(false);

    // Generate dynamic message
    const getMessage = () => {
        const { primary_intent, interest_type, seller_type, seller_product_focus } = data;

        if (primary_intent === 'sell') {
            return `You're a ${seller_type || 'creator'} planning to sell ${seller_product_focus || 'digital products'}. We'll help you showcase it the right way.`;
        }

        if (primary_intent === 'buy') {
            return `You're here to build ${interest_type || 'something great'}. SprintSaaS will tailor your experience around this.`;
        }

        if (primary_intent === 'explore') {
            return `You're exploring the market for ${interest_type || 'inspiration'}. Let's show you what's possible.`;
        }

        return "Welcome to SprintSaaS. We're glad you're here to explore the future of software.";
    };

    const fullMessage = getMessage();

    // Typewriter effect
    useEffect(() => {
        let index = 0;
        const speed = 30; // ms per char

        const timer = setInterval(() => {
            if (index < fullMessage.length) {
                setDisplayedText((prev) => prev + fullMessage.charAt(index));
                index++;
            } else {
                clearInterval(timer);
                setTimeout(() => setShowButton(true), 500);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [fullMessage]);

    // Button label based on intent
    const getButtonLabel = () => {
        if (data.primary_intent === 'sell') return 'Go to Seller Dashboard';
        if (data.primary_intent === 'buy') return 'Explore Blueprints';
        return 'Start Exploring';
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
            <h1 className="text-3xl md:text-4xl font-display leading-relaxed text-textMain max-w-2xl min-h-[160px]">
                {displayedText}
                {!showButton && <span className="animate-pulse text-accent-primary ml-1">|</span>}
            </h1>

            <div className={`transition-all duration-700 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                    onClick={onComplete}
                    className="group flex items-center gap-3 px-8 py-4 bg-textMain text-background rounded-full font-bold text-lg hover:bg-accent-primary hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-accent-primary/20"
                >
                    {getButtonLabel()}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default StepConfirmation;
