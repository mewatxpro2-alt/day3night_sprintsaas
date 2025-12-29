import React from 'react';
import {
    useDndContext,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Listing, LayoutConfig, SectionConfig, SectionType } from '../../../types';
import { SECTION_COMPONENTS } from '../../../components/LayoutRenderer';
import DraggableBlock from './DraggableBlock';

interface EditorCanvasProps {
    layoutConfig: LayoutConfig;
    listing: Listing;
    selectedSectionId?: string | null;
    onSelectSection: (id: string | null) => void;
    onToggleVisibility: (id: string) => void;
    onDeleteSection: (id: string) => void;
    previewDevice: 'desktop' | 'mobile';
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
    layoutConfig,
    listing,
    selectedSectionId,
    onSelectSection,
    onToggleVisibility,
    onDeleteSection,
    previewDevice
}) => {
    // We can access active ID from context if needed for overlay, 
    // but DragOverlay should ideally be at root. 
    // However, if we put DragOverlay here, it works ONLY if DndContext wraps this.
    // Parent LayoutEditor will wrap this.
    const { active } = useDndContext();

    // Create effective listing with current config for preview
    const effectiveListing = { ...listing, layout_config: layoutConfig };

    // Filter sections by area
    const mainSections = layoutConfig.sections.filter(s => s.area === 'main');
    const sidebarSections = layoutConfig.sections.filter(s => s.area === 'sidebar');

    const renderList = (sections: SectionConfig[], zoneName: string) => {
        return (
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="text-xs font-bold uppercase text-gray-300 mb-2 tracking-widest text-center border-b border-gray-100 pb-2">{zoneName}</div>
                <div className="space-y-6 min-h-[100px] p-2 rounded-xl border-2 border-transparent hover:border-dashed hover:border-gray-200 transition-colors">
                    {sections.map(section => (
                        <DraggableBlock
                            key={section.id}
                            id={section.id}
                            isSelected={selectedSectionId === section.id}
                            isVisible={section.visible}
                            onSelect={() => onSelectSection(section.id)}
                            onToggleVisibility={() => onToggleVisibility(section.id)}
                            onDelete={() => onDeleteSection(section.id)}
                        >
                            <div className={`pointer-events-none ${!section.visible ? 'opacity-50 grayscale' : ''}`}>
                                <SingleSectionRenderer section={section} listing={effectiveListing} />
                            </div>
                        </DraggableBlock>
                    ))}
                    {sections.length === 0 && (
                        <div className="h-20 flex items-center justify-center text-gray-300 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                            Drop items here
                        </div>
                    )}
                </div>
            </SortableContext>
        );
    };

    return (
        <div
            className={`mx-auto bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden relative ${previewDevice === 'mobile' ? 'w-[375px] min-h-[812px] rounded-3xl border-8 border-gray-800 my-8' : 'w-full max-w-[1240px] min-h-screen pt-12 pb-20 px-8'
                }`}
            onClick={(e) => {
                e.stopPropagation();
                onSelectSection(null);
            }}
        >
            {/* Header Area (Visual context) */}
            <div className="mb-8 pointer-events-none opacity-50">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-64 bg-gray-100 rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
                {/* Main Content Zone */}
                <div className="lg:col-span-8">
                    {renderList(mainSections, 'Main Content Zone')}
                </div>

                {/* Sidebar Zone */}
                <div className="lg:col-span-4">
                    {renderList(sidebarSections, 'Sticky Sidebar Zone')}
                </div>
            </div>

            {/* Local DragOverlay for sorting previews within canvas */}
            {/* Note: If dragging from sidebar, the overlay comes from Sidebar or LayoutEditor. */}
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                {active?.data?.current?.type && !active.data.current.isSource ? (
                    <div className="bg-white p-4 rounded-xl shadow-2xl ring-2 ring-accent-primary opacity-90 rotate-2 cursor-grabbing scale-95">
                        <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                    </div>
                ) : null}
            </DragOverlay>
        </div>
    );
};

// Internal Helper using Shared Components
const SingleSectionRenderer: React.FC<{ section: SectionConfig, listing: Listing }> = ({ section, listing }) => {
    // Resolve Component
    const typeKey = section.type || (section.id as SectionType);
    const Component = SECTION_COMPONENTS[typeKey];

    if (!Component) {
        return <div className="p-4 border border-dashed border-red-300 text-red-500 rounded text-xs">Unknown: {section.id}</div>;
    }

    return <Component listing={listing} section={section} />;
}

export default EditorCanvas;
