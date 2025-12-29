import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { LayoutConfig, SectionConfig, SectionId } from '../../../types';
import { GripVertical, Plus } from 'lucide-react';

interface EditorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    layoutConfig: LayoutConfig;
    onAddSection: (sectionId: string) => void;
}

const AVAILABLE_SECTIONS: { id: string; label: string; description: string }[] = [
    { id: 'hero', label: 'Hero Section', description: 'Title, category, and key tags' },
    { id: 'media', label: 'Media Gallery', description: 'Images and video carousel' },
    { id: 'description', label: 'Description', description: 'Executive summary & details' },
    { id: 'features', label: 'Features & Files', description: 'Deliverables checklist' },
    { id: 'tech_stack', label: 'Tech Stack', description: 'Technologies used' },
    { id: 'target_audience', label: 'Target Audience', description: 'Who is this for?' },
    { id: 'pricing', label: 'Pricing Card', description: 'Purchase options' },
    { id: 'trust_badge', label: 'Trust Badge', description: 'Guarantee info' },
    { id: 'stats', label: 'Stats', description: 'Performance metrics' },
    { id: 'seller_card', label: 'Seller Profile', description: 'Creator bio and stats' },
];

const EditorSidebar: React.FC<EditorSidebarProps> = ({ isOpen, onClose, layoutConfig, onAddSection }) => {
    // Filter out sections that are already visible in the layout CONFIG
    // Wait, layoutConfig contains ALL sections, just some are !visible.
    // So we show sections where visible === false.

    const hiddenSections = layoutConfig.sections.filter(s => !s.visible);

    if (!isOpen) return null;

    return (
        <div className="absolute top-0 left-16 bottom-0 w-80 bg-white border-r border-border shadow-xl z-30 flex flex-col animate-slide-in-left">
            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-sm uppercase tracking-wider text-textMain">Add Section</h3>
                <button onClick={onClose} className="text-textMuted hover:text-textMain text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {hiddenSections.length === 0 ? (
                    <div className="text-center py-10 text-textMuted text-sm">
                        All sections are currently visible on the canvas.
                    </div>
                ) : (
                    hiddenSections.map(section => {
                        const info = AVAILABLE_SECTIONS.find(s => s.id === section.id);
                        return (
                            <div key={section.id} className="p-3 border border-dashed border-gray-300 rounded-lg hover:border-accent-primary hover:bg-accent-primary/5 transition-all group flex items-start gap-3">
                                <div className="mt-1 text-textMuted group-hover:text-accent-primary">
                                    <Plus size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-textMain">{info?.label || section.id}</h4>
                                    <p className="text-xs text-textMuted mt-1">{info?.description}</p>
                                </div>
                                <button
                                    onClick={() => onAddSection(section.id)}
                                    className="bg-accent-primary text-white text-xs px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Add
                                </button>
                            </div>
                        );
                    })
                )}

                <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="font-bold text-xs uppercase text-textMuted mb-4">Pro Tip</h4>
                    <p className="text-xs text-textSecondary leading-relaxed">
                        Drag sections directly on the canvas to reorder them. Click a section to edit its visibility and settings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EditorSidebar;
