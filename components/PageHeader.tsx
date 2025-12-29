import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    description?: string;
    tag?: string;
    align?: 'center' | 'left';
    gradient?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    tag,
    align = 'center',
    gradient = 'from-accent-primary/20 to-transparent'
}) => {
    return (
        <div className={`relative pt-32 pb-16 px-6 ${align === 'center' ? 'text-center' : 'text-left'} overflow-hidden`}>
            {/* Ambient Background - Dark mode only opacity adjustment */}
            <div
                className={`absolute top-0 ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} w-[600px] h-[500px] bg-gradient-to-b ${gradient} blur-[120px] opacity-20 dark:opacity-40 -z-10 pointer-events-none rounded-full`}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                {tag && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-sm text-xs font-mono text-accent-primary uppercase tracking-widest ${align === 'center' ? 'mx-auto' : ''}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
                        {tag}
                    </motion.div>
                )}

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60 tracking-tighter mb-6"
                >
                    {title}
                </motion.h1>

                {description && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-lg md:text-xl text-gray-600 dark:text-textMuted font-light leading-relaxed max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}
                    >
                        {description}
                    </motion.p>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
