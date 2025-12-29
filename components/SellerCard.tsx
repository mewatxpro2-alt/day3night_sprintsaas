import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShieldCheck, Star, MessageCircle, Heart, Users, UserPlus,
    UserCheck, CheckCircle, Award, Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSellerFollow } from '../hooks/useSellerFollow';
import { useToggleSave, useSavedItems } from '../hooks/useSavedItems';
import { getSellerStageInfo, shouldShowStat } from '../utils/sellerStage';
import Button from './Button';

interface SellerCardProps {
    sellerId: string;
    sellerName: string;
    sellerAvatar?: string;
    isVerified: boolean;
    projectsCompleted: number;
    projectsSubmitted?: number;
    ratingAverage?: number | null;
    ratingCount?: number | null;
    repeatBuyers?: number;
    totalSales?: number;
    listingId: string;
    onContactClick: () => void;
    compact?: boolean;
    showVerifiedBadge?: boolean;
}

const SellerCard: React.FC<SellerCardProps> = ({
    sellerId,
    sellerName,
    sellerAvatar,
    isVerified,
    projectsCompleted,
    projectsSubmitted = 0,
    ratingAverage,
    ratingCount,
    repeatBuyers = 0,
    totalSales = 0,
    listingId,
    onContactClick,
    compact = false,
    showVerifiedBadge = true
}) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { isFollowing, followersCount, isLoading: followLoading, toggleFollow } = useSellerFollow(sellerId);
    const { toggleSave, isLoading: saveLoading } = useToggleSave();
    const { savedListingIds } = useSavedItems();

    const isSaved = savedListingIds.has(listingId);
    const stageInfo = getSellerStageInfo(projectsCompleted, isVerified);

    // Handle actions that require authentication
    const handleAuthAction = (action: () => void) => {
        if (!isAuthenticated) {
            navigate('/signin', { state: { from: window.location.pathname } });
            return;
        }
        action();
    };

    const handleFollow = () => handleAuthAction(toggleFollow);
    const handleSave = () => handleAuthAction(() => toggleSave(listingId));
    const handleContact = () => handleAuthAction(onContactClick);

    // Compact Mode Rendering (e.g. for sidebars or dense lists)
    if (compact) {
        return (
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col p-4 gap-3">
                <div className="flex items-center gap-3">
                    <Link to={`/seller/${sellerId}`} className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden">
                            {sellerAvatar ? (
                                <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-accent-primary/10 text-accent-primary font-bold">
                                    {sellerName?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <h4 className="font-bold text-sm text-textMain truncate">{sellerName}</h4>
                            {isVerified && showVerifiedBadge && (
                                <ShieldCheck size={12} className="text-blue-500" />
                            )}
                        </div>
                        <div className="text-xs text-textMuted flex items-center gap-2">
                            {stageInfo.label}
                            {ratingAverage && (
                                <span className="flex items-center gap-0.5 text-textMain font-medium">
                                    <Star size={10} className="fill-amber-400 text-amber-400" /> {ratingAverage.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={handleContact}>Message</Button>
                    <Button variant="primary" size="sm" className="flex-1 text-xs h-8" onClick={handleContact}>Hire</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header with Avatar and Name */}
            <div className="p-5 border-b border-border/50">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Link to={`/seller/${sellerId}`} className="shrink-0">
                        <div className="w-14 h-14 rounded-full bg-surface border-2 border-border overflow-hidden hover:border-accent-primary transition-colors">
                            {sellerAvatar ? (
                                <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-accent-primary/10 text-accent-primary font-bold text-lg">
                                    {sellerName?.[0]?.toUpperCase() || 'S'}
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Name and Verification */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                to={`/seller/${sellerId}`}
                                className="font-bold text-textMain hover:text-accent-primary transition-colors truncate"
                            >
                                {sellerName}
                            </Link>
                            {isVerified && showVerifiedBadge && (
                                <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                                    <ShieldCheck size={10} /> Verified
                                </span>
                            )}
                        </div>

                        {/* Stage Badge */}
                        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded mt-2 border ${stageInfo.badgeColor}`}>
                            {stageInfo.label}
                        </div>
                    </div>
                </div>

                {/* Stage Description */}
                <p className="text-xs text-textMuted mt-3 leading-relaxed">
                    {stageInfo.description}
                </p>
            </div>

            {/* Stats Grid - Only show relevant stats */}
            <div className="p-4 bg-surfaceHighlight/30">
                <div className="grid grid-cols-2 gap-2">
                    {/* Rating - Only show if stage allows and has valid rating */}
                    {stageInfo.showRating && shouldShowStat(ratingAverage) && (
                        <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                            <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Rating</div>
                            <div className="font-bold text-textMain flex items-center justify-center gap-1">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                {(ratingAverage || 0).toFixed(1)}
                                {shouldShowStat(ratingCount) && (
                                    <span className="text-xs text-textMuted font-normal">({ratingCount})</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Projects Completed - Always show if > 0 */}
                    {shouldShowStat(projectsCompleted) && (
                        <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                            <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Completed</div>
                            <div className="font-bold text-textMain flex items-center justify-center gap-1">
                                <CheckCircle size={12} className="text-green-500" />
                                {projectsCompleted}
                            </div>
                        </div>
                    )}

                    {/* Projects Submitted - For new sellers */}
                    {projectsCompleted === 0 && shouldShowStat(projectsSubmitted) && (
                        <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                            <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Submitted</div>
                            <div className="font-bold text-textMain">{projectsSubmitted}</div>
                        </div>
                    )}

                    {/* Repeat Buyers - Only if > 0 */}
                    {shouldShowStat(repeatBuyers) && (
                        <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                            <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Repeat Buyers</div>
                            <div className="font-bold text-textMain flex items-center justify-center gap-1">
                                <Users size={12} className="text-purple-500" />
                                {repeatBuyers}
                            </div>
                        </div>
                    )}

                    {/* Followers */}
                    <div className="bg-white rounded-lg p-3 text-center border border-border/50">
                        <div className="text-[10px] text-textMuted uppercase font-bold tracking-wider mb-1">Followers</div>
                        <div className="font-bold text-textMain">{followersCount}</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
                {/* Primary CTA - Get in Touch */}
                <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleContact}
                >
                    <MessageCircle size={16} />
                    Get in Touch
                </Button>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                    {/* Follow Button */}
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${isFollowing
                            ? 'bg-accent-primary/5 border-accent-primary text-accent-primary'
                            : 'bg-surface border-border text-textMain hover:border-accent-primary'
                            }`}
                    >
                        {followLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isFollowing ? (
                            <>
                                <UserCheck size={16} />
                                Following
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Follow
                            </>
                        )}
                    </button>

                    {/* Like/Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className={`w-12 flex items-center justify-center rounded-lg border transition-all ${isSaved
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-surface border-border text-textMuted hover:text-red-500 hover:border-red-200'
                            }`}
                    >
                        {saveLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Heart size={16} className={isSaved ? 'fill-current' : ''} />
                        )}
                    </button>
                </div>
            </div>

            {/* Trust Note for Top Sellers */}
            {stageInfo.stage === 'top' && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <Award size={14} className="text-purple-500 shrink-0" />
                        <span className="text-xs text-purple-700">High demand creator</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerCard;
