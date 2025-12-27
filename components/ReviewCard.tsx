import React from 'react';
import { Star, ThumbsUp, User, CheckCircle, MessageSquare } from 'lucide-react';
import type { Review } from '../types/marketplace';

interface ReviewCardProps {
    review: Review;
    showListingInfo?: boolean;
    onMarkHelpful?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    showListingInfo = false,
    onMarkHelpful
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-5 bg-surface border border-border rounded-xl hover:border-borderHover transition-colors">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Reviewer Avatar */}
                <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
                    {review.reviewer?.avatar_url ? (
                        <img
                            src={review.reviewer.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User size={18} className="text-accent-primary" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-textMain">
                            {review.reviewer?.full_name || 'Anonymous'}
                        </span>
                        {review.is_verified_purchase && (
                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                <CheckCircle size={10} />
                                Verified Purchase
                            </span>
                        )}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={14}
                                className={star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-textMuted'
                                }
                            />
                        ))}
                        <span className="ml-2 text-xs text-textMuted">
                            {formatDate(review.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Listing Info (optional) */}
            {showListingInfo && review.listing && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-surfaceHighlight rounded-lg">
                    {review.listing.image_url && (
                        <img
                            src={review.listing.image_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    )}
                    <div>
                        <p className="text-sm font-medium text-textMain">{review.listing.title}</p>
                        <p className="text-xs text-textMuted">Purchased item</p>
                    </div>
                </div>
            )}

            {/* Review Content */}
            {review.title && (
                <h4 className="font-semibold text-textMain mb-2">{review.title}</h4>
            )}
            {review.comment && (
                <p className="text-textSecondary text-sm leading-relaxed mb-4">
                    {review.comment}
                </p>
            )}

            {/* Seller Response */}
            {review.seller_response && (
                <div className="mt-4 p-4 bg-surfaceHighlight border-l-2 border-accent-primary rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-accent-primary" />
                        <span className="text-xs font-medium text-accent-primary">
                            Seller Response
                        </span>
                        {review.seller_response_at && (
                            <span className="text-xs text-textMuted">
                                • {formatDate(review.seller_response_at)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-textSecondary">{review.seller_response}</p>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <button
                    onClick={() => onMarkHelpful?.(review.id)}
                    className="flex items-center gap-1.5 text-xs text-textMuted hover:text-accent-primary transition-colors"
                >
                    <ThumbsUp size={14} />
                    <span>Helpful ({review.helpful_count || 0})</span>
                </button>
            </div>
        </div>
    );
};

export default ReviewCard;
