import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, EyeOff, Lock } from 'lucide-react';

interface DraggableBlockProps {
    id: string;
    children: React.ReactNode;
    isSelected?: boolean;
    onSelect?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onToggleVisibility?: () => void;
    isVisible?: boolean;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({
    id,
    children,
    isSelected,
    onSelect,
    onDelete,
    onDuplicate,
    onToggleVisibility,
    isVisible = true
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative transition-all duration-200 ${isSelected ? 'ring-2 ring-accent-primary ring-offset-2 rounded-xl z-10' : 'hover:ring-1 hover:ring-border rounded-xl'
                } ${!isVisible ? 'opacity-50 grayscale' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
            }}
        >
            {/* Hover Drag Handle (Left) */}
            <div
                {...attributes}
                {...listeners}
                className={`absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-textMuted hover:text-textMain transition-opacity ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <GripVertical size={20} />
            </div>

            {/* Selected Toolbar (Top Right) */}
            {isSelected && (
                <div className="absolute -top-10 right-0 flex items-center gap-1 bg-gray-900 text-white p-1 rounded-lg shadow-xl animate-scale-in origin-bottom z-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(); }}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                        title={isVisible ? "Hide" : "Show"}
                    >
                        <EyeOff size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={14} />
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="p-1.5 hover:bg-red-500 rounded transition-colors text-red-300 hover:text-white"
                        title="Remove"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Content */}
            <div className={!isVisible ? 'pointer-events-none select-none' : ''}>
                {children}
            </div>

            {/* Hidden Overlay Pattern */}
            {!isVisible && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider opacity-80">
                        Hidden
                    </span>
                </div>
            )}
        </div>
    );
};

export default DraggableBlock;
