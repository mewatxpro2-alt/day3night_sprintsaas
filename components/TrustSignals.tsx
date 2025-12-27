import React from 'react';
import { CheckCircle, Star, Shield, TrendingUp, Clock, Package, Award } from 'lucide-react';

interface TrustSignalsProps {
    seller?: {
        is_verified_seller?: boolean;
        seller_level?: string;
        rating_average?: number;
        rating_count?: number;
        total_sales?: number;
        completion_rate?: number;
    };
    listing?: {
        purchase_count?: number;
        last_sold_at?: string;
        rating_average?: number;
        rating_count?: number;
    };
    variant?: 'compact' | 'full';
    className?: string;
}

const TrustSignals: React.FC<TrustSignalsProps> = ({ seller, listing, variant = 'full', className = '' }) => {

    const getActivityText = (date?: string) => {
        if (!date) return null;
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Sold today';
        if (days === 1) return 'Sold yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return null;
    };

    const getLevelDisplay = (level?: string) => {
        const levels: Record<string, { label: string; color: string }> = {
            new: { label: 'New Seller', color: 'text-gray-500' },
            rising: { label: 'Rising', color: 'text-blue-500' },
            established: { label: 'Established', color: 'text-green-500' },
            trusted: { label: 'Trusted', color: 'text-purple-500' },
            top_seller: { label: 'Top Seller', color: 'text-amber-500' },
        };
        return levels[level || 'new'] || levels.new;
    };

    const levelInfo = getLevelDisplay(seller?.seller_level);
    const activityText = getActivityText(listing?.last_sold_at);

    if (variant === 'compact') {
        return (
            <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
                {seller?.is_verified_seller && (
                    <span className="flex items-center gap-1 text-accent-primary">
                        <CheckCircle size={12} />
                        Verified
                    </span>
                )}
                {listing?.purchase_count && listing.purchase_count > 0 && (
                    <span className="text-textMuted">
                        {listing.purchase_count}+ sold
                    </span>
                )}
                {activityText && (
                    <span className="text-green-500">
                        {activityText}
                    </span>
                )}
            </div>
        );
    }

    // Full variant
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Verification & Level */}
            <div className="flex flex-wrap gap-2">
                {seller?.is_verified_seller && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-medium">
                        <CheckCircle size={14} />
                        Verified Seller
                    </span>
                )}
                {seller?.seller_level && seller.seller_level !== 'new' && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-surfaceHighlight rounded-full text-sm font-medium ${levelInfo.color}`}>
                        <Award size={14} />
                        {levelInfo.label}
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {listing?.rating_average !== undefined && listing.rating_average > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-surfaceHighlight/50 rounded-lg">
                        <Star size={14} className="text-accent-primary" />
                        <span className="text-sm">
                            <strong>{listing.rating_average.toFixed(1)}</strong>
                            <span className="text-textMuted ml-1">({listing.rating_count})</span>
                        </span>
                    </div>
                )}
                {listing?.purchase_count !== undefined && listing.purchase_count > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-surfaceHighlight/50 rounded-lg">
                        <Package size={14} className="text-accent-tertiary" />
                        <span className="text-sm">
                            <strong>{listing.purchase_count}+</strong>
                            <span className="text-textMuted ml-1">sold</span>
                        </span>
                    </div>
                )}
                {seller?.completion_rate !== undefined && seller.completion_rate > 90 && (
                    <div className="flex items-center gap-2 p-2 bg-surfaceHighlight/50 rounded-lg">
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-sm">
                            <strong>{seller.completion_rate.toFixed(0)}%</strong>
                            <span className="text-textMuted ml-1">success</span>
                        </span>
                    </div>
                )}
                {activityText && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg border border-green-500/10">
                        <Clock size={14} className="text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                            {activityText}
                        </span>
                    </div>
                )}
            </div>

            {/* Buyer Protection */}
            <div className="flex items-center gap-2 text-xs text-textMuted">
                <Shield size={12} className="text-accent-primary" />
                <span>Protected by SprintSaaS Buyer Guarantee</span>
            </div>
        </div>
    );
};

export default TrustSignals;
