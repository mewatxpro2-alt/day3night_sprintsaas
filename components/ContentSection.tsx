import React from 'react';
import { motion } from 'framer-motion';

interface ContentSectionProps {
    children: React.ReactNode;
    className?: string;
    sidebar?: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ children, className = '', sidebar }) => {
    return (
        <div className={`px-6 pb-24 max-w-7xl mx-auto ${className}`}>
            <div className={`grid grid-cols-1 ${sidebar ? 'lg:grid-cols-4 gap-12' : 'max-w-4xl mx-auto'} relative`}>

                {/* Sidebar (Optional) */}
                {sidebar && (
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            {sidebar}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${sidebar ? 'lg:col-span-3' : ''}`}
                >
                    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-8 md:p-12 shadow-sm dark:shadow-2xl backdrop-blur-sm">
                        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-textMuted prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600 dark:prose-li:text-textMuted prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-accent-primary prose-code:bg-gray-100 dark:prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-accent-primary prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
                            {children}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContentSection;
