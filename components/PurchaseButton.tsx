import React, { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Shield, CheckCircle, X, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// DEV MODE: Set to true for testing (treats test payments as real amounts)
// When true: Bypasses Razorpay, creates real orders directly
// When false: Uses real Razorpay checkout with signature verification
const DEV_MODE = true;

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open: () => void;
    close: () => void;
}

interface PurchaseButtonProps {
    listingId: string;
    listingTitle: string;
    price: number;
    sellerName?: string;
    className?: string;
}

/**
 * Purchase button component that handles the entire checkout flow
 * Integrates with Razorpay for payment processing
 */
const PurchaseButton: React.FC<PurchaseButtonProps> = ({
    listingId,
    listingTitle,
    price,
    sellerName,
    className = ''
}) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

    // Load Razorpay script
    useEffect(() => {
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handlePurchaseClick = () => {
        if (!isAuthenticated) {
            // Redirect to signin, then back to checkout page
            navigate('/signin', { state: { from: `/checkout/${listingId}` } });
            return;
        }
        // Redirect to dedicated checkout page
        navigate(`/checkout/${listingId}`);
    };

    /**
     * DEV MODE: Test payment that bypasses Razorpay
     * This simulates a successful payment for testing
     */
    const handleTestPayment = async () => {
        if (!user) return;

        setIsLoading(true);
        setError(null);
        setPaymentStatus('processing');

        try {
            // Get listing details
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id, title, price, creator_id')
                .eq('id', listingId)
                .single();

            if (listingError || !listing) {
                throw new Error('Kit not found');
            }

            // Get seller_id - use creator_id or fallback to a test seller
            const sellerId = listing.creator_id || user.id;

            // In real mode, prevent buying own kit
            if (listing.creator_id && listing.creator_id === user.id) {
                throw new Error('You cannot purchase your own kit');
            }

            // Get commission rate
            const commissionRate = 0.15;
            const priceAmount = Number(listing.price);
            const commissionAmount = priceAmount * commissionRate;
            const sellerAmount = priceAmount - commissionAmount;

            // Create order directly
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    seller_id: sellerId, // Use sellerId (with fallback)
                    listing_id: listingId,
                    price_amount: priceAmount,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    seller_amount: sellerAmount,
                    currency: 'INR',
                    status: 'paid', // Directly mark as paid for testing
                    paid_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (orderError || !order) {
                console.error('Order error:', orderError);
                throw new Error(orderError?.message || 'Failed to create order');
            }

            // Create payment record
            await supabase.from('payments').insert({
                order_id: order.id,
                razorpay_order_id: `test_order_${Date.now()}`,
                razorpay_payment_id: `test_pay_${Date.now()}`,
                amount: priceAmount,
                currency: 'INR',
                status: 'captured',
                method: 'test_mode',
            });

            // Create order access
            await supabase.from('order_access').insert({
                order_id: order.id,
                access_granted_at: new Date().toISOString(),
                download_count: 0,
                max_downloads: 10,
            });

            // Schedule payout (3 days from now)
            const payoutDate = new Date();
            payoutDate.setDate(payoutDate.getDate() + 3);

            await supabase.from('seller_payouts').insert({
                seller_id: sellerId,
                order_id: order.id,
                amount: sellerAmount,
                status: 'scheduled',
                scheduled_at: payoutDate.toISOString(),
            });

            setPaymentStatus('success');

            // Navigate to success page
            setTimeout(() => {
                navigate(`/order/${order.id}/success`);
            }, 1500);

        } catch (err) {
            console.error('Test payment error:', err);
            setError(err instanceof Error ? err.message : 'Payment failed');
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPurchase = async () => {
        // DEV MODE: Use test payment (only for development)
        if (DEV_MODE) {
            await handleTestPayment();
            return;
        }

        // PRODUCTION: Real Razorpay flow
        if (!user) return;

        setIsLoading(true);
        setError(null);
        setPaymentStatus('processing');

        try {
            // Get listing details
            const { data: listing, error: listingError } = await supabase
                .from('listings')
                .select('id, title, price, creator_id')
                .eq('id', listingId)
                .single();

            if (listingError || !listing) {
                throw new Error('Kit not found');
            }

            // Prevent buying own kit
            if (listing.creator_id === user.id) {
                throw new Error('You cannot purchase your own kit');
            }

            // Check if already purchased
            const { data: existingOrder } = await supabase
                .from('orders')
                .select('id')
                .eq('buyer_id', user.id)
                .eq('listing_id', listingId)
                .in('status', ['paid', 'delivered', 'completed'])
                .maybeSingle();

            if (existingOrder) {
                throw new Error('You have already purchased this kit');
            }

            // Get commission rate from platform config
            const { data: config } = await supabase
                .from('platform_config')
                .select('value')
                .eq('key', 'commission_rate')
                .single();

            const commissionRate = config?.value || 0.15;
            const priceAmount = Number(listing.price);
            const commissionAmount = priceAmount * commissionRate;
            const sellerAmount = priceAmount - commissionAmount;

            // Create order in CREATED status (not paid yet)
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    seller_id: listing.creator_id,
                    listing_id: listingId,
                    price_amount: priceAmount,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    seller_amount: sellerAmount,
                    currency: 'INR',
                    status: 'created', // Pending payment
                })
                .select()
                .single();

            if (orderError || !order) {
                throw new Error(orderError?.message || 'Failed to create order');
            }

            // Call Edge Function to create Razorpay order
            const { data: razorpayData, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    order_id: order.id,
                    amount: Math.round(priceAmount * 100), // Razorpay expects paise
                    currency: 'INR'
                }
            });

            if (razorpayError || !razorpayData?.razorpay_order_id) {
                // Rollback order
                await supabase.from('orders').delete().eq('id', order.id);
                throw new Error('Failed to initialize payment gateway');
            }

            // Create pending payment record
            await supabase.from('payments').insert({
                order_id: order.id,
                razorpay_order_id: razorpayData.razorpay_order_id,
                amount: priceAmount,
                currency: 'INR',
                status: 'pending'
            });

            // Open Razorpay checkout
            const razorpay = new window.Razorpay({
                key: razorpayData.key_id,
                amount: Math.round(priceAmount * 100),
                currency: 'INR',
                name: 'SprintSaaS',
                description: listing.title,
                order_id: razorpayData.razorpay_order_id,
                handler: async (response: RazorpayResponse) => {
                    // Payment successful - verify and complete order
                    try {
                        // Verify payment on server
                        const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
                            body: {
                                order_id: order.id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        });

                        if (verifyError) {
                            throw new Error('Payment verification failed');
                        }

                        setPaymentStatus('success');
                        setTimeout(() => {
                            navigate(`/order/${order.id}/success`);
                        }, 1500);
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                        setPaymentStatus('failed');
                    }
                },
                prefill: {
                    name: user.user_metadata?.full_name || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#22c55e'
                },
                modal: {
                    ondismiss: () => {
                        setPaymentStatus('idle');
                        setIsLoading(false);
                    }
                }
            });

            razorpay.open();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setPaymentStatus('failed');
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handlePurchaseClick}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent-primary/25 disabled:opacity-50 ${className}`}
            >
                <ShoppingCart size={18} />
                Buy Now - ₹{price.toLocaleString()}
            </button>

            {/* Purchase Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl">
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-display font-bold text-textMain">Complete Purchase</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Kit Info */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-surfaceHighlight border border-border/50">
                                <div className="flex-1">
                                    <p className="font-bold text-textMain line-clamp-2">{listingTitle}</p>
                                    {sellerName && (
                                        <p className="text-sm text-textMuted">by {sellerName}</p>
                                    )}
                                </div>
                                <p className="text-2xl font-display font-bold text-accent-primary">
                                    ₹{price.toLocaleString()}
                                </p>
                            </div>

                            {/* What's Included */}
                            <div>
                                <p className="text-sm font-medium text-textMuted mb-3">What you'll get:</p>
                                <ul className="space-y-2">
                                    {['Full source code access', 'Lifetime download access', 'Direct seller support', 'All future updates'].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-textMain">
                                            <CheckCircle size={14} className="text-accent-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* DEV Mode Banner */}
                            {DEV_MODE && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20">
                                    <Zap size={18} className="text-accent-secondary-fg" />
                                    <p className="text-sm text-accent-secondary-fg font-medium">
                                        DEV MODE: Payment will be simulated
                                    </p>
                                </div>
                            )}

                            {/* Security Badge */}
                            {!DEV_MODE && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
                                    <Shield size={18} className="text-accent-primary" />
                                    <p className="text-sm text-textMuted">
                                        Secure payment powered by <span className="font-medium text-textMain">Razorpay</span>
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success State */}
                            {paymentStatus === 'success' && (
                                <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-center">
                                    <CheckCircle size={40} className="text-accent-primary mx-auto mb-2" />
                                    <p className="font-bold text-textMain">Payment Successful!</p>
                                    <p className="text-sm text-textMuted">Redirecting to your order...</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {paymentStatus !== 'success' && (
                            <div className="p-6 border-t border-border">
                                <button
                                    onClick={handleConfirmPurchase}
                                    disabled={isLoading || paymentStatus === 'processing'}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent-primary/25 disabled:opacity-50"
                                >
                                    {paymentStatus === 'processing' ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {DEV_MODE ? <Zap size={18} /> : <CreditCard size={18} />}
                                            {DEV_MODE ? 'Test Payment' : `Pay ₹${price.toLocaleString()}`}
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-textMuted text-center mt-3">
                                    By purchasing, you agree to our Terms of Service
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PurchaseButton;

