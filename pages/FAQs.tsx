import React, { useState } from 'react';
import {
    Plus, Minus, Search, ShieldCheck, CreditCard,
    Code, ShoppingBag, DollarSign, HelpCircle,
    FileText, Server, Users, ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

type Category = 'General' | 'Licensing' | 'For Buyers' | 'For Sellers';

const FAQs: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<Category>('General');

    // FAQs with Categories and Icon mappings
    const allFaqs = [
        // General
        {
            category: 'General',
            icon: HelpCircle,
            question: "What exactly is SprintSaaS?",
            answer: "SprintSaaS is a premium marketplace where you can buy and sell production-ready generic source code for SaaS applications. Think of it as 'ThemeForest for full-stack apps'—you get the backend, frontend, and database schema, ready to launch."
        },
        {
            category: 'General',
            icon: Users,
            question: "Who is this for?",
            answer: "It's for developers, agencies, and founders who want to skip the first 3 months of development. Instead of building authentication, payments, and CRUD from scratch, you start with a working product."
        },
        // Licensing
        {
            category: 'Licensing',
            icon: FileText,
            question: "Do I own the code after purchase?",
            answer: "Yes. You purchase a perpetual commercial license to use the code. You can modify it, host it, and build a business around it. You keep 100% of your revenue."
        },
        {
            category: 'Licensing',
            icon: ShieldCheck,
            question: "Can I resell the code?",
            answer: "No. You cannot resell, redistribute, or open-source the blueprint code itself. You typically purchase the right to build a SaaS product (End Product) for yourself or a client, not to compete with the original seller."
        },
        // For Buyers
        {
            category: 'For Buyers',
            icon: CreditCard,
            question: "Is there a refund policy?",
            answer: "Since you receive immediate access to the full unencrypted source code, we generally do not offer refunds. However, if the code is broken or significantly different from the demo, we offer buyer protection."
        },
        {
            category: 'For Buyers',
            icon: Code,
            question: "What tech stacks are supported?",
            answer: "We focus on modern, typed stacks. Most blueprints are built with Next.js, React, TypeScript, Node.js, Supabase, or Postgres. The exact stack is listed on every product page."
        },
        {
            category: 'For Buyers',
            icon: Server,
            question: "How do I get updates?",
            answer: "When you buy a blueprint, you get access to the private GitHub repository. You can pull the latest changes whenever the seller pushes an update."
        },
        // For Sellers
        {
            category: 'For Sellers',
            icon: DollarSign,
            question: "How much can I earn?",
            answer: "You keep 90% of every sale. We take a flat 10% commission to verify buyers, handle payments, and cover hosting costs. Top sellers can earn $5k-$20k/month."
        },
        {
            category: 'For Sellers',
            icon: ShoppingBag,
            question: "What is the exclusivity requirement?",
            answer: "We do not require exclusivity. You can sell your code on your own site too. However, exclusive items often get featured placement on our homepage."
        },
    ];

    const filteredFaqs = allFaqs.filter(f => f.category === activeCategory);

    const categories: Category[] = ['General', 'Licensing', 'For Buyers', 'For Sellers'];

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
            {/* Subtle Background Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6 tracking-tight">
                        Frequently asked questions
                    </h1>
                    <p className="text-xl text-textSecondary max-w-2xl mx-auto leading-relaxed">
                        Everything you need to know about the product and billing. <br className="hidden md:block" />
                        Can’t find the answer you’re looking for? <span className="text-accent-primary underline cursor-pointer hover:text-accent-primary/80 transition-colors" onClick={() => navigate('/contact')}>Chat to our friendly team.</span>
                    </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat
                                    ? 'bg-textMain text-background shadow-lg scale-105'
                                    : 'bg-surface border border-border text-textSecondary hover:bg-surfaceHighlight'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4 animate-slide-up">
                    {filteredFaqs.map((faq, index) => (
                        <FAQItem key={`${activeCategory}-${index}`} icon={faq.icon} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                {/* Contact CTA Bottom */}
                <div className="mt-20 p-8 md:p-12 bg-surface border border-border rounded-2xl text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-50"></div>
                    <div className="relative z-10">
                        <div className="h-16 w-16 bg-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users className="text-textMain" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-textMain mb-3">Still have questions?</h3>
                        <p className="text-textMuted mb-8 max-w-lg mx-auto">
                            Can’t find the answer you’re looking for? Please chat to our friendly team.
                        </p>
                        <Button onClick={() => navigate('/contact')}>
                            Get in touch
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

const FAQItem: React.FC<{ question: string; answer: string; icon: React.ElementType }> = ({ question, answer, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`bg-surface border transition-all duration-300 rounded-xl overflow-hidden ${isOpen ? 'border-accent-primary/40 shadow-md bg-surfaceHighlight/30' : 'border-border hover:border-border/80'
                }`}
        >
            <div
                className="p-6 cursor-pointer flex gap-5 items-start"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Icon Box */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors duration-300 ${isOpen ? 'bg-accent-primary text-white border-accent-primary' : 'bg-surfaceHighlight border-border text-textSecondary'
                    }`}>
                    <Icon size={20} />
                </div>

                <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className={`text-lg font-semibold transition-colors ${isOpen ? 'text-accent-primary' : 'text-textMain'}`}>
                            {question}
                        </h3>
                        <div className={`shrink-0 text-textMuted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent-primary' : ''}`}>
                            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                        </div>
                    </div>

                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <p className="text-textMuted leading-relaxed pr-8 pb-2">
                                {answer}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQs;
