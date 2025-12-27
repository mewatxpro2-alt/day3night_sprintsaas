import React from 'react';
import { Heart, Trash2, Star, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';

const WishlistPage: React.FC = () => {
    const { items, isLoading, removeFromWishlist } = useWishlist();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Your Wishlist</h1>
                    <p className="text-textMuted">Kits you've saved for later</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-textMuted">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                        <Heart className="text-red-500" size={20} />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                        <Heart className="text-textMuted" size={24} />
                    </div>
                    <p className="text-textMain font-medium text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-textMuted text-sm mb-6">Browse kits and save the ones you love</p>
                    <Link
                        to="/mvp-kits"
                        className="px-6 py-3 bg-accent-primary text-accent-primary-fg rounded-xl font-medium hover:brightness-110 transition-all"
                    >
                        Explore Kits
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent-primary/30 transition-all group"
                        >
                            {/* Thumbnail */}
                            <Link to={`/listing/${item.listing.slug || item.listing.id}`} className="block">
                                <div className="aspect-video bg-surfaceHighlight overflow-hidden relative">
                                    {item.listing.image_url ? (
                                        <img
                                            src={item.listing.image_url}
                                            alt={item.listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="text-textMuted" size={32} />
                                        </div>
                                    )}
                                    {/* Remove Button */}
                                    <button
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            await removeFromWishlist(item.listing_id);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-surface/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </Link>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <Link to={`/listing/${item.listing.slug || item.listing.id}`}>
                                        <h3 className="font-bold text-textMain line-clamp-1 group-hover:text-accent-primary transition-colors">
                                            {item.listing.title}
                                        </h3>
                                    </Link>
                                    <span className="text-lg font-bold text-accent-primary shrink-0">
                                        ₹{item.listing.price}
                                    </span>
                                </div>

                                <p className="text-sm text-textMuted mb-4">
                                    by {item.listing.seller?.full_name || 'Unknown'}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-sm text-textMuted">
                                        <Star size={12} className="text-accent-primary" />
                                        <span>{(item.listing.rating_average || 0).toFixed(1)}</span>
                                    </div>
                                    <Link
                                        to={`/listing/${item.listing.slug || item.listing.id}`}
                                        className="flex items-center gap-1 text-sm text-accent-tertiary hover:underline"
                                    >
                                        View Kit <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
