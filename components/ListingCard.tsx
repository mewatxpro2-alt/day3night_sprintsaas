import React from 'react';
import { Heart, Eye, ArrowUpRight } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onClick }) => {
  return (
    <div 
      className="group relative flex flex-col gap-3 cursor-pointer"
      onClick={() => onClick(listing.id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface border border-border group-hover:border-accent/30 transition-colors duration-300">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        
        {/* Overlay Action */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <button className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Live Demo <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Live Badge */}
        {listing.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white">Live</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-display font-medium text-textMain group-hover:text-white transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <img src={listing.creator.avatar} alt="" className="w-5 h-5 rounded-full" />
             <span className="text-sm text-textMuted group-hover:text-textMain/80 transition-colors">{listing.creator.name}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-medium text-white">
            {listing.price === 0 ? 'Free' : `$${listing.price}`}
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
        <div className="flex gap-2">
          {listing.techStack.slice(0, 3).map(tech => (
            <span key={tech} className="text-[10px] uppercase font-mono text-textMuted px-1.5 py-0.5 rounded bg-surfaceHighlight">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-textMuted text-xs font-mono">
          <span className="flex items-center gap-1 hover:text-accent transition-colors">
            <Heart size={12} /> {listing.likes}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {listing.views >= 1000 ? `${(listing.views / 1000).toFixed(1)}k` : listing.views}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;