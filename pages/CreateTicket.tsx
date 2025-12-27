import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
    ArrowLeft, MessageSquare, AlertCircle, Loader2,
    Package, HelpCircle, RefreshCw, Wrench
} from 'lucide-react';
import { useCreateTicket, type Ticket } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface UserOrder {
    id: string;
    order_number: string;
    listing: {
        title: string;
    };
    seller_id: string;
}

const CreateTicket: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();
    const { createTicket, isLoading, error } = useCreateTicket();

    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    const [formData, setFormData] = useState({
        orderId: searchParams.get('order') || '',
        category: (searchParams.get('category') || 'clarification') as Ticket['category'],
        subject: '',
        message: '',
    });

    // Fetch user's orders for selection
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('orders')
                .select('id, order_number, listing:listings(title), seller_id')
                .eq('buyer_id', user.id)
                .in('status', ['paid', 'delivered', 'completed'])
                .order('created_at', { ascending: false });

            setOrders(data as any || []);
            setLoadingOrders(false);
        };

        fetchOrders();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        // Get seller ID if order is selected
        const selectedOrder = orders.find(o => o.id === formData.orderId);

        const result = await createTicket({
            orderId: formData.orderId || undefined,
            subject: formData.subject.trim(),
            category: formData.category,
            message: formData.message.trim(),
            buyerId: user?.id,
            sellerId: selectedOrder?.seller_id,
            involvesAdmin: formData.category === 'refund_request',
        });

        if (result.success) {
            navigate(`/tickets/${result.ticketId}`);
        }
    };

    const categoryOptions = [
        { value: 'clarification', label: 'Clarification', icon: HelpCircle, description: 'Questions about the product' },
        { value: 'delivery_issue', label: 'Delivery Issue', icon: Package, description: 'Problems accessing files' },
        { value: 'refund_request', label: 'Refund Request', icon: RefreshCw, description: 'Request a refund (admin review)' },
        { value: 'technical', label: 'Technical', icon: Wrench, description: 'Technical issues or bugs' },
        { value: 'other', label: 'Other', icon: MessageSquare, description: 'Other inquiries' },
    ];

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <MessageSquare size={48} className="text-textMuted mb-6" />
                <h2 className="text-2xl font-display font-bold text-textMain mb-4">Sign In Required</h2>
                <p className="text-textSecondary mb-6">You must be signed in to create a support ticket.</p>
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto animate-fade-in">
            {/* Back Button */}
            <Link to="/tickets" className="inline-flex items-center gap-2 text-textMuted hover:text-textMain mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Tickets
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Create Support Ticket</h1>
                <p className="text-textMuted">Describe your issue and we'll help you resolve it</p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Related Order */}
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Related Order <span className="text-textMuted normal-case">(optional)</span>
                    </label>
                    {loadingOrders ? (
                        <div className="p-4 bg-surfaceHighlight rounded-lg flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-textMuted" />
                            <span className="text-textMuted text-sm">Loading your orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-4 bg-surfaceHighlight rounded-lg text-textMuted text-sm">
                            No orders found. You can still create a general ticket.
                        </div>
                    ) : (
                        <select
                            value={formData.orderId}
                            onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                            className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain focus:border-accent-primary focus:outline-none"
                        >
                            <option value="">No specific order</option>
                            {orders.map((order) => (
                                <option key={order.id} value={order.id}>
                                    {order.order_number} - {Array.isArray(order.listing) ? order.listing[0]?.title : order.listing?.title}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Category <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryOptions.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = formData.category === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value as any }))}
                                    className={`p-4 rounded-xl border text-left transition-all ${isSelected
                                            ? 'bg-accent-primary/10 border-accent-primary/30 ring-1 ring-accent-primary/20'
                                            : 'bg-surfaceHighlight border-border hover:border-accent-primary/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isSelected ? 'text-accent-primary' : 'text-textMuted'} />
                                        <div>
                                            <p className={`font-medium ${isSelected ? 'text-accent-primary' : 'text-textMain'}`}>
                                                {cat.label}
                                            </p>
                                            <p className="text-xs text-textMuted">{cat.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief summary of your issue"
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none"
                        required
                    />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <label className="text-xs font-mono font-medium text-textSecondary uppercase tracking-wider">
                        Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Please describe your issue in detail..."
                        rows={5}
                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none resize-none"
                        required
                    />
                </div>

                {/* Refund Warning */}
                {formData.category === 'refund_request' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-sm text-amber-400">
                            <strong>Note:</strong> Refund requests are reviewed by our admin team.
                            Please provide as much detail as possible about why the product didn't meet your expectations.
                        </p>
                    </div>
                )}

                {/* Submit */}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            <MessageSquare size={18} />
                            Create Ticket
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};

export default CreateTicket;
