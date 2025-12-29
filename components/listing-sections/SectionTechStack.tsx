import React from 'react';
import { Code2 } from 'lucide-react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionTechStack: React.FC<SectionProps> = ({ listing }) => {
    if (!listing.techStack || listing.techStack.length === 0) return null;

    return (
        <section className="mb-8">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-widest mb-4 border-l-2 border-accent-secondary pl-3">
                Technology Core
            </h3>
            <div className="flex flex-wrap gap-2">
                {listing.techStack.map((tech) => (
                    <div key={tech} className="px-3 py-1.5 bg-surfaceHighlight border border-border rounded-lg text-sm text-textMain font-medium flex items-center gap-2">
                        <Code2 size={14} className="text-textMuted" /> {tech}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SectionTechStack;
