import React from 'react';
import { Book, Code, Terminal, Zap, ArrowRight, Search } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Documentation: React.FC = () => {
    const navigate = useNavigate();

    const categories = [
        {
            icon: Zap,
            title: "Getting Started",
            description: "Learn the basics of buying, downloading, and setting up your first SprintSaaS blueprint.",
            link: "#getting-started"
        },
        {
            icon: Terminal,
            title: "For Developers",
            description: "Technical guides on dependency management, environment variables, and deployment.",
            link: "#developers"
        },
        {
            icon: Code,
            title: "Selling Assets",
            description: "How to package your code, structure your repository, and pass our security audit.",
            link: "/seller-guidelines"
        },
        {
            icon: Book,
            title: "License Keys",
            description: "Understanding your rights, upgrading licenses, and managing team access.",
            link: "/licensing"
        }
    ];

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto animate-fade-in">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-6">
                        Documentation
                    </h1>
                    <p className="text-xl text-textSecondary mb-8 max-w-2xl mx-auto leading-relaxed">
                        Everything you need to build faster with SprintSaaS. Guides, references, and examples.
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                        <input
                            type="text"
                            placeholder="Search guides (e.g., 'deploy to vercel', 'stripe setup')..."
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface border border-border text-textMain focus:outline-none focus:border-accent-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {categories.map((cat, index) => (
                        <div key={index} className="p-8 bg-surface border border-border rounded-xl hover:border-accent-primary/30 transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-surfaceHighlight rounded-lg flex items-center justify-center mb-6 text-textMain group-hover:text-accent-primary transition-colors">
                                <cat.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-textMain mb-2 group-hover:text-accent-primary transition-colors">{cat.title}</h3>
                            <p className="text-textMuted mb-4 leading-relaxed">{cat.description}</p>
                            <div className="flex items-center text-sm font-bold text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                Read Guide <ArrowRight size={14} className="ml-1" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-surfaceHighlight border border-border rounded-xl p-8 text-center">
                    <h3 className="text-lg font-bold text-textMain mb-2">Can't find what you're looking for?</h3>
                    <p className="text-textMuted mb-6">Our support team is ready to help you with specific technical questions.</p>
                    <Button variant="outline" onClick={() => navigate('/contact')}>
                        Contact Support
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
