import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, AlertCircle, Loader2, CheckCircle,
    FileWarning, HelpCircle, Package, Settings, XCircle
} from 'lucide-react';
import { useCreateRefundRequest, type RefundRequest } from '../hooks/useRefundsAndWithdrawals';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface OrderInfo {
    id: string;
    order_number: string;
    price_amount: number;
    created_at: string;
    listing: {
        title: string;
    };
}

const RequestRefund: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { createRequest, isLoading, error } = useCreateRefundRequest();

    const [order, setOrder] = useState<OrderInfo | null>(null);
    const [orderLoading, setOrderLoading] = useState(true);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        reason: '' as RefundRequest['reason'] | '',
        description: '',
    });

    // Fetch order details
    React.useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !user) {
                setOrderLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, order_number, price_amount, created_at, listing:listings(title), buyer_id')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;

                if (data.buyer_id !== user.id) {
                    setOrderError('You can only request refunds for your own orders');
                    return;
                }

                setOrder({
                    id: data.id,
                    order_number: data.order_number,
                    price_amount: data.price_amount,
                    created_at: data.created_at,
                    listing: Array.isArray(data.listing) ? data.listing[0] : data.listing,
                });
            } catch (err) {
                setOrderError(err instanceof Error ? err.message : 'Failed to load order');
            } finally {
                setOrderLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reason || !formData.description.trim() || !orderId) {
            return;
        }

        const result = await createRequest({
            orderId,
            reason: formData.reason,
            description: formData.description.trim(),
        });

        if (result.success) {
            setSuccess(true);
        }
    };

    const reasonOptions = [
        {
            value: 'not_as_described',
            label: 'Not as Described',
            icon: FileWarning,
            description: 'The product differs significantly from its listing'
        },
        {
            value: 'technical_issues',
            label: 'Technical Issues',
            icon: Settings,
            description: 'Code errors, bugs, or setup problems'
        },
        {
            value: 'missing_files',
            label: 'Missing Files',
            icon: Package,
            description: 'Expected files or resources are not included'
        },
        {
            value: 'quality_issues',
            label: 'Quality Issues',
            icon: XCircle,
            description: 'Code quality or documentation is poor'
        },
        {
            value: 'other',
            label: 'Other',
            icon: HelpCircle,
            description: 'Another reason not listed above'
        },
    ];

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <AlertCircle size={48} className="text-textMuted mb-6" />
                <h2 className="text-2xl font-display font-bold text-textMain mb-4">Sign In Required</h2>
                <p className="text-textSecondary mb-6">You must be signed in to request a refund.</p>
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </div>
        );
    }

    if (orderLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (orderError || !order) {
        return (
            <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
                <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-textMain mb-2">Error</h2>
                <p className="text-textMuted mb-6">{orderError || 'Order not found'}</p>
                <Link to="/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center animate-fade-in">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
                    <CheckCircle size={64} className="mx-auto text-green-400 mb-6" />
                    <h2 className="text-2xl font-display font-bold text-textMain mb-4">Refund Request Submitted</h2>
                    <p className="text-textMuted mb-6">
                        Your refund request has been submitted for review. Our team will review it and get back to you within 2-3 business days.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/tickets">
                            <Button variant="outline">View Your Tickets</Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto animate-fade-in">
            {/* Back Button */}
            <Link to={`/order/${orderId}`} className="inline-flex items-center gap-2 text-textMuted hover:text-textMain mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Order
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Request Refund</h1>
                <p className="text-textMuted">Tell us why you'd like a refund for this order</p>
            </div>

            {/* Order Summary */}
            <div className="bg-surfaceHighlight border border-border rounded-xl p-4 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-textMuted font-mono">{order.order_number}</p>
                        <p className="font-medium text-textMain">{order.listing?.title || 'Unknown Product'}</p>
                        <p className="text-xs text-textMuted mt-1">
                            Purchased on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-accent-primary">₹{order.price_amount}</p>
                        <p className="text-xs text-textMuted">Refund Amount</p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div className="space-y-3">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Reason for Refund <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                        {reasonOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = formData.reason === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, reason: option.value as any }))}
                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${isSelected
                                            ? 'bg-accent-primary/10 border-accent-primary/30 ring-1 ring-accent-primary/20'
                                            : 'bg-surfaceHighlight border-border hover:border-accent-primary/20'
                                        }`}
                                >
                                    <Icon size={20} className={isSelected ? 'text-accent-primary' : 'text-textMuted'} />
                                    <div>
                                        <p className={`font-medium ${isSelected ? 'text-accent-primary' : 'text-textMain'}`}>
                                            {option.label}
                                        </p>
                                        <p className="text-xs text-textMuted">{option.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Detailed Explanation <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please describe the issue in detail. Include specific examples, error messages, or screenshots links if applicable..."
                        rows={5}
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none resize-none"
                        required
                    />
                    <p className="text-xs text-textMuted">
                        Minimum 50 characters. The more detail you provide, the faster we can process your request.
                    </p>
                </div>

                {/* Policy Notice */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-400">
                        <strong>Refund Policy:</strong> Refunds are reviewed within 2-3 business days.
                        Approved refunds will be processed to your original payment method.
                        We may request additional information before processing.
                    </p>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={isLoading || !formData.reason || formData.description.length < 50}
                    className="w-full"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        'Submit Refund Request'
                    )}
                </Button>
            </form>
        </div>
    );
};

export default RequestRefund;
