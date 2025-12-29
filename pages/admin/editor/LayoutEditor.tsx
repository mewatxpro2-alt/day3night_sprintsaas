import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    defaultDropAnimationSideEffects,
    useDndMonitor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import {
    ChevronLeft, Monitor, Smartphone, RotateCcw, Save, Layers,
    Settings, Image as ImageIcon, Type, MousePointer2, Undo, Redo,
    Eye, ArrowLeft, Database, Check, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Listing, LayoutConfig, LayoutPreset, SectionConfig, SectionType } from '../../../types';
import { getLayoutConfig, LAYOUT_PRESETS } from '../../../lib/layout-presets';
import EditorCanvas from './EditorCanvas';
import EditorSidebar from './EditorSidebar';
import SubmissionDataPanel from './SubmissionDataPanel';
import toast from 'react-hot-toast';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const ToolButton = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button onClick={onClick} className={`p-3 rounded-xl transition-all group relative ${active ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30' : 'text-textMuted hover:bg-gray-50 hover:text-textMain'}`}>
        {icon}
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
            {label}
        </span>
    </button>
);

const LayoutEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [listing, setListing] = useState<Listing | null>(null);
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
    const [loading, setLoading] = useState(true);

    // History State
    const [history, setHistory] = useState<LayoutConfig[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Editor State
    const [activeTab, setActiveTab] = useState<'data' | 'sections'>('data');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [dragItem, setDragItem] = useState<any>(null); // Store visual data for overlay

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchListing = useCallback(async (listingId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    creator:profiles!listings_creator_id_fkey(id, full_name, avatar_url, is_verified_seller, seller_level, rating_average, rating_count, total_sales)
                `)
                .eq('id', listingId)
                .single();

            if (error) throw error;

            const mapped = {
                ...data,
                creator: {
                    id: data.creator?.id,
                    name: data.creator?.full_name || 'Creator',
                    avatar: data.creator?.avatar_url,
                    verified: data.creator?.is_verified_seller,
                    rating: data.creator?.rating_average || 0,
                    ratingCount: data.creator?.rating_count || 0,
                    totalSales: data.creator?.total_sales || 0,
                    projectsCompleted: data.creator?.total_sales || 0,
                }
            } as Listing;

            setListing(mapped);
            // Ensure config exists
            let initialConfig = data.layout_config || getLayoutConfig(mapped);
            // Ensure IDs are strings if coming from old DB
            initialConfig.sections = initialConfig.sections.map((s: any) => ({ ...s, id: String(s.id) }));

            setLayoutConfig(initialConfig);
            setHistory([initialConfig]);
            setHistoryIndex(0);
        } catch (err) {
            console.error('Error fetching listing:', err);
            toast.error('Failed to load listing');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) fetchListing(id);
    }, [id, fetchListing]);

    const handleConfigChange = useCallback((newConfig: LayoutConfig) => {
        if (JSON.stringify(newConfig) === JSON.stringify(layoutConfig)) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newConfig);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setLayoutConfig(newConfig);
        setHasUnsavedChanges(true);
    }, [layoutConfig, history, historyIndex]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
        setDragItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setDragItem(null);

        if (!layoutConfig || !over) return;

        // CASE 1: Adding New Item from Sidebar
        if (active.data.current?.isSource) {
            const type = active.data.current.type as SectionType;
            const dataKey = active.data.current.dataKey;

            const newItem: SectionConfig = {
                id: generateId(),
                type,
                dataKey,
                visible: true,
                order: 999,
                area: 'main',
                settings: {}
            };

            // Calculate Insertion Index
            const sections = [...layoutConfig.sections];
            const overId = over.id;
            const overIndex = sections.findIndex(s => s.id === overId);

            if (overIndex !== -1) {
                // Determine area from the target section
                newItem.area = sections[overIndex].area;
                // Insert after
                sections.splice(overIndex + 1, 0, newItem);
            } else {
                // If dropped directly on a generic zone container (if we implemented it) or fallback
                sections.push(newItem);
            }

            // Reindex
            const reordered = sections.map((s, i) => ({ ...s, order: i }));
            handleConfigChange({ ...layoutConfig, sections: reordered });
            toast.success('Block added');
            return;
        }

        // CASE 2: Reordering
        if (active.id !== over.id) {
            const oldIndex = layoutConfig.sections.findIndex(s => s.id === active.id);
            const newIndex = layoutConfig.sections.findIndex(s => s.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSections = arrayMove(layoutConfig.sections, oldIndex, newIndex);
                // Also update area if crossing zones handled in onDragOver? 
                // EditorCanvas handles cross-zone during DragOver update? Not anymore, it was removed.
                // We should handle cross-zone reorder here.

                const activeSection = layoutConfig.sections[oldIndex];
                const overSection = layoutConfig.sections[newIndex];

                // If moved to different area
                if (activeSection.area !== overSection.area) {
                    newSections[oldIndex] = { ...newSections[oldIndex], area: overSection.area };
                    // Refilter and fix? logic is complex.
                    // Simple approach: arrayMove moves it in the flattened list.
                    // But we perform area check:
                    // The section at newIndex NOW has the target area.
                    // We should force the moved item to take the new area.
                    // The item moved TO 'newIndex'.
                    // Wait, arrayMove just swaps in the array. 
                    // We need to set the area of the moved item to the area of the generic container it is in?
                    // Or better: the overSection's area.
                    const movedItem = newSections[newIndex]; // This is the item we moved
                    movedItem.area = overSection.area;
                }

                // Re-assign orders
                const reordered = newSections.map((s, idx) => ({ ...s, order: idx }));
                handleConfigChange({ ...layoutConfig, sections: reordered });
            }
        }
    };

    const handleSave = async () => {
        if (!listing || !layoutConfig) return;
        setLoading(true);

        const cleanConfig = {
            ...layoutConfig,
            sections: layoutConfig.sections.map(({ collapsed, highlighted, ...s }) => ({
                ...s,
                highlighted: false // Clear highlights on save
            }))
        };

        try {
            const { error } = await supabase
                .from('listings')
                .update({ layout_config: cleanConfig })
                .eq('id', listing.id);

            if (error) throw error;
            setHasUnsavedChanges(false);
            toast.success('Layout saved');
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setLayoutConfig(history[newIndex]);
            setHasUnsavedChanges(true);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setLayoutConfig(history[newIndex]);
            setHasUnsavedChanges(true);
        }
    };

    if (loading || !listing || !layoutConfig) {
        return <div className="flex items-center justify-center h-screen bg-gray-50">Loading Editor...</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
                {/* TOP BAR */}
                <div className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/layout-composer')} className="p-2 hover:bg-gray-100 rounded-full text-textMuted transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <h1 className="font-bold text-sm text-textMain">{listing.title}</h1>
                            <p className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Visual Editor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mr-4">
                            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded hover:bg-white disabled:opacity-30"><Undo size={16} /></button>
                            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded hover:bg-white disabled:opacity-30"><Redo size={16} /></button>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white shadow' : 'text-gray-400'}`}><Monitor size={18} /></button>
                            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white shadow' : 'text-gray-400'}`}><Smartphone size={18} /></button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${hasUnsavedChanges
                                ? 'bg-accent-primary text-white shadow hover:bg-accent-primary/90'
                                : 'bg-gray-100 text-textMuted'
                                }`}
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="flex flex-1 overflow-hidden relative">
                    {/* LEFT TOOLBAR */}
                    <div className="w-16 bg-white border-r border-border flex flex-col items-center py-4 gap-4 z-40 relative shadow-lg">
                        <ToolButton
                            icon={<Database size={20} />}
                            active={isSidebarOpen && activeTab === 'data'}
                            onClick={() => { setIsSidebarOpen(true); setActiveTab('data'); }}
                            label="Content Data"
                        />
                        <ToolButton
                            icon={<Layers size={20} />}
                            active={isSidebarOpen && activeTab === 'sections'}
                            onClick={() => { setIsSidebarOpen(true); setActiveTab('sections'); }}
                            label="Saved Blocks"
                        />
                        <div className="mt-auto">
                            <ToolButton icon={<Settings size={20} />} label="Settings" />
                        </div>
                    </div>

                    {/* SIDEBAR PANEL */}
                    {isSidebarOpen && (
                        <div className="w-80 bg-white border-r border-border flex flex-col z-30 animate-slide-in-left shadow-xl relative">
                            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-textMain">
                                    {activeTab === 'data' ? 'Submission Content' : 'Section Blocks'}
                                </h3>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black"><X size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {activeTab === 'data' ? (
                                    <SubmissionDataPanel listing={listing} />
                                ) : (
                                    <EditorSidebar
                                        isOpen={true}
                                        onClose={() => { }}
                                        layoutConfig={layoutConfig}
                                        onAddSection={(type) => { /* Legacy handler if needed */ }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* MAIN CANVAS */}
                    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] relative dotted-pattern" onClick={() => setSelectedSectionId(null)}>
                        <EditorCanvas
                            listing={listing}
                            layoutConfig={layoutConfig}
                            selectedSectionId={selectedSectionId}
                            onSelectSection={setSelectedSectionId}
                            onToggleVisibility={(id) => {
                                const newSections = layoutConfig.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
                                handleConfigChange({ ...layoutConfig, sections: newSections });
                            }}
                            onDeleteSection={(id) => {
                                const newSections = layoutConfig.sections.filter(s => s.id !== id);
                                handleConfigChange({ ...layoutConfig, sections: newSections });
                            }}
                            previewDevice={previewDevice}
                        />
                    </div>

                    {/* RIGHT PROPERTIES PANEL */}
                    {selectedSectionId && (
                        <div className="w-80 bg-white border-l border-border h-full absolute right-0 top-0 bottom-0 shadow-lg animate-slide-in-right z-30 p-4">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                                <h3 className="font-bold text-sm text-textMain capitalize">Properties</h3>
                                <button onClick={() => setSelectedSectionId(null)}><X size={16} /></button>
                            </div>

                            {/* Property Forms */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-textMuted mb-1 block">ID</label>
                                    <div className="text-xs font-mono bg-gray-50 p-2 rounded truncate">{selectedSectionId}</div>
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                                    Visual settings for this block are available here. Content is managed via the Data Panel.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* DRAG OVERLAY FOR SIDEBAR ITEMS */}
                <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.8' } } }) }}>
                    {activeDragId && dragItem?.isSource ? (
                        <div className="p-3 bg-white border border-accent-primary shadow-xl rounded-lg w-64 rotate-3 opacity-90 cursor-grabbing">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                    <Layers size={16} className="text-accent-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{dragItem.label}</p>
                                    <p className="text-[10px] text-gray-500">Drop to add to layout</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default LayoutEditor;
