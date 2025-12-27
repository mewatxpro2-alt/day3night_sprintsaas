import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle, Package, Loader2, AlertCircle, Tag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import type { Listing } from '../lib/database.types';
import type { LicenseType } from '../types/marketplace';

const Checkout: React.FC = () => {
    const { listingId } = useParams<{ listingId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [listing, setListing] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);

    // Get license type from URL or default to standard
    const licenseType = (searchParams.get('license') as LicenseType) || 'standard';

    // Calculate price based on license type
    const selectedPrice = useMemo(() => {
        if (!listing) return 0;
        switch (licenseType) {
            case 'buyout':
                return listing.license_buyout_price || listing.price;
            case 'extended':
                return listing.license_extended_price || listing.price;
            case 'standard':
            default:
                return listing.license_standard_price || listing.price;
        }
    }, [listing, licenseType]);

    // License labels for display
    const licenseLabels: Record<LicenseType, { name: string; description: string }> = {
        standard: { name: 'Standard License', description: 'Launch, modify, and monetize' },
        extended: { name: 'Extended License', description: 'Fewer buyers, less competition' },
        buyout: { name: 'Buyout License', description: 'Exclusive ownership' },
    };

    useEffect(() => {
        // Auth is handled by ProtectedRoute wrapper - no need to check here
        // Removing the duplicate check that was navigating without `from` state

        const fetchListing = async () => {
            if (!listingId) return;

            try {
                // Fetch listing details
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*, creator:profiles!listings_creator_id_fkey(id, full_name, avatar_url)')
                    .eq('id', listingId)
                    .single();

                if (listingError) throw listingError;
                setListing(listingData);

                // Check if user already purchased this
                if (user) {
                    const { data: existingOrder } = await supabase
                        .from('orders')
                        .select('id')
                        .eq('buyer_id', user.id)
                        .eq('listing_id', listingId)
                        .in('status', ['paid', 'delivered', 'completed'])
                        .maybeSingle();

                    if (existingOrder) {
                        setHasPurchased(true);
                    }
                }
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError('Failed to load checkout details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchListing();
    }, [listingId, user]);

    const handleDevPayment = async () => {
        if (!listing || !user) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Calculate amounts based on selected license
            const commissionRate = 0.1; // 10% platform fee
            const priceAmount = selectedPrice;
            const commissionAmount = priceAmount * commissionRate;
            const sellerAmount = priceAmount - commissionAmount;

            // Create order with license type
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    seller_id: listing.creator_id,
                    listing_id: listing.id,
                    price_amount: priceAmount,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    seller_amount: sellerAmount,
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    license_type: licenseType,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order access (this gives buyer access to resources)
            const { error: accessError } = await supabase
                .from('order_access')
                .insert({
                    order_id: order.id,
                    source_files_url: listing.source_files_url || null,
                });

            if (accessError) throw accessError;

            // Redirect to success page
            navigate(`/payment-success/${order.id}`);
        } catch (err: any) {
            console.error('Payment error:', err);
            if (err.message?.includes('duplicate')) {
                setError('You have already purchased this blueprint');
            } else {
                setError('Payment failed. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-textMuted">Blueprint not found</p>
                <Button onClick={() => navigate('/mvp-kits')}>Browse Blueprints</Button>
            </div>
        );
    }

    if (hasPurchased) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto px-6">
                <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <CheckCircle className="text-accent-primary" size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold text-textMain">Already Purchased</h2>
                <p className="text-textMuted">You already own this blueprint. Access it from your orders.</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate('/mvp-kits')}>
                        Browse More
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>View Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate(`/listing/${listingId}`)}
                    className="flex items-center gap-2 text-textMuted hover:text-textMain transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Blueprint
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-textMain mb-2">Checkout</h1>
                            <p className="text-textMuted">Complete your purchase to get lifetime access</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Kit Details */}
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <div className="flex gap-4">
                                {listing.image_url && (
                                    <img
                                        src={listing.image_url}
                                        alt={listing.title}
                                        className="w-24 h-24 rounded-lg object-cover border border-border"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-textMain mb-1">{listing.title}</h3>
                                    {listing.tagline && (
                                        <p className="text-sm text-textMuted mb-2">{listing.tagline}</p>
                                    )}
                                    <p className="text-xs text-textMuted">
                                        by {listing.creator?.full_name || 'Anonymous'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Get */}
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-sm font-bold text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Package size={16} />
                                What You'll Get
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-textMuted">
                                    <CheckCircle size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <span>Full source code access</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-textMuted">
                                    <CheckCircle size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <span>Setup and deployment documentation</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-textMuted">
                                    <CheckCircle size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <span>Direct messaging with the creator</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-textMuted">
                                    <CheckCircle size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <span>Lifetime access and updates</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-textMuted">
                                    <CheckCircle size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <span>Commercial usage rights</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Payment */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">
                                Order Summary
                            </h3>

                            {/* Selected License */}
                            <div className="p-3 rounded-lg bg-surfaceHighlight border border-border mb-4">
                                <div className="flex items-start gap-3">
                                    <Tag size={16} className="text-accent-primary mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-bold text-textMain">{licenseLabels[licenseType].name}</div>
                                        <div className="text-xs text-textMuted">{licenseLabels[licenseType].description}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-textMuted">{licenseLabels[licenseType].name}</span>
                                    <span className="text-textMain font-medium">₹{selectedPrice}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-textMuted">Platform Fee</span>
                                    <span className="text-textMain font-medium">₹0</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between">
                                    <span className="font-bold text-textMain">Total</span>
                                    <span className="font-bold text-textMain text-lg">₹{selectedPrice}</span>
                                </div>
                            </div>

                            {/* Dev Mode Payment Button */}
                            <Button
                                className="w-full h-12 text-base font-semibold shadow-lg"
                                onClick={handleDevPayment}
                                isLoading={isProcessing}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Complete Purchase (Dev Mode)'}
                            </Button>

                            <div className="mt-4 p-3 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
                                <p className="text-xs text-accent-primary font-medium">
                                    💳 Development Mode: This simulates a successful payment
                                </p>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-surfaceHighlight/30 border border-border rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck size={18} className="text-accent-tertiary shrink-0 mt-0.5" />
                                <div className="text-xs text-textMuted">
                                    <p className="font-semibold text-textMain mb-1">Secure Transaction</p>
                                    <p>Your payment information is encrypted and secure. All purchases are protected by our buyer guarantee.</p>
                                </div>
                            </div>
                        </div>

                        {/* Guarantee */}
                        <div className="bg-surfaceHighlight/30 border border-border rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Lock size={18} className="text-accent-primary shrink-0 mt-0.5" />
                                <div className="text-xs text-textMuted">
                                    <p className="font-semibold text-textMain mb-1">7-Day Money Back Guarantee</p>
                                    <p>Not satisfied? Get a full refund within 7 days of purchase, no questions asked.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
