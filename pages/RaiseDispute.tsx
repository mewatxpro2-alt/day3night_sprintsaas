import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import { useCreateDispute } from '../hooks/useDisputes';

const RaiseDispute: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { order, isLoading: orderLoading } = useOrder(id);
    const { createDispute, isLoading: creating, error } = useCreateDispute();
    const navigate = useNavigate();
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState(false);

    const reasonOptions = [
        'Product not as described',
        'Source files missing or incomplete',
        'Technical issues with the kit',
        'Seller not responding',
        'Other issue',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !reason) return;

        const result = await createDispute(id, reason, description);
        if (result) {
            setSuccess(true);
        }
    };

    if (orderLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!order) {
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

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="max-w-md w-full text-center animate-fade-in">
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-accent-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-textMain mb-2">
                        Dispute Submitted
                    </h2>
                    <p className="text-textMuted mb-6">
                        Our team will review your case and get back to you within 24-48 hours.
                    </p>
                    <Link
                        to={`/order/${id}`}
                        className="inline-block px-6 py-3 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all"
                    >
                        Back to Order
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-lg mx-auto">
                {/* Back Link */}
                <Link
                    to={`/order/${id}`}
                    className="inline-flex items-center gap-2 text-textMuted hover:text-textMain transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Order
                </Link>

                <div className="bg-surface border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-red-500/10">
                            <AlertTriangle size={22} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-textMain">
                                Report an Issue
                            </h1>
                            <p className="text-sm text-textMuted">
                                Order #{order.order_number}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-3">
                                What's the issue?
                            </label>
                            <div className="space-y-2">
                                {reasonOptions.map((option) => (
                                    <label
                                        key={option}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${reason === option
                                                ? 'bg-accent-primary/10 border-accent-primary/30'
                                                : 'bg-surfaceHighlight border-border hover:border-accent-primary/20'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={option}
                                            checked={reason === option}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${reason === option
                                                    ? 'border-accent-primary bg-accent-primary'
                                                    : 'border-border'
                                                }`}
                                        >
                                            {reason === option && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-textMain">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">
                                Additional details
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Please provide more details about your issue..."
                                className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary resize-none"
                            />
                        </div>

                        {/* Warning */}
                        <div className="p-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-sm text-textMuted">
                            <strong className="text-textMain">Before submitting:</strong> Try messaging the seller first. Many issues can be resolved quickly through direct communication.
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!reason || creating}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {creating ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={18} />
                                    Submit Dispute
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RaiseDispute;
