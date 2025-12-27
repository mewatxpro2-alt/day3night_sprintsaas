import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Shield, CheckCircle, Calendar, Package, ExternalLink, Twitter, Github, Globe, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { useSellerProfile } from '../hooks/useSellerProfile';

const SellerProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { profile, listings, isLoading, error } = useSellerProfile(id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <p className="text-red-500">{error || 'Seller not found'}</p>
                <Link to="/mvp-kits" className="text-accent-tertiary hover:underline">
                    Browse all kits
                </Link>
            </div>
        );
    }

    const getLevelBadge = (level: string) => {
        const badges: Record<string, { color: string; label: string }> = {
            new: { color: 'bg-gray-500/10 text-gray-500', label: 'New Seller' },
            rising: { color: 'bg-blue-500/10 text-blue-500', label: 'Rising Seller' },
            established: { color: 'bg-green-500/10 text-green-500', label: 'Established' },
            trusted: { color: 'bg-purple-500/10 text-purple-500', label: 'Trusted Seller' },
            top_seller: { color: 'bg-amber-500/10 text-amber-500', label: '⭐ Top Seller' },
        };
        return badges[level] || badges.new;
    };

    const levelBadge = getLevelBadge(profile.seller_level);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getActivityText = (date?: string) => {
        if (!date) return null;
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Sold today';
        if (days === 1) return 'Sold yesterday';
        if (days < 7) return `Sold ${days} days ago`;
        if (days < 30) return `Sold ${Math.floor(days / 7)} weeks ago`;
        return null;
    };

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Back Link */}
                <Link to="/mvp-kits" className="inline-flex items-center gap-2 text-textMuted hover:text-textMain transition-colors mb-8">
                    <ArrowLeft size={16} />
                    Back to Marketplace
                </Link>

                {/* Profile Header */}
                <div className="bg-surface border border-border rounded-3xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="shrink-0">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-32 h-32 rounded-2xl object-cover border-4 border-border" />
                            ) : (
                                <div className="w-32 h-32 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-4xl font-bold text-accent-primary">
                                    {profile.full_name[0]}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <h1 className="text-3xl font-display font-bold text-textMain">{profile.full_name}</h1>
                                {profile.is_verified_seller && (
                                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-medium flex items-center gap-1">
                                        <CheckCircle size={14} /> Verified
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelBadge.color}`}>
                                    {levelBadge.label}
                                </span>
                            </div>

                            {profile.bio && (
                                <p className="text-textMuted leading-relaxed mb-4 max-w-2xl">{profile.bio}</p>
                            )}

                            {/* Social Links */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {profile.website_url && (
                                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-textMuted hover:text-accent-tertiary transition-colors">
                                        <Globe size={14} /> Website
                                    </a>
                                )}
                                {profile.twitter_handle && (
                                    <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-textMuted hover:text-accent-tertiary transition-colors">
                                        <Twitter size={14} /> @{profile.twitter_handle}
                                    </a>
                                )}
                                {profile.github_handle && (
                                    <a href={`https://github.com/${profile.github_handle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-textMuted hover:text-accent-tertiary transition-colors">
                                        <Github size={14} /> {profile.github_handle}
                                    </a>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                    <div className="flex items-center gap-2 text-accent-primary mb-1">
                                        <Star size={16} />
                                        <span className="text-2xl font-bold">{profile.rating_average.toFixed(1)}</span>
                                    </div>
                                    <p className="text-xs text-textMuted">{profile.rating_count} reviews</p>
                                </div>
                                <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                    <div className="flex items-center gap-2 text-accent-tertiary mb-1">
                                        <Package size={16} />
                                        <span className="text-2xl font-bold">{profile.total_sales || 0}</span>
                                    </div>
                                    <p className="text-xs text-textMuted">Total sales</p>
                                </div>
                                <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                    <div className="flex items-center gap-2 text-green-500 mb-1">
                                        <TrendingUp size={16} />
                                        <span className="text-2xl font-bold">{(profile.completion_rate || 100).toFixed(0)}%</span>
                                    </div>
                                    <p className="text-xs text-textMuted">Completion rate</p>
                                </div>
                                <div className="p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                    <div className="flex items-center gap-2 text-textMuted mb-1">
                                        <Calendar size={16} />
                                        <span className="text-lg font-medium">{formatDate(profile.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-textMuted">Member since</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings */}
                <div>
                    <h2 className="text-xl font-display font-bold text-textMain mb-6">
                        {listings.length} Kit{listings.length !== 1 ? 's' : ''} by {profile.full_name}
                    </h2>

                    {listings.length === 0 ? (
                        <div className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl">
                            <Package size={32} className="mx-auto mb-3 text-textMuted opacity-50" />
                            <p className="text-textMuted">No published kits yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing) => (
                                <Link
                                    key={listing.id}
                                    to={`/listing/${listing.slug || listing.id}`}
                                    className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/5 transition-all group"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-surfaceHighlight overflow-hidden">
                                        {listing.image_url ? (
                                            <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="text-textMuted" size={32} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-textMain line-clamp-1 group-hover:text-accent-primary transition-colors">
                                                {listing.title}
                                            </h3>
                                            <span className="text-lg font-bold text-accent-primary shrink-0">
                                                ₹{listing.price}
                                            </span>
                                        </div>

                                        {listing.category && (
                                            <span className="text-xs text-textMuted bg-surfaceHighlight px-2 py-1 rounded mb-3 inline-block">
                                                {listing.category.name}
                                            </span>
                                        )}

                                        <div className="flex items-center justify-between text-sm text-textMuted mt-3 pt-3 border-t border-border/50">
                                            <div className="flex items-center gap-1">
                                                <Star size={12} className="text-accent-primary" />
                                                <span>{listing.rating_average.toFixed(1)}</span>
                                                <span className="text-xs">({listing.rating_count})</span>
                                            </div>
                                            {listing.purchase_count > 0 && (
                                                <span className="text-xs">
                                                    {listing.purchase_count}+ sold
                                                </span>
                                            )}
                                            {getActivityText(listing.last_sold_at) && (
                                                <span className="text-xs text-green-500">
                                                    {getActivityText(listing.last_sold_at)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerProfilePage;
