import React from 'react';
import { Package, MessageSquare, Eye, Calendar, ArrowUpRight } from 'lucide-react';
import { useSellerOrders } from '../../hooks/useSeller';
import { Link } from 'react-router-dom';

const SellerOrders: React.FC = () => {
    const { orders, isLoading, error } = useSellerOrders();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-accent-tertiary/10 text-accent-tertiary',
            delivered: 'bg-accent-primary/10 text-accent-primary',
            completed: 'bg-accent-primary/20 text-accent-primary',
            refunded: 'bg-red-500/10 text-red-500',
            disputed: 'bg-accent-secondary/10 text-accent-secondary-fg',
        };
        return styles[status] || 'bg-surfaceHighlight text-textMuted';
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Your Sales</h1>
                <p className="text-textMuted">Manage orders for your kits</p>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-surface border border-border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                        <Package className="text-textMuted" size={24} />
                    </div>
                    <p className="text-textMain font-medium text-lg">No sales yet</p>
                    <p className="text-textMuted text-sm">When someone buys your kit, it will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="p-6 rounded-2xl bg-surface border border-border hover:border-accent-primary/30 transition-all"
                        >
                            <div className="flex items-start gap-6">
                                {/* Thumbnail */}
                                {order.listing?.image_url && (
                                    <img
                                        src={order.listing.image_url}
                                        alt={order.listing.title}
                                        className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                                    />
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h3 className="font-bold text-textMain line-clamp-1">
                                                {order.listing?.title || 'Unknown Kit'}
                                            </h3>
                                            <p className="text-sm text-textMuted">
                                                Order #{order.order_number}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-textMuted mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Eye size={14} />
                                            Buyer: {order.buyer?.full_name || 'Anonymous'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-textMuted text-sm">Your earnings: </span>
                                            <span className="text-xl font-bold text-accent-primary">
                                                ₹{order.seller_amount}
                                            </span>
                                            <span className="text-textMuted text-sm ml-2">
                                                (from ₹{order.price_amount})
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {['paid', 'delivered', 'completed'].includes(order.status) && (
                                                <Link
                                                    to={`/messages/${order.id}`}
                                                    className="px-4 py-2 rounded-xl bg-accent-tertiary/10 text-accent-tertiary font-medium hover:bg-accent-tertiary/20 transition-colors flex items-center gap-2"
                                                >
                                                    <MessageSquare size={16} />
                                                    Message
                                                </Link>
                                            )}
                                            <Link
                                                to={`/order/${order.id}`}
                                                className="px-4 py-2 rounded-xl bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors flex items-center gap-2"
                                            >
                                                View <ArrowUpRight size={14} />
                                            </Link>
                                        </div>
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

export default SellerOrders;
