import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
    className?: string; // Allow overrides
}

const SectionHero: React.FC<SectionProps> = ({ listing }) => {
    const navigate = useNavigate();

    return (
        <div className="mb-6 animate-fade-in">
            <button
                onClick={() => navigate('/mvp-kits')}
                className="flex items-center gap-1.5 text-textMuted hover:text-textMain transition-colors mb-4 text-xs font-semibold uppercase tracking-wider"
            >
                <ArrowLeft size={14} /> Back to Marketplace
            </button>
            <div className="flex items-center gap-3 mb-1">
                {listing.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border text-textSecondary uppercase tracking-widest">
                        {listing.category}
                    </span>
                )}
                {listing.isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System
                    </span>
                )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-textMain tracking-tight">
                {listing.title}
            </h1>
            {listing.tagline && (
                <p className="text-lg text-textSecondary mt-2 font-light">
                    {listing.tagline}
                </p>
            )}
        </div>
    );
};

export default SectionHero;
