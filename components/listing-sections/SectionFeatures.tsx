import React from 'react';
import { PackageCheck, Clock } from 'lucide-react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionFeatures: React.FC<SectionProps> = ({ listing }) => {
    if (!listing.features && (!listing.deliverables || listing.deliverables.length === 0) && !listing.setup_time) {
        return null;
    }

    return (
        <section className="mb-8">
            <h3 className="text-sm font-bold text-textMain uppercase tracking-widest mb-4 border-l-2 border-primary pl-3">
                Blueprint Contents
            </h3>

            {listing.features && (
                <div className="mb-6 bg-surfaceHighlight/30 rounded-xl p-5 border border-border">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-textSecondary leading-relaxed">
                        {listing.features}
                    </pre>
                </div>
            )}

            {listing.deliverables && listing.deliverables.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-bold text-textMuted uppercase mb-3">Included Files</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.deliverables.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                                <PackageCheck size={16} className="text-accent-primary shrink-0" />
                                <span className="text-sm text-textMain">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Setup Info */}
            {listing.setup_time && (
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Estimated Setup Time</p>
                        <p className="text-xs opacity-80">{listing.setup_time}</p>
                    </div>
                </div>
            )}
        </section>
    );
};

export default SectionFeatures;
