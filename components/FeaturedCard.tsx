import React, { useState, MouseEvent } from 'react';
import { Heart, ChevronLeft, ChevronRight, ImageIcon, CheckCircle, Sparkles } from 'lucide-react';
import type { Listing } from '../types';

interface FeaturedCardProps {
  listing: Listing;
  onClick: (id: string) => void;
  isPurchased?: boolean;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ listing, onClick, isPurchased = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const allImages = [
    listing.image,
    ...(listing.screenshot_urls || [])
  ].filter(Boolean) as string[];

  const handlePrevImage = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div
      className="group flex flex-col h-full bg-surface border border-border/60 hover:border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] cursor-pointer"
      onClick={() => onClick(listing.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Content Area - Full Width */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surfaceHighlight">

        {/* Images Carousel */}
        {allImages.length > 0 ? (
          <div className="relative w-full h-full bg-[#f8fafc] dark:bg-[#0f172a]">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <img
                  src={img}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surfaceHighlight text-textMuted">
            <ImageIcon size={32} strokeWidth={1.5} />
          </div>
        )}

        {/* Floating Badges - Top Left */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          {isPurchased ? (
            <span className="px-2.5 py-1 rounded-full bg-accent-primary/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1 ring-1 ring-white/20">
              <CheckCircle size={10} strokeWidth={3} />
              OWNED
            </span>
          ) : (
            <>
              {listing.featured && (
                <span className="self-start px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1 ring-1 ring-white/20">
                  <Sparkles size={10} strokeWidth={2.5} />
                  FEATURED
                </span>
              )}
            </>
          )}
        </div>

        {/* Carousel Controls */}
        {allImages.length > 1 && (
          <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-black/70 flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 shadow-lg border border-black/5"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-black/70 flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 shadow-lg border border-black/5"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>

            {/* Minimal Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-sm">
              {allImages.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white scale-100' : 'bg-white/40 scale-75'
                    }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Like Button */}
        <button
          className={`absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 transition-all duration-300 shadow-sm hover:scale-110 hover:text-red-500 hover:bg-white ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Hook up toggleSave logic
          }}
        >
          <Heart size={16} strokeWidth={listing.likes > 0 ? 0 : 2} className={listing.likes > 0 ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      {/* Info Content - With Padding and Border Top separation if needed, or just flow */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Title & Tagline */}
            <div>
              <h3 className="text-[17px] font-display font-semibold text-textMain leading-[1.3] line-clamp-1 group-hover:text-accent-primary transition-colors">
                {listing.title}
              </h3>
              {listing.tagline && (
                <p className="text-[13px] text-textSecondary line-clamp-1 font-medium opacity-90">
                  {listing.tagline}
                </p>
              )}
            </div>

            {/* Creator Row */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center overflow-hidden shrink-0">
                {listing.creator.avatar ? (
                  <img src={listing.creator.avatar} alt={listing.creator.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-textMuted">{listing.creator.name?.[0]}</span>
                )}
              </div>
              <span className="text-xs font-medium text-textMuted group-hover:text-textSecondary transition-colors truncate">
                {listing.creator.name}
              </span>
            </div>
          </div>

          {/* Price Pill */}
          <div className="shrink-0 pt-0.5">
            <span className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[13px] font-bold tracking-tight shadow-sm transition-colors ${listing.price === 0
              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
              : 'bg-surface text-textMain ring-1 ring-border group-hover:ring-accent-primary/20 group-hover:bg-accent-primary/5'
              }`}>
              {listing.price === 0 ? 'Free' : `$${listing.price}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;