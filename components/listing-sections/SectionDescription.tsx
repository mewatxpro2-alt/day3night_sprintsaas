import React from 'react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionDescription: React.FC<SectionProps> = ({ listing }) => {
    return (
        <section className="mb-8">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-widest mb-3 border-l-2 border-accent-primary pl-3">
                Executive Summary
            </h3>
            {listing.short_summary && (
                <p className="text-lg text-textSecondary font-light leading-relaxed italic mb-4">
                    "{listing.short_summary}"
                </p>
            )}
            <div className="prose prose-sm max-w-none text-textSecondary leading-7">
                {listing.description}
            </div>
        </section>
    );
};

export default SectionDescription;
