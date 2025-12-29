import React from 'react';
import { Listing } from '../../types';

interface SectionProps {
    listing: Listing;
}

const SectionStats: React.FC<SectionProps> = ({ listing }) => {
    // Placeholder for now, as stats are not heavily used in current design
    // Could track views, likes, etc.
    return null;
};

export default SectionStats;
