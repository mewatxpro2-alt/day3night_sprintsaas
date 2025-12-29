import React from 'react';
import { SectionType, Listing, LayoutConfig } from '../types';
import SectionHero from './listing-sections/SectionHero';
import SectionMedia from './listing-sections/SectionMedia';
import SectionDescription from './listing-sections/SectionDescription';
import SectionFeatures from './listing-sections/SectionFeatures';
import SectionTechStack from './listing-sections/SectionTechStack';
import SectionTargetAudience from './listing-sections/SectionTargetAudience';
import SectionPricing from './listing-sections/SectionPricing';
import SectionTrust from './listing-sections/SectionTrust';
import SectionStats from './listing-sections/SectionStats';
import SectionText from './listing-sections/SectionText';
import SellerCard from './SellerCard';
import { getLayoutConfig } from '../lib/layout-presets';

interface LayoutRendererProps {
    listing: Listing;
    customLayout?: LayoutConfig; // For admin preview
    onContactClick?: () => void;
}

export const SECTION_COMPONENTS: Record<SectionType, React.FC<any>> = {
    'hero': SectionHero,
    'media': SectionMedia,
    'description': SectionDescription,
    'features': SectionFeatures,
    'tech_stack': SectionTechStack,
    'target_audience': SectionTargetAudience,
    'pricing': SectionPricing,
    'trust_badge': SectionTrust,
    'stats': SectionStats,
    'faq': () => null,

    // New Generic Data Blocks
    'media_block': SectionMedia,
    'video_block': SectionMedia, // Reuse media player logic
    'text_block': SectionText,

    'seller_card': (props: any) => {
        // Extract visual settings for seller card
        // Use passed section OR find legacy singleton
        const sectionConfig = props.section || props.listing.layout_config?.sections?.find((s: any) => s.id === 'seller_card');
        const settings = sectionConfig?.settings || {};

        return (
            <SellerCard
                sellerId={props.listing.creator.id}
                sellerName={props.listing.creator.name || 'Creator'}
                sellerAvatar={props.listing.creator.avatar}
                isVerified={props.listing.creator.verified || false}
                projectsCompleted={props.listing.creator.projectsCompleted || 0}
                projectsSubmitted={props.listing.creator.projectsSubmitted || 0}
                ratingAverage={props.listing.creator.rating}
                ratingCount={props.listing.creator.ratingCount || 0}
                repeatBuyers={props.listing.creator.repeatBuyers || 0}
                totalSales={props.listing.creator.totalSales || 0}
                listingId={props.listing.id}
                onContactClick={props.onContactClick}
                compact={settings.compact} // Pass dynamic setting
                showVerifiedBadge={settings.showVerified} // Pass dynamic setting
            />
        );
    },
};

const LayoutRenderer: React.FC<LayoutRendererProps> = ({ listing, customLayout, onContactClick }) => {
    const config = customLayout || getLayoutConfig(listing);

    // Create an effective listing object that includes the ACTIVE layout config
    const effectiveListing = {
        ...listing,
        layout_config: config
    };

    // Group sections by area
    const mainSections = config.sections
        .filter(s => s.area === 'main' && s.visible)
        .sort((a, b) => a.order - b.order);

    const sidebarSections = config.sections
        .filter(s => s.area === 'sidebar' && s.visible)
        .sort((a, b) => a.order - b.order);

    const renderSections = (sections: typeof config.sections) => {
        return sections.map((section) => {
            const typeKey = section.type || (section.id as SectionType);
            const Component = SECTION_COMPONENTS[typeKey];

            // Fallback for unknown types or if typeKey is just a UUID without type prop (shouldn't happen with correct data)
            if (!Component) return null;

            return (
                <div key={section.id} className={section.highlighted ? 'ring-2 ring-accent-primary/20 rounded-xl p-2' : ''}>
                    <Component listing={effectiveListing} section={section} onContactClick={onContactClick} />
                </div>
            );
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative animate-fade-in">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-8 space-y-8">
                {renderSections(mainSections)}
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                {renderSections(sidebarSections)}
            </div>
        </div>
    );
};

export default LayoutRenderer;
