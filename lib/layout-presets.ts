import { LayoutConfig, SectionConfig, LayoutPreset } from '../types';

export const DEFAULT_SECTIONS: SectionConfig[] = [
    { id: 'hero', visible: true, order: 0, area: 'main' },
    { id: 'media', visible: true, order: 1, area: 'main' },
    { id: 'stats', visible: true, order: 2, area: 'main' },
    { id: 'description', visible: true, order: 3, area: 'main' },
    { id: 'target_audience', visible: true, order: 4, area: 'main' },
    { id: 'tech_stack', visible: true, order: 5, area: 'main' },
    { id: 'features', visible: true, order: 6, area: 'main' },

    { id: 'pricing', visible: true, order: 0, area: 'sidebar' },
    { id: 'seller_card', visible: true, order: 1, area: 'sidebar' },
    { id: 'trust_badge', visible: true, order: 2, area: 'sidebar' }
];

export const LAYOUT_PRESETS: Record<LayoutPreset, LayoutConfig> = {
    'balanced': {
        preset: 'balanced',
        sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
    },
    'visual-first': {
        preset: 'visual-first',
        sections: [
            { id: 'media', visible: true, order: 0, area: 'main', highlighted: true }, // Media moves to top
            { id: 'hero', visible: true, order: 1, area: 'main' },
            { id: 'features', visible: true, order: 2, area: 'main' },
            { id: 'description', visible: true, order: 3, area: 'main' },
            { id: 'tech_stack', visible: true, order: 4, area: 'main' },
            { id: 'stats', visible: true, order: 5, area: 'main' },
            { id: 'target_audience', visible: true, order: 6, area: 'main' },

            { id: 'pricing', visible: true, order: 0, area: 'sidebar' },
            { id: 'seller_card', visible: true, order: 1, area: 'sidebar' },
            { id: 'trust_badge', visible: true, order: 2, area: 'sidebar' }
        ]
    },
    'trust-first': {
        preset: 'trust-first',
        sections: [
            { id: 'hero', visible: true, order: 0, area: 'main' },
            { id: 'stats', visible: true, order: 1, area: 'main', highlighted: true },
            { id: 'seller_card', visible: true, order: 2, area: 'main' }, // Seller moves to main!
            { id: 'description', visible: true, order: 3, area: 'main' },
            { id: 'media', visible: true, order: 4, area: 'main' },
            { id: 'features', visible: true, order: 5, area: 'main' },

            { id: 'pricing', visible: true, order: 0, area: 'sidebar' },
            { id: 'trust_badge', visible: true, order: 1, area: 'sidebar' },
            { id: 'tech_stack', visible: true, order: 2, area: 'sidebar' } // Stack moves to sidebar
        ]
    },
    'technical-first': {
        preset: 'technical-first',
        sections: [
            { id: 'hero', visible: true, order: 0, area: 'main' },
            { id: 'tech_stack', visible: true, order: 1, area: 'main', highlighted: true },
            { id: 'features', visible: true, order: 2, area: 'main' }, // Code contents
            { id: 'media', visible: true, order: 3, area: 'main' },
            { id: 'description', visible: true, order: 4, area: 'main' },
            { id: 'stats', visible: true, order: 5, area: 'main' },

            { id: 'pricing', visible: true, order: 0, area: 'sidebar' },
            { id: 'seller_card', visible: true, order: 1, area: 'sidebar' },
            { id: 'trust_badge', visible: true, order: 2, area: 'sidebar' },
        ]
    },
    'marketplace-classic': {
        preset: 'marketplace-classic',
        sections: JSON.parse(JSON.stringify(DEFAULT_SECTIONS)) // Same as balanced for now
    },
    'minimal': {
        preset: 'minimal',
        sections: [
            { id: 'hero', visible: true, order: 0, area: 'main' },
            { id: 'media', visible: true, order: 1, area: 'main' },
            { id: 'pricing', visible: true, order: 2, area: 'main' }, // Pricing in main!
            { id: 'description', visible: true, order: 3, area: 'main' },

            { id: 'stats', visible: false, order: 99, area: 'main' },
            { id: 'features', visible: false, order: 99, area: 'main' },
            { id: 'tech_stack', visible: false, order: 99, area: 'main' },
            { id: 'target_audience', visible: false, order: 99, area: 'main' },

            { id: 'seller_card', visible: true, order: 0, area: 'sidebar' },
            { id: 'trust_badge', visible: true, order: 1, area: 'sidebar' }
        ]
    }
};

export const getLayoutConfig = (listing: any): LayoutConfig => {
    if (listing?.layout_config) {
        return listing.layout_config;
    }
    return LAYOUT_PRESETS['balanced'];
};
