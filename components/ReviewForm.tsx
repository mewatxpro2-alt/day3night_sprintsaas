import React, { useState } from 'react';
import { Star, Loader2, X, CheckCircle } from 'lucide-react';
import { useSubmitReview } from '../hooks/useReviews';

interface ReviewFormProps {
    orderId: string;
    listingTitle: string;
    sellerName: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    orderId,
    listingTitle,
    sellerName,
    onSuccess,
    onClose
}) => {
    const { submitReview, isLoading, error, success } = useSubmitReview();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    const ratingLabels: Record<number, string> = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;

        const review = await submitReview({
            orderId,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined
        });

        if (review) {
            onSuccess?.();
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-textMain mb-2">
                    Thank you for your review!
                </h3>
                <p className="text-textMuted">
                    Your feedback helps other buyers make informed decisions.
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-6 px-6 py-2 bg-accent-primary text-accentFg-primary rounded-lg font-medium hover:bg-accent-primary/90 transition-colors"
                    >
                        Done
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-textMain">
                        Leave a Review
                    </h3>
                    <p className="text-sm text-textMuted mt-1">
                        Share your experience with "{listingTitle}"
                    </p>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                    >
                        <X size={20} className="text-textMuted" />
                    </button>
                )}
            </div>

            {/* Rating Stars */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-textMain">
                    Your Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={32}
                                    className={`transition-colors ${star <= (hoverRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-textMuted'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    {(hoverRating || rating) > 0 && (
                        <span className="text-sm font-medium text-textSecondary ml-2">
                            {ratingLabels[hoverRating || rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Title (Optional) */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-textMain">
                    Review Title
                    <span className="text-textMuted font-normal ml-1">(optional)</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience..."
                    maxLength={100}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                />
            </div>

            {/* Comment */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-textMain">
                    Your Review
                    <span className="text-textMuted font-normal ml-1">(optional)</span>
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`What did you like or dislike about this product? How was your experience with ${sellerName}?`}
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                />
                <p className="text-xs text-textMuted text-right">
                    {comment.length}/2000
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={rating === 0 || isLoading}
                    className="flex-1 px-6 py-3 bg-accent-primary text-accentFg-primary rounded-xl font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </button>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-surface border border-border rounded-xl font-medium text-textMuted hover:text-textMain hover:bg-surfaceHighlight transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-textMuted text-center">
                Your review will be visible to other buyers and the seller can respond.
            </p>
        </form>
    );
};

export default ReviewForm;
