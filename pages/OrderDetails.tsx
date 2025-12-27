import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Download, MessageSquare, Calendar, Shield, AlertTriangle,
    CheckCircle, Package, FileText, PlayCircle, Image as ImageIcon,
    Lock, Send, User, Loader2, ExternalLink, Code, BookOpen, TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

interface OrderWithDetails {
    id: string;
    order_number: string;
    status: string;
    price_amount: number;
    commission_rate: number;
    created_at: string;
    buyer_id: string;
    seller_id: string;
    listing: {
        id: string;
        title: string;
        image_url?: string;
        description?: string;
        preview_url?: string;
    };
    seller: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    order_access?: Array<{
        id: string;
        source_files_url?: string;
        download_count: number;
        max_downloads: number;
    }>;
}

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender: {
        full_name: string;
        avatar_url?: string;
    };
}

interface KitResource {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
    file_size_bytes?: number;
    description?: string;
    linked_deliverable?: string;
}

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [kitResources, setKitResources] = useState<KitResource[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id || !user) return;

            try {
                const { data, error: orderError } = await supabase
                    .from('orders')
                    .select(`
            id,
            order_number,
            status,
            price_amount,
            commission_rate,
            created_at,
            buyer_id,
            seller_id,
            listing:listings(
              id,
              title,
              image_url,
              description,
              preview_url
            ),
            seller:profiles!orders_seller_id_fkey(id, full_name, avatar_url),
            order_access(id, source_files_url, download_count, max_downloads)
          `)
                    .eq('id', id)
                    .single();

                if (orderError) throw orderError;

                // Check access: buyer, seller, or admin
                const isOwner = data.buyer_id === user.id || data.seller_id === user.id;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                const isAdmin = profile?.role === 'admin';

                if (!isOwner && !isAdmin) {
                    setHasAccess(false);
                    setOrder(data as any);
                    setIsLoading(false);
                    return;
                }

                setHasAccess(true);
                setOrder(data as any);

                // Fetch messages if has access and order is paid
                if (['paid', 'delivered', 'completed'].includes(data.status)) {
                    fetchMessages();

                    // Fetch kit resources for the listing
                    const listingData = Array.isArray(data.listing) ? data.listing[0] : data.listing;
                    if (listingData?.id) {
                        const { data: resources } = await supabase
                            .from('kit_resources')
                            .select('id, file_name, file_type, file_url, file_size_bytes, description, linked_deliverable')
                            .eq('listing_id', listingData.id);

                        if (resources) {
                            setKitResources(resources);
                        }
                    }
                }
            } catch (err: any) {
                console.error('Error fetching order:', err);
                setError(err.message || 'Failed to load order');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id, user]);

    const fetchMessages = async () => {
        if (!id) return;

        const { data, error } = await supabase
            .from('messages')
            .select(`
        id,
        sender_id,
        content,
        created_at,
        sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
            .eq('order_id', id)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setMessages(data as any);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !id || !user || !order) return;

        setIsSendingMessage(true);

        try {
            const receiverId = user.id === order.buyer_id ? order.seller_id : order.buyer_id;

            const { error: sendError } = await supabase
                .from('messages')
                .insert({
                    order_id: id,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    content: newMessage.trim(),
                });

            if (sendError) throw sendError;

            setNewMessage('');
            fetchMessages();
        } catch (err: any) {
            console.error('Error sending message:', err);
            alert(err.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleDownload = async () => {
        if (!order?.order_access?.[0]?.source_files_url) return;

        const access = order.order_access[0];

        // Increment download count
        await supabase
            .from('order_access')
            .update({ download_count: access.download_count + 1 })
            .eq('id', access.id);

        window.open(access.source_files_url, '_blank');

        // Refresh order
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-400">{error || 'Order not found'}</p>
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    // Soft denial for unauthorized access
    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-background py-12 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 mb-6">
                            <Lock className="text-accent-secondary" size={40} />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-textMain mb-3">
                            Purchase Required
                        </h1>
                        <p className="text-textMuted text-lg mb-8">
                            You need to purchase this blueprint to access all resources and support.
                        </p>
                    </div>

                    {/* What You'll Get */}
                    <div className="bg-surface border border-border rounded-2xl p-8 mb-8 text-left">
                        <h3 className="text-lg font-bold text-textMain mb-6 text-center">What You'll Get</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-accent-primary mt-0.5 shrink-0" />
                                <span className="text-textMuted">Complete source code and project files</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-accent-primary mt-0.5 shrink-0" />
                                <span className="text-textMuted">Setup and deployment documentation</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-accent-primary mt-0.5 shrink-0" />
                                <span className="text-textMuted">Direct messaging with the creator</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={20} className="text-accent-primary mt-0.5 shrink-0" />
                                <span className="text-textMuted">Lifetime access and commercial usage rights</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate('/mvp-kits')}>
                            Browse More
                        </Button>
                        <Button onClick={() => navigate(`/checkout/${order.listing.id}`)}>
                            Purchase Now - ₹{order.price_amount}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isBuyer = user?.id === order.buyer_id;
    const access = order.order_access?.[0];
    const downloadsRemaining = access ? access.max_downloads - access.download_count : 0;

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-textMuted hover:text-textMain transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Header */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                {order.listing.image_url && (
                                    <img
                                        src={order.listing.image_url}
                                        alt={order.listing.title}
                                        className="w-24 h-24 rounded-xl object-cover border border-border"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h1 className="text-2xl font-display font-bold text-textMain mb-1">
                                                {order.listing.title}
                                            </h1>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20">
                                            <span className="text-sm font-medium text-accent-primary">
                                                {order.status === 'paid' && 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-textMuted mb-2">Order #{order.order_number}</p>
                                    <div className="flex items-center gap-3 text-sm text-textMuted">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span>by {order.seller.full_name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resources Section */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                                <Package size={20} />
                                Your Resources
                            </h2>

                            <div className="space-y-6">
                                {/* Getting Started */}
                                <div>
                                    <h3 className="text-sm font-bold text-textMain uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <BookOpen size={16} />
                                        Getting Started
                                    </h3>
                                    <div className="space-y-2">
                                        {order.listing.description && (
                                            <div className="p-4 bg-surfaceHighlight rounded-lg border border-border">
                                                <p className="text-sm text-textMuted whitespace-pre-line">{order.listing.description}</p>
                                            </div>
                                        )}
                                        {order.listing.preview_url && (
                                            <a
                                                href={order.listing.preview_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-surfaceHighlight rounded-lg border border-border hover:border-accent-primary/30 transition-colors text-sm"
                                            >
                                                <ExternalLink size={16} className="text-accent-primary" />
                                                <span className="text-textMain">View Live Preview</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Code & Assets */}
                                <div>
                                    <h3 className="text-sm font-bold text-textMain uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Code size={16} />
                                        Code & Assets
                                    </h3>
                                    <div className="space-y-2">
                                        {access?.source_files_url ? (
                                            <button
                                                onClick={handleDownload}
                                                disabled={downloadsRemaining <= 0}
                                                className="w-full flex items-center justify-between p-4 bg-accent-primary/10 rounded-lg border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Download size={20} className="text-accent-primary" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-textMain">Download Source Files</p>
                                                        <p className="text-xs text-textMuted">
                                                            {downloadsRemaining} download{downloadsRemaining !== 1 ? 's' : ''} remaining
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="p-4 bg-surfaceHighlight rounded-lg border border-border text-sm text-textMuted">
                                                Files will be available soon. Contact the seller for updates.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Downloadable Resources from kit_resources */}
                                {kitResources.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-bold text-textMain uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Package size={16} />
                                            Downloadable Resources ({kitResources.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {kitResources.map((resource) => (
                                                <a
                                                    key={resource.id}
                                                    href={resource.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-surfaceHighlight rounded-lg border border-border hover:border-accent-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-accent-primary/10 rounded-lg flex items-center justify-center">
                                                            <Download size={16} className="text-accent-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-textMain">{resource.file_name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-textMuted">
                                                                <span className="px-1.5 py-0.5 bg-surface rounded border border-border uppercase font-mono">
                                                                    {resource.file_type}
                                                                </span>
                                                                {resource.file_size_bytes && (
                                                                    <span>{(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                                                                )}
                                                            </div>
                                                            {resource.description && (
                                                                <p className="text-xs text-textMuted mt-1">{resource.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Download size={16} className="text-accent-primary shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messaging Section */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-textMain mb-4 flex items-center gap-2">
                                <MessageSquare size={20} />
                                Questions about this blueprint?
                            </h2>
                            <p className="text-sm text-textMuted mb-6">
                                Message {isBuyer ? 'the creator' : 'your buyer'} directly for support and clarification.
                            </p>

                            {/* Messages */}
                            <div className="mb-4 max-h-96 overflow-y-auto space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-textMuted text-sm">
                                        No messages yet. Start the conversation!
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isOwnMessage = msg.sender_id === user?.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center shrink-0">
                                                    {msg.sender.avatar_url ? (
                                                        <img src={msg.sender.avatar_url} alt="" className="rounded-full" />
                                                    ) : (
                                                        <User size={16} className="text-textMuted" />
                                                    )}
                                                </div>
                                                <div className={`flex-1 max-w-md ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                                    <p className="text-xs text-textMuted mb-1">
                                                        {msg.sender.full_name} • {new Date(msg.created_at).toLocaleString()}
                                                    </p>
                                                    <div
                                                        className={`inline-block p-3 rounded-lg ${isOwnMessage
                                                            ? 'bg-accent-primary/10 text-textMain'
                                                            : 'bg-surfaceHighlight text-textMuted'
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted/50 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSendingMessage}
                                    className="px-6 py-3 bg-accent-primary text-accent-primary-fg font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSendingMessage ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">
                                Order Summary
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-textMuted">Blueprint Price</span>
                                    <span className="text-textMain font-medium">₹{order.price_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-textMuted">Platform Fee</span>
                                    <span className="text-textMuted">Included</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between">
                                    <span className="font-bold text-textMain">Total Paid</span>
                                    <span className="font-bold text-accent-primary">₹{order.price_amount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">
                                Creator
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-surfaceHighlight border border-border flex items-center justify-center">
                                    {order.seller.avatar_url ? (
                                        <img src={order.seller.avatar_url} alt="" className="rounded-full" />
                                    ) : (
                                        <User size={20} className="text-textMuted" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-textMain">{order.seller.full_name}</p>
                                    <p className="text-xs text-textMuted">Verified Creator</p>
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-surfaceHighlight/50 border border-border rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <Shield size={18} className="text-accent-primary shrink-0 mt-0.5" />
                                <div className="text-xs text-textMuted">
                                    <p className="font-semibold text-textMain mb-1">Buyer Protection</p>
                                    <p>All purchases are protected by our 7-day money-back guarantee.</p>
                                </div>
                            </div>
                        </div>

                        {/* Need Help */}
                        <Link
                            to={`/tickets/new?order=${order.id}`}
                            className="block bg-surface border border-border rounded-2xl p-6 hover:border-accent-primary/30 transition-colors group"
                        >
                            <div className="flex items-start gap-3">
                                <MessageSquare size={18} className="text-accent-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-textMain mb-1 group-hover:text-accent-primary transition-colors">
                                        Need Help?
                                    </p>
                                    <p className="text-xs text-textMuted">
                                        Create a support ticket for questions, issues, or refund requests.
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Request Refund */}
                        {isBuyer && (
                            <Link
                                to={`/order/${order.id}/refund`}
                                className="block bg-red-500/5 border border-red-500/20 rounded-2xl p-6 hover:bg-red-500/10 transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-textMain mb-1 group-hover:text-red-400 transition-colors">
                                            Request Refund
                                        </p>
                                        <p className="text-xs text-textMuted">
                                            Not satisfied? Request a refund within 7 days.
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
