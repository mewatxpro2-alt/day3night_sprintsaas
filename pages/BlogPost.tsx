import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../lib/database.types';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Clock, Calendar, ArrowUpRight, CheckCircle2, ChevronRight, Twitter, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Button from '../components/Button';
import { Helmet } from 'react-helmet-async';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('is_published', true)
                .single();

            if (error || !data) {
                // Handle 404 silently or redirect
                console.warn('Post not found');
            } else {
                setPost(data);
            }
            setIsLoading(false);
        };

        fetchPost();
    }, [slug, navigate]);

    // Scroll Progress
    useEffect(() => {
        const updateProgress = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / totalHeight) * 100;
            setReadingProgress(progress);
        };

        window.addEventListener('scroll', updateProgress);
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                {/* Custom minimal loader */}
                <div className="w-1.5 h-1.5 bg-textMain rounded-full animate-bounce"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-20 pb-20 px-6 text-center">
                <h1 className="text-9xl font-display font-bold text-textMain/5 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-textMain mb-4">Article not found</h2>
                <p className="text-textSecondary mb-8">This post may have been moved or deleted.</p>
                <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
            </div>
        );
    }

    const wordCount = post.content?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen bg-background text-textMain relative">
            <Helmet>
                <title>{post.seo_title || post.title} | SprintSaaS</title>
                <meta name="description" content={post.seo_description || post.excerpt} />
            </Helmet>

            {/* Subtle Progress Bar */}
            <div className="fixed top-0 left-0 h-1 bg-accent-primary z-50 transition-all duration-150 ease-out" style={{ width: `${readingProgress}%` }}></div>

            {/* ARTICLE HEADER */}
            <header className="pt-40 pb-20 max-w-4xl mx-auto px-6 text-center animate-fade-in">
                {/* Breadcrumb / Tag */}
                <div className="flex items-center justify-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-textMuted">
                    <span className="hover:text-textMain cursor-pointer transition-colors" onClick={() => navigate('/blog')}>Blog</span>
                    <ChevronRight size={10} />
                    <span className="text-accent-primary">{post.tags?.[0] || 'Update'}</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-textMain leading-[1.1] mb-8 tracking-tight">
                    {post.title}
                </h1>

                <div className="flex items-center justify-center gap-6 text-sm text-textSecondary font-medium">
                    <div className="flex items-center gap-2">
                        {/* Placeholder Avatar */}
                        <div className="w-6 h-6 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-[10px] font-bold text-textMuted">S</div>
                        <span>SprintSaaS Team</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{new Date(post.published_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span>{readTime} min read</span>
                </div>
            </header>


            {/* MAIN CONTENT WRAPPER */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">

                {/* LEFT SIDEBAR (Sticky Navigation) */}
                <aside className="hidden lg:block col-span-2 lg:col-span-3">
                    <div className="sticky top-32 space-y-12 animate-fade-in delay-200 opacity-0 fill-mode-forwards">
                        {/* Share */}
                        <div>
                            <h4 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">Share</h4>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full border border-border text-textMuted hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-surface transition-all" aria-label="Share on Twitter" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`, '_blank')}>
                                    <Twitter size={16} />
                                </button>
                                <button className="p-2 rounded-full border border-border text-textMuted hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-surface transition-all" aria-label="Share on LinkedIn" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}>
                                    <Linkedin size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Table of Contents (Placeholder - would parse MD in prod) */}
                        <div>
                            <h4 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">In this article</h4>
                            <ul className="space-y-3 text-sm text-textSecondary border-l border-border pl-4">
                                {/* Simple logic to find H2s would ideally go here. Sticky stub for now. */}
                                <li className="text-textMain font-medium cursor-pointer hover:text-accent-primary transition-colors">Introduction</li>
                                <li className="hover:text-textMain cursor-pointer transition-colors">Key Takeaways</li>
                                <li className="hover:text-textMain cursor-pointer transition-colors">The Core Problem</li>
                                <li className="hover:text-textMain cursor-pointer transition-colors">Our Solution</li>
                                <li className="hover:text-textMain cursor-pointer transition-colors">Conclusion</li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* CENTER CONTENT */}
                <main className="col-span-1 lg:col-span-1 border-hidden lg:block"></main> {/* Spacer for visual balance if needed, skipping for simple grid math */}

                <article className="col-span-1 lg:col-span-8 lg:col-start-4">
                    {post.cover_image && (
                        <figure className="mb-14 rounded-xl overflow-hidden bg-surfaceHighlight animate-slide-up">
                            <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
                            {/* <figcaption className="text-center text-xs text-textMuted mt-3">Photo by Unsplash</figcaption> */}
                        </figure>
                    )}

                    <div className="prose prose-lg prose-invert max-w-none 
             prose-headings:font-display prose-headings:font-bold prose-headings:text-textMain prose-headings:tracking-tight
             prose-h1:text-5xl prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6
             prose-p:text-textSecondary prose-p:leading-[1.9] prose-p:text-[1.125rem] prose-p:font-sans
             prose-strong:text-textMain prose-strong:font-bold
             prose-blockquote:border-l-2 prose-blockquote:border-accent-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-textMain prose-blockquote:font-medium text-xl
             prose-ul:text-textSecondary prose-li:marker:text-accent-primary/60
             prose-code:text-accent-primary prose-code:font-medium prose-code:bg-surfaceHighlight prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
             prose-img:rounded-xl prose-img:shadow-soft
             animate-slide-up delay-100
             selection:bg-accent-primary/20 selection:text-textMain
           ">
                        <ReactMarkdown
                            components={{
                                blockquote: ({ node, ...props }) => (
                                    <div className="my-10 pl-6 border-l-2 border-accent-primary font-medium text-xl text-textMain italic leading-relaxed">
                                        <span className="not-italic block text-xs font-bold text-accent-primary uppercase tracking-wider mb-2 not-prose">Key Insight</span>
                                        <blockquote {...props} className="border-none pl-0 not-italic" />
                                    </div>
                                )
                            }}
                        >
                            {post.content || ''}
                        </ReactMarkdown>
                    </div>

                    {/* AUTHOR SIGNATURE */}
                    <div className="mt-20 pt-10 border-t border-border flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center text-lg font-bold text-textMuted">
                            S
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-textMain">SprintSaaS Team</h3>
                            <p className="text-textMuted text-sm">Empowering founders to ship faster.</p>
                        </div>
                    </div>

                </article>
            </div>

            {/* BOTTOM CONVERSION SECTION - "The Soft CTA" */}
            <section className="bg-surfaceHighlight/30 border-t border-border py-24">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-textMain mb-6">
                        Start your next project with a head start.
                    </h2>
                    <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
                        Save months of development time. Get a production-ready SaaS application with Auth, Stripe, and Dashboard pre-built.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/mvp-kits')}>
                            Explore Blueprints
                            <ArrowUpRight className="ml-2" size={18} />
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-textMuted px-4">
                            <CheckCircle2 size={16} className="text-accent-primary" />
                            <span>Production Ready</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-textMuted px-4">
                            <CheckCircle2 size={16} className="text-accent-primary" />
                            <span>One-time payment</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default BlogPostPage;
