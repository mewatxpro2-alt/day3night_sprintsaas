import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Listing, SectionType } from '../../../types';
import { Type, Image as ImageIcon, Video, User, List } from 'lucide-react';

interface Props {
    listing: Listing;
}

interface DraggableDataProps {
    id: string; // Unique source ID
    type: SectionType;
    dataKey: string;
    label: string;
    value: string | undefined;
    icon: React.ReactNode;
}

const DraggableSourceItem: React.FC<DraggableDataProps> = ({ id, type, dataKey, label, value, icon }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: id,
        data: {
            isSource: true,
            type,
            dataKey,
            label // For creating the section settings
        }
    });

    if (!value) return null; // Don't show empty fields

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-accent-primary hover:shadow-md cursor-grab active:cursor-grabbing transition-all flex items-center gap-3 ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="text-gray-400">
                {icon}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-gray-700 truncate">{label}</p>
                <p className="text-[10px] text-gray-500 truncate">{value.substring(0, 30)}...</p>
            </div>
        </div>
    );
};

const SubmissionDataPanel: React.FC<Props> = ({ listing }) => {

    const renderSection = (title: string, items: DraggableDataProps[]) => (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
            <div className="space-y-2">
                {items.map(item => (
                    <DraggableSourceItem key={item.id} {...item} />
                ))}
            </div>
        </div>
    );

    // Prepare content groups
    const textItems: DraggableDataProps[] = [
        { id: 'src_title', type: 'text_block', dataKey: 'title', label: 'Listing Title', value: listing.title, icon: <Type size={16} /> },
        { id: 'src_tagline', type: 'text_block', dataKey: 'tagline', label: 'Tagline', value: listing.tagline, icon: <Type size={16} /> },
        { id: 'src_summary', type: 'text_block', dataKey: 'short_summary', label: 'Short Summary', value: listing.short_summary, icon: <List size={16} /> },
        { id: 'src_desc', type: 'text_block', dataKey: 'description', label: 'Full Description', value: listing.description, icon: <List size={16} /> },
    ];

    const mediaItems: DraggableDataProps[] = [
        { id: 'src_thumb', type: 'media_block', dataKey: 'image', label: 'Cover Image', value: listing.image, icon: <ImageIcon size={16} /> },
    ];

    // Add screenshots
    listing.screenshot_urls?.forEach((url, idx) => {
        mediaItems.push({
            id: `src_screen_${idx}`,
            type: 'media_block',
            dataKey: `screenshot_urls.${idx}`, // Array access notation
            label: `Gallery Image ${idx + 1}`,
            value: url,
            icon: <ImageIcon size={16} />
        });
    });

    if (listing.video_url) {
        mediaItems.push({
            id: 'src_video',
            type: 'video_block',
            dataKey: 'video_url',
            label: 'Demo Video',
            value: listing.video_url,
            icon: <Video size={16} />
        });
    }

    const sellerItems: DraggableDataProps[] = [
        { id: 'src_seller_name', type: 'text_block', dataKey: 'creator.name', label: 'Seller Name', value: listing.creator.name, icon: <User size={16} /> },
        // Could drag entire seller card too?
        { id: 'src_seller_card', type: 'seller_card', dataKey: 'creator.id', label: 'Seller Profile Card', value: 'Full Card', icon: <User size={16} /> },
    ];

    return (
        <div className="p-4 overflow-y-auto h-full pb-20">
            {renderSection('Text Content', textItems)}
            {renderSection('Media Assets', mediaItems)}
            {renderSection('Seller Info', sellerItems)}
        </div>
    );
};

export default SubmissionDataPanel;
