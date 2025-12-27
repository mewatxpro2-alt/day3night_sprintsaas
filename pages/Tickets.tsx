import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MessageSquare, Plus, Clock, CheckCircle, AlertCircle,
    Filter, Loader2, ArrowRight, Tag, Calendar
} from 'lucide-react';
import { useTickets, type Ticket } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const Tickets: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'waiting' | 'under_review' | 'resolved'>('all');
    const { tickets, isLoading, error } = useTickets({ status: statusFilter, myTicketsOnly: true });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'waiting':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'under_review':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'resolved':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            default:
                return 'bg-surfaceHighlight text-textMuted border-border';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'delivery_issue': return 'Delivery Issue';
            case 'clarification': return 'Clarification';
            case 'refund_request': return 'Refund Request';
            case 'technical': return 'Technical';
            default: return 'Other';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-[80vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <MessageSquare size={48} className="text-textMuted mb-6" />
                <h2 className="text-2xl font-display font-bold text-textMain mb-4">Sign In Required</h2>
                <p className="text-textSecondary mb-6">You must be signed in to view your support tickets.</p>
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Support Tickets</h1>
                    <p className="text-textMuted">Get help with your orders and purchases</p>
                </div>
                <Link to="/tickets/new">
                    <Button className="flex items-center gap-2">
                        <Plus size={16} />
                        New Ticket
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {(['all', 'open', 'waiting', 'under_review', 'resolved'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-accent-primary text-white'
                                : 'bg-surface text-textMuted border border-border hover:bg-surfaceHighlight'
                            }`}
                    >
                        {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-accent-primary" size={32} />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && tickets.length === 0 && (
                <div className="text-center py-20 bg-surface border border-border rounded-2xl">
                    <MessageSquare size={48} className="mx-auto text-textMuted mb-4" />
                    <h3 className="text-lg font-bold text-textMain mb-2">No tickets found</h3>
                    <p className="text-textMuted mb-6">
                        {statusFilter === 'all'
                            ? "You haven't created any support tickets yet."
                            : `No ${statusFilter.replace('_', ' ')} tickets.`}
                    </p>
                    <Link to="/tickets/new">
                        <Button variant="outline">Create Your First Ticket</Button>
                    </Link>
                </div>
            )}

            {/* Tickets List */}
            {!isLoading && !error && tickets.length > 0 && (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="block p-5 bg-surface border border-border rounded-xl hover:border-accent-primary/30 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-textMuted">
                                            {ticket.ticket_number}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-xs bg-surfaceHighlight text-textMuted border border-border">
                                            {getCategoryLabel(ticket.category)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-textMain mb-1 truncate group-hover:text-accent-primary transition-colors">
                                        {ticket.subject}
                                    </h3>
                                    {ticket.order && (
                                        <p className="text-sm text-textMuted">
                                            Order: {ticket.order.order_number}
                                            {ticket.order.listing && ` • ${ticket.order.listing.title}`}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right text-xs text-textMuted">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-textMuted group-hover:text-accent-primary transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Tickets;
