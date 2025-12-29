import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';

interface BlogLayoutProps {
    children: React.ReactNode;
    title: string;
    category: string;
    date: string;
    readTime: string;
    heroImage?: string;
    authorName?: string;
    authorRole?: string;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
    children,
    title,
    category,
    date,
    readTime,
    heroImage,
    authorName = "Abubakar Founder",
    authorRole = "SprintSaaS Editor"
}) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white pb-20 transition-colors duration-300">
            {/* Reading Progress - Green Theme */}
            <div className="fixed top-0 left-0 h-1.5 bg-emerald-500 z-50 transition-all duration-300" style={{ width: `${scrollProgress * 100}%` }} />

            {/* Nav Back */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <Link to="/blog" className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                    <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Editorial
                </Link>
            </div>

            <article className="max-w-3xl mx-auto px-6 animate-fade-in-up">
                {/* Header */}
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                            {category}
                        </span>
                        <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">
                            {readTime} Read
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight mb-6 text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>

                    <div className="flex items-center justify-center md:justify-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                        <div className="h-10 w-10 bg-slate-900 dark:bg-slate-800 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-800 flex items-center justify-center p-2">
                            {/* Website Logo in Avatar */}
                            <svg viewBox="0 0 32 32" className="w-full h-full text-emerald-500 fill-current" aria-hidden="true">
                                <path d="M6 16L12 4H26L20 16H6Z" opacity="0.9" />
                                <path d="M26 16L20 28H6L12 16H26Z" opacity="0.6" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{authorName}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>{authorRole}</span>
                                <span>•</span>
                                <span>{date}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                {heroImage && (
                    <div className="mb-16 rounded-xl overflow-hidden shadow-sm aspect-[21/9] bg-slate-100 dark:bg-slate-900">
                        <img
                            src={heroImage}
                            alt={title}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="prose prose-lg prose-slate dark:prose-invert md:prose-xl mx-auto md:mx-0 font-serif leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-headings:font-medium">
                    {children}
                </div>

                {/* Footer / Share */}
                <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-sm text-slate-500 italic">
                        Written for SprintSaaS
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        <Share2 size={16} />
                        Share Article
                    </button>
                </div>
            </article>

            {/* Newsletter / Soft CTA Area (Hardcoded) */}
            <div className="max-w-3xl mx-auto px-6 mt-24">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 md:p-12 text-center md:text-left md:flex items-center justify-between gap-8 border border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">Build better SaaS, faster.</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-0 max-w-md">
                            SprintSaaS provides the high-quality boilerplate and UI kits you need to stop setting up and start shipping.
                        </p>
                    </div>
                    <Link to="/pricing" className="mt-6 md:mt-0 inline-block px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg font-medium hover:bg-black dark:hover:bg-emerald-500 transition-colors whitespace-nowrap">
                        View Kits
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogLayout;
