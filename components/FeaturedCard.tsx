import React from 'react';
import { Eye, Heart, Bookmark } from 'lucide-react';
import { Listing } from '../types';

interface FeaturedCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ listing, onClick }) => {
  return (
    <div 
      onClick={() => onClick(listing.id)}
      className="group relative flex flex-col h-full cursor-pointer rounded-2xl bg-surface border border-border hover:border-borderHover transition-colors duration-300 shadow-sm hover:shadow-premium"
    >
      {/* Image Area */}
      <div className="p-2 pb-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surfaceHighlight ring-1 ring-border">
          <img 
            src={listing.image} 
            alt={listing.title} 
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105" 
          />
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            {/* Category: Informational -> Blue (Tertiary) */}
            <span className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-border text-textSecondary text-[10px] font-medium tracking-wide shadow-sm flex items-center gap-1.5 group-hover:border-accent-tertiary/50 group-hover:text-accent-tertiary transition-colors">
               {listing.category}
            </span>
             {listing.price > 0 && (
                // Price: Important -> Default Text or Green if highlighted. Let's keep it neutral until hover
                <span className="px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-border text-textMain text-[10px] font-bold tracking-wide shadow-sm group-hover:bg-textMain group-hover:text-background transition-colors">
                    ${listing.price}
                </span>
             )}
          </div>

          {/* Hover Action - Bottom Row */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-10">
             {/* Preview Button: Primary Action -> Green */}
             <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(listing.id);
                }}
                className="bg-accent-primary text-accentFg-primary px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-accent-primary/90 transition-colors shadow-lg shadow-black/10"
             >
                <Eye size={16} className="stroke-[2.5px]" /> Preview
             </button>

             {/* Action Icons */}
             <div className="flex gap-2">
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md border border-border flex items-center justify-center text-textMain hover:bg-textMain hover:border-textMain hover:text-background transition-all"
                >
                    <Heart size={16} />
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md border border-border flex items-center justify-center text-textMain hover:bg-textMain hover:border-textMain hover:text-accent-secondary transition-all"
                >
                    <Bookmark size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-bold text-textMain group-hover:text-accent-primary transition-colors leading-tight font-display tracking-tight">
              {listing.title}
            </h3>
        </div>
        
        <p className="text-[13px] text-textMuted mb-4 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-6">
          {listing.techStack.slice(0, 3).map(tech => (
             <span key={tech} className="px-2 py-1 rounded-md text-[10px] text-textMuted border border-border bg-surfaceHighlight flex items-center gap-1">
                {tech}
             </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-2 group/creator">
              <img src={listing.creator.avatar} className="w-6 h-6 rounded-full ring-1 ring-border grayscale group-hover/creator:grayscale-0 transition-all opacity-70 group-hover/creator:opacity-100" alt="" />
              <div className="flex flex-col">
                  <span className="text-[11px] text-textSecondary font-medium group-hover/creator:text-textMain transition-colors leading-none">{listing.creator.name}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 text-[10px] text-textMuted font-mono">
               <span className="flex items-center gap-1 group-hover:text-textMain transition-colors">
                 <Heart size={12} className="group-hover:text-red-400 transition-colors" /> {listing.likes}
               </span>
               <span className="flex items-center gap-1 group-hover:text-textMain transition-colors">
                 <Eye size={12} /> {listing.views > 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}
               </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;