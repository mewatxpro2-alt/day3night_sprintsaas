import React, { useEffect } from 'react';
import { CheckCircle, Download, MessageSquare, ArrowRight, Package } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';

const OrderSuccess: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { order, isLoading, error } = useOrder(id);
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if order not found after loading
        if (!isLoading && !order && !error) {
            navigate('/dashboard/orders');
        }
    }, [isLoading, order, error, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Order not found</p>
                    <Link to="/dashboard/orders" className="text-accent-tertiary hover:underline">
                        View your orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Success Animation */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="w-20 h-20 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-accent-primary" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-textMuted">
                        Thank you for your purchase. Here's your order details.
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border">
                        {order.listing?.image_url && (
                            <img
                                src={order.listing.image_url}
                                alt={order.listing.title}
                                className="w-20 h-14 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <p className="font-bold text-textMain line-clamp-1">
                                {order.listing?.title}
                            </p>
                            <p className="text-sm text-textMuted">
                                Order #{order.order_number}
                            </p>
                        </div>
                        <p className="font-bold text-accent-primary">
                            ₹{order.price_amount}
                        </p>
                    </div>

                    {/* Access Info */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-textMain">What's Next?</h3>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-surfaceHighlight">
                            <Download size={18} className="text-accent-primary mt-0.5" />
                            <div>
                                <p className="font-medium text-textMain text-sm">Download Source Files</p>
                                <p className="text-xs text-textMuted">
                                    Access your files from the order details page
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-surfaceHighlight">
                            <MessageSquare size={18} className="text-accent-tertiary mt-0.5" />
                            <div>
                                <p className="font-medium text-textMain text-sm">Contact Seller</p>
                                <p className="text-xs text-textMuted">
                                    You can now message the seller directly
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-surfaceHighlight">
                            <Package size={18} className="text-accent-secondary mt-0.5" />
                            <div>
                                <p className="font-medium text-textMain text-sm">Lifetime Access</p>
                                <p className="text-xs text-textMuted">
                                    Download anytime from your orders page
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        to={`/order/${order.id}`}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all"
                    >
                        View Order & Download
                        <ArrowRight size={18} />
                    </Link>

                    <Link
                        to="/dashboard/orders"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-surfaceHighlight text-textMuted hover:text-textMain font-medium rounded-xl transition-colors"
                    >
                        Go to My Orders
                    </Link>
                </div>

                {/* Receipt Info */}
                <p className="text-xs text-textMuted text-center mt-6">
                    A receipt has been sent to your email address
                </p>
            </div>
        </div>
    );
};

export default OrderSuccess;
