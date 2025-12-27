import React, { useState, MouseEvent } from 'react';
import { Heart, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Combine main image and screenshots
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
      className="group flex flex-col gap-3 cursor-pointer"
      onClick={() => onClick(listing.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Carousel Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface border border-border group-hover:border-border/60 group-hover:shadow-lg transition-all duration-300">

        {/* Images */}
        {allImages.length > 0 ? (
          <div className="relative w-full h-full">
            {allImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
              >
                <img
                  src={img}
                  alt={`${listing.title} - Preview ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surfaceHighlight text-textMuted">
            <ImageIcon size={32} />
          </div>
        )}

        {/* Carousel Controls (Visible on Hover) */}
        {allImages.length > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={handlePrevImage}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:bg-black/70 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={handleNextImage}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:bg-black/70 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
            >
              <ChevronRight size={16} />
            </button>

            {/* Dots Indicator */}
            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
              {allImages.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/60'
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Love Button (Visible on Hover) */}
        <button
          className={`absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Hook up toggleSave logic
          }}
        >
          <Heart size={14} className={listing.likes > 0 ? "fill-red-500 text-red-500" : ""} />
        </button>
      </div>

      {/* Content - Minimal Strip */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-display font-medium text-textMain leading-tight truncate group-hover:text-textMain transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-textMuted group-hover:text-textSecondary transition-colors truncate">
              {listing.creator.name}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-md font-mono font-medium text-textMain">
            {listing.price === 0 ? 'Free' : `$${listing.price}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;