import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, Edit2, CheckCircle, Package, Search, Star } from 'lucide-react';
import { useAdminKits, type AdminKit } from '../../hooks/useAdminKits';

const Kits: React.FC = () => {
    const { kits, isLoading, error, unpublishKit, publishKit, toggleFeatured } = useAdminKits();
    const [filter, setFilter] = useState<'all' | 'live' | 'unpublished'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredKits = kits.filter(kit => {
        // Search filter
        if (searchQuery && !kit.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // Status filter
        if (filter === 'live') return kit.is_live;
        if (filter === 'unpublished') return !kit.is_live;
        return true;
    });

    const handleTogglePublish = async (kit: AdminKit) => {
        if (kit.is_live) {
            await unpublishKit(kit.id);
        } else {
            await publishKit(kit.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 h-full">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500 font-medium">Error: {error}</p>
            </div>
        );
    }

    // Dynamic classes for filters
    const getFilterClasses = (status: string) => {
        if (filter === status) {
            return `bg-accent-tertiary text-textInverse shadow-lg shadow-accent-tertiary/25 ring-1 ring-accent-tertiary/20 transform scale-100`;
        }
        return `bg-surface text-textMuted hover:text-textMain hover:bg-surfaceHighlight border border-border hover:border-accent-tertiary/30`;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Live Kits</h1>
                    <p className="text-textMuted">Manage your digital assets and their visibility across the platform.</p>
                </div>
                <div className="h-10 w-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="text-accent-primary" size={20} />
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                    <input
                        type="text"
                        placeholder="Search kits by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-tertiary transition-colors"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-surfaceHighlight/50 rounded-xl w-fit border border-border/50">
                    {(['all', 'live', 'unpublished'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${getFilterClasses(status)}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Kits Grid */}
            {filteredKits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                        <Package className="text-textMuted" size={24} />
                    </div>
                    <p className="text-textMain font-medium text-lg">No kits found</p>
                    <p className="text-textMuted text-sm">No {filter !== 'all' ? filter : ''} kits match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredKits.map((kit) => (
                        <div
                            key={kit.id}
                            className="p-5 rounded-2xl bg-surface border border-border hover:border-accent-primary/30 transition-all group flex flex-col h-full hover:shadow-lg hover:shadow-accent-primary/5"
                        >
                            {/* Thumbnail */}
                            {kit.image_url && (
                                <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-surfaceHighlight relative ring-1 ring-black/5 dark:ring-white/5">
                                    <img
                                        src={kit.image_url}
                                        alt={kit.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    {!kit.is_live && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
                                            <span className="text-white font-semibold bg-red-500/90 hover:bg-red-500 px-4 py-1.5 rounded-full text-sm shadow-sm backdrop-blur-md">
                                                Unpublished
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="space-y-4 flex-1 flex flex-col">
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="font-display font-bold text-lg text-textMain line-clamp-1 group-hover:text-accent-primary transition-colors">
                                            {kit.title}
                                        </h3>
                                        {kit.is_featured && (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-accent-secondary/15 text-accent-secondary-fg border border-accent-secondary/20 flex items-center gap-1.5 shrink-0">
                                                <CheckCircle size={10} strokeWidth={3} />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-textMuted line-clamp-2 leading-relaxed">
                                        {kit.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-border/50">
                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-xs font-medium text-textMuted mb-4">
                                        <span className="flex items-center gap-1.5 bg-surfaceHighlight px-2.5 py-1 rounded-md">
                                            <span className="text-textMain font-bold ml-0.5">₹{kit.price}</span>
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5" title="Views">
                                                <Eye size={12} className="opacity-70" />
                                                {kit.views_count}
                                            </span>
                                            <span className="flex items-center gap-1.5" title="Likes">
                                                <span className="opacity-70">❤️</span>
                                                {kit.likes_count}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleTogglePublish(kit)}
                                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${kit.is_live
                                                ? 'bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20'
                                                : 'bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary-dim border border-transparent hover:border-accent-primary/20'
                                                }`}
                                        >
                                            {kit.is_live ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {kit.is_live ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/details/${kit.id}`}
                                            className="px-4 py-2.5 rounded-xl bg-accent-tertiary/10 hover:bg-accent-tertiary/20 text-accent-tertiary-dim border border-transparent hover:border-accent-tertiary/20 text-sm font-medium transition-all flex items-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => toggleFeatured(kit.id, kit.is_featured)}
                                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${kit.is_featured
                                                    ? 'bg-accent-secondary/20 text-accent-secondary-fg border border-accent-secondary/30'
                                                    : 'bg-surfaceHighlight text-textMuted hover:text-accent-secondary-fg hover:bg-accent-secondary/10 border border-transparent hover:border-accent-secondary/20'
                                                }`}
                                            title={kit.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                        >
                                            <Star size={14} fill={kit.is_featured ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Kits;
