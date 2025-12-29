import React from 'react';
import { Listing, SectionConfig } from '../../types';

interface SectionTextProps {
    listing: Listing;
    section: SectionConfig;
}

const SectionText: React.FC<SectionTextProps> = ({ listing, section }) => {
    const { dataKey, settings } = section;

    if (!dataKey) {
        return <div className="p-4 border border-dashed border-red-300 text-red-500 text-sm">Error: No data source bound</div>;
    }

    // Resolve data value safely
    const getValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const content = getValue(listing, dataKey);

    // Context-aware styling based on dataKey (optional automagic)
    const isHeading = dataKey === 'title';
    const isMeta = dataKey.includes('creator') || dataKey === 'category';

    if (isHeading) {
        return <h2 className="text-3xl font-bold text-gray-900 mb-4">{content}</h2>;
    }

    if (isMeta) {
        return <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 font-medium">{content}</span>;
    }

    return (
        <div className={`prose max-w-none text-gray-600 ${settings?.alignment ? `text-${settings.alignment}` : ''}`}>
            {content || <span className="italic text-gray-400">Empty field</span>}
        </div>
    );
};

export default SectionText;
