import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Play, ExternalLink, Globe, ShieldCheck, MessageCircle, Star,
    CheckCircle, Lock, PackageCheck, Code2, Video as VideoIcon,
    Maximize2, ArrowLeft, ChevronRight, ShoppingCart, Heart, Share2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useListing } from '../hooks/useListings';
import { useToggleSave, useSavedItems } from '../hooks/useSavedItems';
import Button from './Button';
import { Listing } from '../types';

interface ListingDetailModalProps {
    listingId: string;
    onClose: () => void;
}

const ListingDetailModal: React.FC<ListingDetailModalProps> = ({ listingId, onClose }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { listing, isLoading, error } = useListing(listingId);
    const { toggleSave } = useToggleSave();
    const { savedListingIds, refetch } = useSavedItems();

    const [isPreviewActive, setIsPreviewActive] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-surface p-8 rounded-2xl shadow-xl border border-border">
                    <div className="animate-spin w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-textMuted font-medium text-sm">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!listing) return null;

    const isSaved = savedListingIds.has(listing.id);
    const allImages = [listing.image, ...(listing.screenshot_urls || [])].filter(Boolean) as string[];

    const handleToggleSave = async () => {
        if (!isAuthenticated) return navigate('/signin');
        await toggleSave(listing.id);
        refetch();
    };

    // Full Screen Carousel Content
    if (showFullPreview) {
        return (
            <div className="fixed inset-0 z-[60] bg-black flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                    <h3 className="text-white font-medium">{listing.title} <span className="text-white/50 mx-2">•</span> <span className="text-white/70">Gallery</span></h3>
                    <button
                        onClick={() => setShowFullPreview(false)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                    <img
                        src={allImages[currentImageIndex]}
                        className="max-h-full max-w-full object-contain"
                        alt={`Preview ${currentImageIndex + 1}`}
                    />

                    {/* Arrows */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Thumbs */}
                <div className="h-24 bg-black/90 contrast-125 flex items-center gap-2 px-4 overflow-x-auto">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-16 w-24 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-accent-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8" role="dialog">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-background rounded-2xl shadow-2xl border border-border flex flex-col md:flex-row overflow-hidden animate-scale-in">

                {/* Close Button Mobile/Absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-surface border border-border shadow-sm text-textMuted hover:text-textMain transition-all"
                >
                    <X size={20} />
                </button>

                {/* LEFT COLUMN: Preview (60%) */}
                <div className="w-full md:w-[60%] bg-[#0f172a] relative flex flex-col group overflow-hidden">
                    {/* Main Visual */}
                    <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black/20">
                        {listing.preview_url && isPreviewActive ? (
                            <>
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
                                    </div>
                                )}
                                <iframe
                                    src={listing.preview_url}
                                    className="w-full h-full border-0"
                                    title="Live Preview"
                                    onLoad={() => setIframeLoaded(true)}
                                    allowFullScreen
                                />
                            </>
                        ) : (
                            <>
                                <img
                                    src={listing.image || 'https://picsum.photos/1200/800'}
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                    alt="Preview"
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                {/* Center Action */}
                                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                    <button
                                        onClick={() => setShowFullPreview(true)}
                                        className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <Maximize2 size={18} /> View Gallery
                                    </button>
                                    {listing.preview_url && (
                                        <button
                                            onClick={() => setIsPreviewActive(true)}
                                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-white/20 hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Play size={18} fill="currentColor" /> Live Demo
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom Bar on Left - Tech Stack */}
                    <div className="p-4 bg-background/5 border-t border-white/10 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                        <div className="flex items-center gap-2 text-white/70 text-sm overflow-x-auto no-scrollbar">
                            <span className="font-medium text-white shrink-0">Built with:</span>
                            {listing.techStack?.map(tech => (
                                <span key={tech} className="px-2 py-1 rounded-md bg-white/10 border border-white/5 whitespace-nowrap">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Details (40%) */}
                <div className="w-full md:w-[40%] bg-surface flex flex-col h-full border-l border-border/50">

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-2xl md:text-3xl font-display font-bold text-textMain leading-tight">{listing.title}</h2>
                            </div>

                            {listing.tagline && (
                                <p className="text-lg text-textSecondary leading-relaxed">{listing.tagline}</p>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border overflow-hidden">
                                    {listing.creator?.avatar ? (
                                        <img src={listing.creator.avatar} alt={listing.creator.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{listing.creator?.name?.[0]}</div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-textMain">{listing.creator?.name}</span>
                                    <span className="text-xs text-textMuted">Verified Creator</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div className="p-5 rounded-xl bg-surfaceHighlight/50 border border-border space-y-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm text-textMuted mb-1">Standard License</p>
                                    <div className="text-3xl font-bold text-textMain">{listing.price === 0 ? 'Free' : `$${listing.price}`}</div>
                                </div>
                                {isSaved ? (
                                    <button onClick={handleToggleSave} className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                        <Heart fill="currentColor" size={20} />
                                    </button>
                                ) : (
                                    <button onClick={handleToggleSave} className="p-2 rounded-full bg-surface border border-border text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors">
                                        <Heart size={20} />
                                    </button>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full h-12 text-base shadow-lg shadow-accent-primary/20"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        navigate('/signin', { state: { from: `/checkout/${listing.id}?license=standard` } });
                                    } else {
                                        navigate(`/checkout/${listing.id}?license=standard`);
                                    }
                                }}
                            >
                                {listing.price === 0 ? 'Get it Free' : 'Purchase License'}
                            </Button>

                            <p className="text-xs text-center text-textMuted flex items-center justify-center gap-1">
                                <Lock size={12} /> Secure transaction via Stripe
                            </p>
                        </div>

                        {/* Description & Features */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-textMain mb-2">About this blueprint</h3>
                                <p className="text-textSecondary text-sm leading-relaxed whitespace-pre-line">
                                    {listing.description}
                                </p>
                            </div>

                            {/* Features */}
                            {listing.features && (
                                <div>
                                    <h3 className="font-semibold text-textMain mb-3">What's included</h3>
                                    <div className="space-y-2">
                                        {(listing.features as string).split('\n').slice(0, 5).map((feat, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-sm text-textSecondary">
                                                <CheckCircle size={16} className="text-accent-primary shrink-0 mt-0.5" />
                                                <span>{feat.replace(/^[•-]\s*/, '')}</span>
                                            </div>
                                        ))}
                                        {(listing.features as string).split('\n').length > 5 && (
                                            <p className="text-xs text-textMuted italic pt-1">...and more inside</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border bg-surface flex justify-between items-center text-xs text-textMuted">
                        <button className="flex items-center gap-1.5 hover:text-textMain transition-colors">
                            <Share2 size={14} /> Share
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-textMain transition-colors" onClick={() => navigate(`/listing/${listing.id}`)}>
                            <ExternalLink size={14} /> View Full Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailModal;
