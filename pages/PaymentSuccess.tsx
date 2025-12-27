import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface OrderWithDetails {
    id: string;
    order_number: string;
    listing: {
        title: string;
        image_url: string;
    };
    seller: {
        full_name: string;
    };
}

const PaymentSuccess: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
            id,
            order_number,
            listing:listings(title, image_url),
            seller:profiles!orders_seller_id_fkey(full_name)
          `)
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                setOrder(data as any);
            } catch (err) {
                console.error('Error fetching order:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // Auto-redirect countdown
    useEffect(() => {
        if (!order || countdown <= 0) return;

        const timer = setTimeout(() => {
            if (countdown === 1) {
                navigate(`/order/${orderId}`);
            } else {
                setCountdown(countdown - 1);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, order, orderId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-textMuted">Order not found</p>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8 animate-slide-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6 animate-scale-in">
                        <CheckCircle className="text-accent-primary" size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-textMain mb-3">
                        Payment Successful!
                    </h1>
                    <p className="text-textMuted text-lg">
                        Your purchase is complete. You now have lifetime access to this blueprint.
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-surface border border-border rounded-2xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-2 text-xs text-textMuted uppercase tracking-wider mb-4">
                        <Package size={14} />
                        <span>Order {order.order_number}</span>
                    </div>

                    <div className="flex gap-4 items-start">
                        {order.listing?.image_url && (
                            <img
                                src={order.listing.image_url}
                                alt={order.listing?.title}
                                className="w-20 h-20 rounded-lg object-cover border border-border"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-textMain mb-1">
                                {order.listing?.title}
                            </h3>
                            <p className="text-sm text-textMuted mb-3">
                                Created by <span className="text-textMain font-medium">{order.seller?.full_name}</span>
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20">
                                <CheckCircle size={14} className="text-accent-primary" />
                                <span className="text-xs font-medium text-accent-primary">Lifetime Access Granted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-surfaceHighlight/50 border border-border rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-bold text-textMain mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-textMuted">
                        <li className="flex items-start gap-2">
                            <span className="text-accent-primary mt-0.5">→</span>
                            <span>Access your private workspace to view all resources</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent-primary mt-0.5">→</span>
                            <span>Download source code and documentation</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent-primary mt-0.5">→</span>
                            <span>Message the creator with any questions</span>
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                    <Button
                        className="w-full h-12 text-base font-semibold shadow-lg"
                        onClick={() => navigate(`/order/${orderId}`)}
                        icon={<ArrowRight size={18} />}
                    >
                        Go to Your Blueprint Workspace
                    </Button>

                    <p className="text-center text-sm text-textMuted">
                        Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
