import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../lib/database.types';
import { Calendar, ArrowRight, Tag, Loader2, Clock, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Blog: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            setPosts(data || []);
            setIsLoading(false);
        };

        fetchPosts();
    }, []);

    const featuredPosts = posts.filter(p => p.is_featured).slice(0, 2); // Top 2 Featured
    const recentPosts = posts.filter(p => !featuredPosts.find(fp => fp.id === p.id));

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* Header Section: "Insights for Builders" */}
                <div className="max-w-2xl mb-20 animate-fade-in">
                    <h4 className="text-accent-primary font-bold uppercase tracking-wider text-xs mb-4">SprintSaaS Updates & Essays</h4>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-textMain mb-6 tracking-tight">
                        Insights for Builders
                    </h1>
                    <p className="text-xl text-textSecondary leading-relaxed">
                        Deep dives on building, selling, and scaling real SaaS products. <br className="hidden md:block" />
                        No fluff. Just engineering and business transparency.
                    </p>
                </div>

                {/* Section: Editor's Picks (Featured) */}
                {featuredPosts.length > 0 && (
                    <div className="mb-24 animate-slide-up">
                        <h3 className="text-textMuted text-sm font-bold uppercase tracking-widest mb-8 border-b border-border pb-4">Editor's Picks</h3>
                        <div className="grid md:grid-cols-2 gap-10">
                            {featuredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => navigate(`/blog/${post.slug}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[16/10] overflow-hidden rounded-md bg-surfaceHighlight border border-border mb-6 group-hover:shadow-premium transition-all duration-500 relative">
                                        {post.cover_image && (
                                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                    </div>

                                    <div className="flex items-center gap-3 text-xs font-bold text-accent-primary mb-3 uppercase tracking-wide">
                                        <span>{post.tags?.[0]}</span>
                                        <span className="text-textMuted/50">•</span>
                                        <span className="text-textSecondary font-medium flex items-center gap-1">
                                            <Clock size={12} /> {Math.ceil((post.content?.split(' ').length || 0) / 200)} min read
                                        </span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-display font-bold text-textMain mb-3 group-hover:text-accent-primary transition-colors leading-tight">
                                        {post.title}
                                    </h2>

                                    <p className="text-textSecondary text-lg leading-relaxed line-clamp-2 mb-4">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center text-sm font-bold text-textMain group-hover:translate-x-1 transition-transform">
                                        Read Article <ChevronRight size={16} className="ml-1 text-accent-primary" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Latest Articles */}
                <div className="animate-slide-up delay-100">
                    <h3 className="text-textMuted text-sm font-bold uppercase tracking-widest mb-8 border-b border-border pb-4">Latest Writings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                        {recentPosts.map((post) => (
                            <article
                                key={post.id}
                                className="group cursor-pointer flex flex-col"
                                onClick={() => navigate(`/blog/${post.slug}`)}
                            >
                                <div className="aspect-video overflow-hidden rounded-md bg-surfaceHighlight border border-border mb-5 group-hover:shadow-soft transition-all duration-300">
                                    {post.cover_image ? (
                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-textMuted">SprintSaaS</div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold text-accent-primary mb-3 uppercase tracking-wide">
                                    {post.tags?.[0] || 'Update'}
                                </div>

                                <h3 className="text-xl font-bold text-textMain mb-2 group-hover:text-accent-primary transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-textMuted text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                    {post.excerpt}
                                </p>

                                <div className="text-xs text-textSecondary font-medium mt-auto">
                                    {new Date(post.published_at || '').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Newsletter / Conversion Footer */}
                <div className="mt-32 border-t border-border pt-20 text-center animate-fade-in">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-display font-bold text-textMain mb-4">Build better software, faster.</h2>
                        <p className="text-textSecondary mb-8 text-lg">
                            Join 2,000+ founders receiving our specialized blueprints and market insights.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full sm:w-80 bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                            />
                            <Button className="w-full sm:w-auto">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Blog;
