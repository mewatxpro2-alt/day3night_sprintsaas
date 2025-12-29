import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionTargetAudience: React.FC<SectionProps> = ({ listing }) => {
    if ((!listing.perfect_for || listing.perfect_for.length === 0) && (!listing.not_for || listing.not_for.length === 0)) {
        return null;
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {listing.perfect_for && listing.perfect_for.length > 0 && (
                <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100">
                    <h4 className="flex items-center gap-2 font-bold text-emerald-900 text-sm mb-3">
                        <CheckCircle size={16} className="text-emerald-500" /> Best For
                    </h4>
                    <ul className="space-y-2">
                        {listing.perfect_for.map((item, i) => (
                            <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                                <span className="block w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {listing.not_for && listing.not_for.length > 0 && (
                <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-100">
                    <h4 className="flex items-center gap-2 font-bold text-rose-900 text-sm mb-3">
                        <XCircle size={16} className="text-rose-500" /> Not For
                    </h4>
                    <ul className="space-y-2">
                        {listing.not_for.map((item, i) => (
                            <li key={i} className="text-sm text-rose-800 flex items-start gap-2">
                                <span className="block w-1 h-1 rounded-full bg-rose-400 mt-2 shrink-0" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
};

export default SectionTargetAudience;
