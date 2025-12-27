import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
    listingId: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'full';
    className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
    listingId,
    size = 'md',
    variant = 'icon',
    className = ''
}) => {
    const { user } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(false);

    const isWishlisted = isInWishlist(listingId);

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    };

    const iconSizes = {
        sm: 14,
        md: 18,
        lg: 22
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/signin');
            return;
        }

        setIsLoading(true);
        await toggleWishlist(listingId);
        setIsLoading(false);
    };

    if (variant === 'full') {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading}
                className={`
                    flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                    ${isWishlisted
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        : 'bg-surfaceHighlight text-textMuted hover:text-red-500 hover:bg-red-500/5'
                    }
                    disabled:opacity-50
                    ${className}
                `}
            >
                <Heart
                    size={iconSizes[size]}
                    className={isWishlisted ? 'fill-current' : ''}
                />
                {isWishlisted ? 'Saved' : 'Save'}
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
                ${sizeClasses[size]} rounded-full transition-all
                ${isWishlisted
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-surface/80 backdrop-blur-sm text-textMuted hover:text-red-500 hover:bg-red-500/10'
                }
                disabled:opacity-50
                ${className}
            `}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart
                size={iconSizes[size]}
                className={`transition-all ${isWishlisted ? 'fill-current scale-110' : ''}`}
            />
        </button>
    );
};

export default WishlistButton;
