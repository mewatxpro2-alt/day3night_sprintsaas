import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import FeaturedCard from '../components/FeaturedCard';

import { useListings } from '../hooks/useListings';
import { useCategories } from '../hooks/useCategories';

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category');

  const [filter, setFilter] = useState(initialCategory || 'All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from Supabase
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { listings, isLoading: listingsLoading, error } = useListings({
    search: searchQuery || undefined
  });

  // Filter listings based on selected category
  const filteredListings = useMemo(() => {
    if (filter === 'All') return listings;

    // Find category ID by title
    const category = categories.find(c => c.title === filter);
    if (!category) return listings;

    return listings.filter(listing => listing.category_id === category.id);
  }, [filter, listings, categories]);

  const categoryTabs = [
    { label: 'All', count: listings.length },
    ...categories.slice(0, 6).map(cat => ({
      label: cat.title,
      count: cat.listing_count || 0
    }))
  ];

  if (listingsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-36 px-6 max-w-[1400px] mx-auto pb-20">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">Error loading kits: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 px-6 max-w-[1400px] mx-auto pb-20 min-h-screen">

      {/* Header */}
      <div className="mb-10 animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4 tracking-tighter">Market-Ready SaaS Assets</h1>
        {/* Constrained left-aligned signature */}
        <div className="w-24 mb-6">

        </div>
        <p className="text-textSecondary max-w-2xl text-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-accent-primary" />
          Production-ready blueprints. Tested in the market. Ready for your next startup.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Try 'AI Content Repurposer', 'SaaS Boilerplate', or 'Micro-SaaS'..."
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-textMain placeholder:text-textMuted/60 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all h-[52px] shadow-sm font-medium"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 bg-surface border border-border rounded-xl text-textMain hover:border-accent-tertiary/30 hover:bg-surfaceHighlight transition-all h-[52px] whitespace-nowrap shadow-sm font-medium">
            <Filter size={18} className="text-textSecondary" />
            Framework
            <ChevronDown size={16} className="text-textMuted" />
          </button>
          <button className="flex items-center gap-2 px-5 bg-surface border border-border rounded-xl text-textMain hover:border-accent-tertiary/30 hover:bg-surfaceHighlight transition-all h-[52px] whitespace-nowrap shadow-sm font-medium">
            Price
            <ChevronDown size={16} className="text-textMuted" />
          </button>
          <div className="flex items-center bg-surface border border-border rounded-xl overflow-hidden h-[52px] shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surfaceHighlight text-textMain shadow-sm border border-border/50' : 'text-textMuted hover:text-textMain'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surfaceHighlight text-textMain shadow-sm border border-border/50' : 'text-textMuted hover:text-textMain'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar animate-fade-in">
        {categoryTabs.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setFilter(cat.label)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === cat.label
              ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
              : 'bg-surfaceHighlight text-textSecondary hover:text-textMain hover:bg-surface border border-transparent hover:border-border'
              }`}
          >
            {cat.label}
            {(typeof cat.count === 'number' && cat.count > 0) && (
              <span className={`text-xs ${filter === cat.label ? 'text-white/80' : 'text-textMuted'}`}>
                ({cat.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-textMuted text-sm mb-8">Showing {filteredListings.length} results</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
        {filteredListings.map((listing, index) => (
          <div key={`${listing.id}-${index}`}>
            <FeaturedCard listing={listing} onClick={(id) => navigate(`/listing/${id}`)} />
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-20">
          <p className="text-textMuted">No blueprints found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Explore;