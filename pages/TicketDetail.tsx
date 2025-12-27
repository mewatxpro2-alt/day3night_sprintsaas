import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, MessageSquare, Send, Paperclip, Clock, CheckCircle,
    AlertCircle, Loader2, User, Calendar, Tag, FileText
} from 'lucide-react';
import { useTicketDetail, useSendTicketMessage, useUpdateTicketStatus, type Ticket } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { ticket, messages, isLoading, error, refetch } = useTicketDetail(id);
    const { sendMessage, isLoading: isSending } = useSendTicketMessage();
    const { updateStatus, isLoading: isUpdating } = useUpdateTicketStatus();
    const [newMessage, setNewMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    // Check if user is admin
    React.useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            const { data } = await (await import('../lib/supabase')).supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setIsAdmin(data?.role === 'admin');
        };
        checkAdmin();
    }, [user]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !id) return;

        const result = await sendMessage(id, newMessage.trim());
        if (result.success) {
            setNewMessage('');
            refetch();
        }
    };

    const handleStatusChange = async (status: Ticket['status']) => {
        if (!id) return;
        const result = await updateStatus(id, status);
        if (result.success) {
            refetch();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'waiting': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'under_review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-surfaceHighlight text-textMuted border-border';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
                <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-textMain mb-2">Ticket Not Found</h2>
                <p className="text-textMuted mb-6">{error || "This ticket doesn't exist or you don't have access."}</p>
                <Link to="/tickets">
                    <Button variant="outline">Back to Tickets</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto animate-fade-in">
            {/* Back Button */}
            <Link to="/tickets" className="inline-flex items-center gap-2 text-textMuted hover:text-textMain mb-6 transition-colors">
                <ArrowLeft size={16} />
                Back to Tickets
            </Link>

            {/* Ticket Header */}
            <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-textMuted">{ticket.ticket_number}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h1 className="text-2xl font-display font-bold text-textMain">{ticket.subject}</h1>
                    </div>

                    {/* Admin Status Controls */}
                    {isAdmin && ticket.status !== 'resolved' && (
                        <div className="flex flex-wrap gap-2">
                            {ticket.status !== 'under_review' && (
                                <button
                                    onClick={() => handleStatusChange('under_review')}
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                                >
                                    Mark Under Review
                                </button>
                            )}
                            <button
                                onClick={() => handleStatusChange('resolved')}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                            >
                                Mark Resolved
                            </button>
                        </div>
                    )}
                </div>

                {/* Ticket Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-surfaceHighlight rounded-lg">
                        <p className="text-xs text-textMuted uppercase mb-1">Category</p>
                        <p className="text-textMain font-medium capitalize">
                            {ticket.category.replace('_', ' ')}
                        </p>
                    </div>
                    <div className="p-3 bg-surfaceHighlight rounded-lg">
                        <p className="text-xs text-textMuted uppercase mb-1">Created</p>
                        <p className="text-textMain font-medium">
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    {ticket.order && (
                        <div className="p-3 bg-surfaceHighlight rounded-lg col-span-2">
                            <p className="text-xs text-textMuted uppercase mb-1">Related Order</p>
                            <p className="text-textMain font-medium">
                                {ticket.order.order_number}
                                {ticket.order.listing && ` • ${ticket.order.listing.title}`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                    <MessageSquare size={18} />
                    Conversation
                </h2>

                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-textMuted">
                            No messages yet.
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwnMessage = msg.sender_id === user?.id;
                            const senderRole = msg.sender?.role;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${senderRole === 'admin'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-accent-primary/20 text-accent-primary'
                                        }`}>
                                        {msg.sender?.avatar_url ? (
                                            <img src={msg.sender.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User size={18} />
                                        )}
                                    </div>
                                    <div className={`flex-1 max-w-[80%] ${isOwnMessage ? 'text-right' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-sm font-medium ${senderRole === 'admin' ? 'text-purple-400' : 'text-textMain'
                                                }`}>
                                                {msg.sender?.full_name || 'Unknown'}
                                                {senderRole === 'admin' && ' (Admin)'}
                                            </span>
                                            <span className="text-xs text-textMuted">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-3 rounded-lg ${isOwnMessage
                                                ? 'bg-accent-primary/10 border border-accent-primary/20'
                                                : 'bg-surfaceHighlight border border-border'
                                            }`}>
                                            <p className="text-textMain text-sm whitespace-pre-wrap">{msg.content}</p>
                                            {msg.attachment_url && (
                                                <a
                                                    href={msg.attachment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 mt-2 text-xs text-accent-primary hover:underline"
                                                >
                                                    <Paperclip size={12} />
                                                    {msg.attachment_name || 'Attachment'}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Reply Form */}
                {ticket.status !== 'resolved' ? (
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none"
                        />
                        <Button type="submit" disabled={isSending || !newMessage.trim()}>
                            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </Button>
                    </form>
                ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <CheckCircle size={24} className="mx-auto text-green-400 mb-2" />
                        <p className="text-green-400 font-medium">This ticket has been resolved</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetail;
