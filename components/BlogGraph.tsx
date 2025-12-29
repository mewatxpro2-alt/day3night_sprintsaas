import React from 'react';

type GraphType = 'growth-curve' | 'market-split' | 'time-vs-value' | 'bar-comparison';

interface BlogGraphProps {
    type: GraphType;
    caption: string;
    labelX?: string;
    labelY?: string;
}

const BlogGraph: React.FC<BlogGraphProps> = ({ type, caption, labelX, labelY }) => {

    const renderGraph = () => {
        switch (type) {
            case 'growth-curve':
                return (
                    <svg viewBox="0 0 400 200" className="w-full text-emerald-500 dark:text-emerald-400">
                        <defs>
                            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="currentColor" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <path d="M0 180 C 100 180, 150 150, 200 100 S 300 20, 400 20 L 400 180 L 0 180 Z" fill="url(#growthGradient)" />
                        <path d="M0 180 C 100 180, 150 150, 200 100 S 300 20, 400 20" fill="none" stroke="currentColor" strokeWidth="3" />
                        {/* Axis */}
                        <line x1="0" y1="180" x2="400" y2="180" stroke="#94a3b8" strokeWidth="1" />
                        <line x1="0" y1="0" x2="0" y2="180" stroke="#94a3b8" strokeWidth="1" />
                    </svg>
                );
            case 'time-vs-value':
                return (
                    <svg viewBox="0 0 400 200" className="w-full">
                        {/* Line 1 (Slow) */}
                        <path d="M0 180 L 400 140" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                        {/* Line 2 (Fast) */}
                        <path d="M0 180 Q 200 180 400 20" fill="none" stroke="currentColor" className="text-emerald-500 dark:text-emerald-400" strokeWidth="3" />
                        <circle cx="400" cy="20" r="4" className="fill-emerald-600 dark:fill-emerald-400" />

                        <text x="320" y="40" className="text-[10px] fill-slate-500 font-mono">With Kit</text>
                        <text x="320" y="130" className="text-[10px] fill-slate-400 font-mono">From Scratch</text>
                    </svg>
                );
            case 'market-split':
                return (
                    <svg viewBox="0 0 400 200" className="w-full flex justify-center">
                        <circle cx="200" cy="100" r="60" stroke="#e2e8f0" strokeWidth="20" fill="none" />
                        <circle cx="200" cy="100" r="60" stroke="currentColor" className="text-emerald-500 dark:text-emerald-400" strokeWidth="20" fill="none" strokeDasharray="280 377" transform="rotate(-90 200 100)" />
                        <text x="200" y="105" textAnchor="middle" className="text-2xl font-bold fill-slate-700 dark:fill-white">75%</text>
                    </svg>
                );
            case 'bar-comparison':
                return (
                    <svg viewBox="0 0 400 200" className="w-full">
                        <rect x="50" y="100" width="40" height="80" className="fill-slate-300 dark:fill-slate-700" />
                        <rect x="150" y="80" width="40" height="100" className="fill-slate-300 dark:fill-slate-700" />
                        <rect x="250" y="40" width="40" height="140" className="fill-emerald-500 dark:fill-emerald-400" />
                        <line x1="0" y1="180" x2="400" y2="180" stroke="#94a3b8" strokeWidth="1" />
                    </svg>
                );
            default:
                return null;
        }
    }

    return (
        <figure className="my-12 p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="aspect-[2/1] w-full flex items-center justify-center">
                {renderGraph()}
            </div>
            <figcaption className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 font-mono">
                {caption}
            </figcaption>
        </figure>
    );
};

export default BlogGraph;
