import React from 'react';
import { Briefcase, ShoppingBag, Search, HelpCircle, ArrowRight } from 'lucide-react';

interface StepIntentProps {
    onSelect: (intent: string) => void;
}

const StepIntent: React.FC<StepIntentProps> = ({ onSelect }) => {
    const intents = [
        {
            id: 'buy',
            icon: ShoppingBag,
            title: 'I want to buy a SaaS / MVP',
            desc: 'Looking for ready-made codebases'
        },
        {
            id: 'sell',
            icon: Briefcase,
            title: 'I want to sell a SaaS / MVP',
            desc: 'Monetize my existing projects'
        },
        {
            id: 'explore',
            icon: Search,
            title: 'I’m exploring / learning',
            desc: 'Just browsing the market'
        },
        {
            id: 'unsure',
            icon: HelpCircle,
            title: 'I’m not sure yet',
            desc: 'Show me what’s possible'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-textMain">
                    What best describes you right now?
                </h1>
                <p className="text-textMuted text-lg">
                    We'll personalize your experience based on your goal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intents.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className="group relative p-6 bg-surface border border-border rounded-xl text-left hover:border-accent-primary/50 hover:bg-surfaceHighlight transition-all duration-200"
                    >
                        <div className="mb-4 w-10 h-10 rounded-lg bg-surfaceHighlight group-hover:bg-background flex items-center justify-center transition-colors">
                            <item.icon size={20} className="text-accent-primary" />
                        </div>
                        <h3 className="font-bold text-textMain mb-1">{item.title}</h3>
                        <p className="text-sm text-textMuted">{item.desc}</p>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                            <ArrowRight size={16} className="text-accent-primary" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StepIntent;
