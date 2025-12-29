import React from 'react';
import { Listing, SectionConfig } from '../../types';
import { Play } from 'lucide-react';

interface SectionMediaProps {
    listing: Listing;
    section?: SectionConfig;
}

const SectionMedia: React.FC<SectionMediaProps> = ({ listing, section }) => {
    // Extract settings if available
    // Fallback to finding 'media' ID for backward validation or use passed section
    const config = section || listing.layout_config?.sections?.find(s => s.id === 'media');
    const settings = config?.settings || {};
    const aspectRatio = settings.aspectRatio || '16/9';
    const objectFit = settings.objectFit || 'cover';

    // Resolve Image/Video Source
    let mediaSrc = listing.image;

    // Explicitly check for video_url if likely video block
    if (config?.type === 'video_block' && listing.video_url) {
        mediaSrc = listing.video_url;
    } else if (config?.dataKey) {
        // Safe get from dataKey
        const val = config.dataKey.split('.').reduce((acc: any, part) => acc && acc[part], listing);

        if (typeof val === 'string') {
            mediaSrc = val;
        } else if (Array.isArray(val) && val.length > 0) {
            mediaSrc = val[0]; // Take first if array
        }
    }

    // Determine if content is video
    const isVideo = config?.type === 'video_block' ||
        config?.dataKey?.includes('video') ||
        (typeof mediaSrc === 'string' && mediaSrc.match(/\.(mp4|webm)|youtube\.com|youtu\.be|vimeo\.com/i));

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case '4/3': return 'aspect-[4/3]';
            case '1/1': return 'aspect-square';
            default: return 'aspect-video'; // 16/9
        }
    };

    const getObjectFitClass = () => {
        switch (objectFit) {
            case 'contain': return 'object-contain';
            default: return 'object-cover';
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Simple ID extraction
            const id = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${id}?autoplay=0&controls=1`;
        }
        if (url.includes('vimeo.com')) {
            const id = url.split('/').pop();
            return `https://player.vimeo.com/video/${id}`;
        }
        return url;
    };

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden p-1 shadow-sm">
            <div className={`w-full ${getAspectRatioClass()} relative bg-black/5 rounded-lg overflow-hidden group`}>
                {isVideo ? (
                    mediaSrc?.match(/\.(mp4|webm)$/i) ? (
                        <video
                            src={mediaSrc}
                            controls
                            className={`w-full h-full ${getObjectFitClass()} bg-black`}
                        />
                    ) : (
                        <iframe
                            src={getEmbedUrl(mediaSrc)}
                            className={`w-full h-full ${getObjectFitClass()}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )
                ) : (
                    <>
                        <img
                            src={mediaSrc}
                            alt={listing.title}
                            className={`w-full h-full ${getObjectFitClass()} transition-transform duration-700 group-hover:scale-105`}
                            onError={(e) => {
                                // Fallback to placeholder if image fails
                                e.currentTarget.src = 'https://via.placeholder.com/800x450?text=No+Media';
                            }}
                        />

                        {/* Play Button Overlay (Visual hint for generic media blocks that COULD be video) */}
                        {(config?.dataKey?.includes('video') || listing.video_url) && !isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play fill="white" className="text-white ml-1" />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SectionMedia;
