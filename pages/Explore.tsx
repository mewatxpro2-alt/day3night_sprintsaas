import React, { useState } from 'react';
import { Search, Filter, LayoutGrid, List, ChevronDown, CheckCircle2 } from 'lucide-react';
import FeaturedCard from '../components/FeaturedCard';
import { MOCK_LISTINGS } from '../constants';

interface ExploreProps {
  onListingClick: (id: string) => void;
}

const Explore: React.FC<ExploreProps> = ({ onListingClick }) => {
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredListings = filter === 'All' 
    ? MOCK_LISTINGS 
    : MOCK_LISTINGS.filter(l => l.category === filter);

  // Extend mock listings to fill the grid for demo
  const displayListings = [...filteredListings, ...filteredListings, ...filteredListings].slice(0, 9);

  const categories = [
    { label: 'All', count: 2400 },
    { label: 'SaaS', count: 847 },
    { label: 'E-commerce', count: 623 },
    { label: 'Portfolio', count: 412 },
    { label: 'Agency', count: 298 },
    { label: 'Fintech', count: 186 },
    { label: 'Health', count: 142 },
  ];

  return (
    <div className="pt-32 px-6 max-w-[1400px] mx-auto pb-20 min-h-screen">
       {/* Header */}
       <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4 tracking-tight">Curated MVP Foundations</h1>
          <p className="text-textMuted max-w-2xl text-lg flex items-center gap-2">
            <CheckCircle2 size={16} className="text-accent" />
            Audited codebases. Production-ready architectures. Don't start from zero.
          </p>
       </div>

       {/* Toolbar */}
       <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
            <input 
              type="text" 
              placeholder="Try 'SaaS Dashboard', 'Marketplace', or 'AI Agent'..."
              className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-textMain placeholder:text-textMuted/40 focus:outline-none focus:border-textMain/20 focus:ring-1 focus:ring-textMain/5 transition-all h-[52px] shadow-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 bg-surface border border-border rounded-xl text-textMain hover:border-borderHover hover:bg-surfaceHighlight transition-all h-[52px] whitespace-nowrap shadow-sm font-medium">
               <Filter size={18} className="text-textMuted" />
               Framework
               <ChevronDown size={16} className="text-textMuted ml-1" />
             </button>

             <button className="flex items-center gap-2 px-5 bg-surface border border-border rounded-xl text-textMain hover:border-borderHover hover:bg-surfaceHighlight transition-all h-[52px] min-w-[180px] justify-between whitespace-nowrap shadow-sm font-medium">
               <span className="text-textMuted">Sort:</span> Curated Match
               <ChevronDown size={16} className="text-textMuted ml-1" />
             </button>

             <div className="flex bg-surface border border-border rounded-xl p-1 h-[52px] items-center shrink-0 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surfaceHighlight text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surfaceHighlight text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                >
                  <List size={20} />
                </button>
             </div>
          </div>
       </div>
       
       {/* Category Tabs */}
       <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar animate-fade-in">
          {categories.map((cat) => (
            <button 
              key={cat.label} 
              onClick={() => setFilter(cat.label)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat.label 
                  ? 'bg-accent text-accentFg shadow-md' 
                  : 'bg-surfaceHighlight text-textMuted hover:text-textMain hover:bg-surface border border-transparent hover:border-border'
              }`}
            >
              {cat.label}
              <span className={`text-xs ${filter === cat.label ? 'text-accentFg/80' : 'text-textMuted/60'}`}>{cat.count}</span>
            </button>
          ))}
       </div>

       {/* Results Count */}
       <div className="mb-6 text-textMuted text-xs font-mono uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          Displaying {displayListings.length} verified architectures
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
         {displayListings.map((listing, index) => (
           <div key={`${listing.id}-${index}`}>
              <FeaturedCard listing={listing} onClick={onListingClick} />
           </div>
         ))}
       </div>
    </div>
  );
};

export default Explore;