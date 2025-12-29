import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';

// Hardcoded Data
const POSTS = [
    {
        slug: 'art-of-the-pivot',
        title: "The Art of the Pivot: When to Kill Your Darlings",
        category: "Founder Insights",
        date: "Oct 12, 2024",
        excerpt: "The most dangerous number in a startup isn't zero revenue. It's the six months you spent building the wrong thing because you were too afraid to stop.",
        image: "https://images.unsplash.com/photo-1639322537228-ad71b92bb59d?q=80&w=3264&auto=format&fit=crop"
    },
    {
        slug: 'boilerplate-fatigue',
        title: "Boilerplate Fatigue: Why Building From Scratch is a Trap",
        category: "SaaS Building",
        date: "Oct 20, 2024",
        excerpt: "There is a specific kind of exhaustion that hits a developer three weeks into a new project, when they realize they are still configuring Webpack.",
        image: "https://images.unsplash.com/photo-1558494949-ef526b01201b?q=80&w=3000&auto=format&fit=crop"
    },
    {
        slug: 'validation-sprint',
        title: "The 48-Hour Validation Sprint",
        category: "MVP & Validation",
        date: "Nov 02, 2024",
        excerpt: "The goal of an MVP isn't to build a product. It's to prove that a product should exist. Here is a framework for validating in a weekend.",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop"
    },
    {
        slug: 'pricing-power',
        title: "Pricing Power: You Are Probably Undervaluing Your SaaS",
        category: "Monetization",
        date: "Nov 15, 2024",
        excerpt: "If you asked your first ten customers 'Would you have paid double?', and nobody said yes, you are too cheap.",
        image: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=2970&auto=format&fit=crop"
    },
    {
        slug: 'solo-tech-stack',
        title: "Solo but Scalable: The Tech Stack of One-Person Unicorns",
        category: "Indie Hacker",
        date: "Nov 28, 2024",
        excerpt: "In 2024, one person can build a unicorn if they choose the right stack. How to leverage automation to compete with teams of ten.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop"
    },
    {
        slug: 'design-debt',
        title: "Design Debt vs. Technical Debt",
        category: "Product",
        date: "Dec 05, 2024",
        excerpt: "Users will forgive a 500ms API delay. They will not forgive an interface that makes them feel stupid. Why visuals matter more than backend.",
        image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=2938&auto=format&fit=crop"
    }
];

const Blog = () => {
    return (
        <div className="min-h-screen bg-background">
            <PageHeader
                title="Thoughts on Building."
                description="Essays on startups, SaaS architecture, and the art of shipping software without losing your mind."
                tag="SprintSaaS Editorial"
                gradient="from-purple-500/20 to-transparent"
            />

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {POSTS.map((post, idx) => (
                        <Link to={`/blog/${post.slug}`} key={post.slug} className="group block h-full">
                            <div className="h-full bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-gray-300 dark:hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl dark:shadow-none flex flex-col">
                                <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5 relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold uppercase tracking-wider">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {post.date}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4 group-hover:text-accent-primary transition-colors leading-tight">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-600 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-6 font-light flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-sm font-bold text-gray-900 dark:text-white group-hover:translate-x-2 transition-transform">
                                        Read Article <ArrowRight size={16} className="ml-2 text-accent-primary" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Newsletter Minimal */}
            <div className="max-w-2xl mx-auto mb-24 px-6">
                <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 rounded-full blur-[60px]" />

                    <Mail className="mx-auto text-accent-primary mb-6" size={32} />
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">Subscribe to the newsletter</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 font-light">Get new essays delivered to your inbox. No spam, just signal.</p>

                    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-primary dark:focus:border-accent-primary text-gray-900 dark:text-white transition-colors"
                        />
                        <Button>
                            Join
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Blog;
