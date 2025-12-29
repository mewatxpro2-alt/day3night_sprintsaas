import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionTrust: React.FC<SectionProps> = () => {
    return (
        <div className="flex items-start gap-3 p-4 bg-transparent border-t border-border/50 mt-4">
            <ShieldCheck size={24} className="text-textMuted shrink-0" />
            <div>
                <p className="text-xs font-bold text-textMain uppercase">SprintSaaS Guarantee</p>
                <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">
                    Code quality verified manually. Funds held in escrow until you verify the files.
                </p>
            </div>
        </div>
    );
};

export default SectionTrust;
