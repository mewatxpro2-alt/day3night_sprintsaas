import React from 'react';
import { Star, Award, TrendingUp, Crown, Shield, Sparkles } from 'lucide-react';
import type { SellerLevel } from '../types/marketplace';

interface SellerReputationProps {
    rating: number;
    reviewCount: number;
    sellerLevel?: SellerLevel;
    totalSales?: number;
    compact?: boolean;
}

const SellerReputation: React.FC<SellerReputationProps> = ({
    rating,
    reviewCount,
    sellerLevel = 'new',
    totalSales,
    compact = false
}) => {
    // Level configurations
    const levelConfig: Record<SellerLevel, {
        label: string;
        icon: React.ReactNode;
        color: string;
        bg: string;
        border: string;
    }> = {
        new: {
            label: 'New Seller',
            icon: <Sparkles size={14} />,
            color: 'text-gray-400',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20'
        },
        rising: {
            label: 'Rising Seller',
            icon: <TrendingUp size={14} />,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        established: {
            label: 'Established',
            icon: <Award size={14} />,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        trusted: {
            label: 'Trusted Seller',
            icon: <Shield size={14} />,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        top_seller: {
            label: 'Top Seller',
            icon: <Crown size={14} />,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20'
        }
    };

    const config = levelConfig[sellerLevel];

    // Compact version for cards
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-textMain">
                        {rating > 0 ? rating.toFixed(1) : 'New'}
                    </span>
                </div>

                {reviewCount > 0 && (
                    <span className="text-xs text-textMuted">
                        ({reviewCount})
                    </span>
                )}

                {/* Level Badge (only for non-new) */}
                {sellerLevel !== 'new' && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                        {config.icon}
                    </span>
                )}
            </div>
        );
    }

    // Full version for profiles
    return (
        <div className={`p-4 rounded-xl border ${config.border} ${config.bg}`}>
            {/* Level Badge */}
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${config.bg} border ${config.border}`}>
                    <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                    <p className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                    </p>
                    {totalSales !== undefined && (
                        <p className="text-xs text-textMuted">
                            {totalSales} sales completed
                        </p>
                    )}
                </div>
            </div>

            {/* Rating Display */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={16}
                            className={star <= Math.round(rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-textMuted'
                            }
                        />
                    ))}
                </div>
                <div className="text-sm">
                    <span className="font-semibold text-textMain">
                        {rating > 0 ? rating.toFixed(1) : '—'}
                    </span>
                    <span className="text-textMuted ml-1">
                        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                </div>
            </div>

            {/* Trust Signals */}
            {sellerLevel !== 'new' && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                        <Shield size={12} className="text-green-400" />
                        <span>Verified seller with proven track record</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerReputation;
