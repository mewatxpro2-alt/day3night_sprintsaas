import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageSquare, Eye, Loader2, Calendar, Tag, User,
    Filter, CheckCircle, Clock, AlertTriangle, Mail, Package, AlertCircle
} from 'lucide-react';
import { useTickets, useUpdateTicketStatus, type Ticket } from '../../hooks/useTickets';

const AdminTickets: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'waiting' | 'under_review' | 'resolved'>('open');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'order' | 'contact_us' | 'dispute' | 'refund'>('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { tickets, isLoading, error, refetch } = useTickets({ status: statusFilter, isAdmin: true });
    const { updateStatus, isLoading: isUpdating } = useUpdateTicketStatus();

    // Filter tickets by source on client side (handle legacy tickets without source)
    const filteredTickets = sourceFilter === 'all'
        ? tickets
        : tickets.filter(t => t.source === sourceFilter || (!t.source && sourceFilter === 'order'));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'waiting': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'under_review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-surfaceHighlight text-textMuted border-border';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'contact_us': return <Mail size={12} className="text-blue-400" />;
            case 'order': return <Package size={12} className="text-green-400" />;
            case 'dispute': return <AlertCircle size={12} className="text-red-400" />;
            case 'refund': return <AlertTriangle size={12} className="text-amber-400" />;
            default: return <MessageSquare size={12} className="text-textMuted" />;
        }
    };

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'contact_us': return 'Contact Form';
            case 'order': return 'Order';
            case 'dispute': return 'Dispute';
            case 'refund': return 'Refund';
            default: return 'Direct';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-400';
            case 'high': return 'text-amber-400';
            case 'normal': return 'text-textMuted';
            case 'low': return 'text-textMuted/50';
            default: return 'text-textMuted';
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

    const handleStatusChange = async (ticketId: string, status: Ticket['status']) => {
        const result = await updateStatus(ticketId, status);
        if (result.success) {
            refetch();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => prev ? { ...prev, status } : null);
            }
        }
    };

    const getFilterClasses = (filter: string, current: string) => {
        if (current === filter) {
            return 'bg-accent-tertiary text-textInverse shadow-lg';
        }
        return 'bg-surface text-textMuted hover:text-textMain hover:bg-surfaceHighlight border border-border';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Support Tickets</h1>
                    <p className="text-textMuted">Manage user support requests</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-textMuted">{filteredTickets.length} tickets</span>
                </div>
            </div>

            {/* Status Filters */}
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-textMuted uppercase tracking-wider mr-2 self-center">Status:</span>
                    {(['all', 'open', 'waiting', 'under_review', 'resolved'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${getFilterClasses(status, statusFilter)}`}
                        >
                            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                {/* Source Filters */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-textMuted uppercase tracking-wider mr-2 self-center">Source:</span>
                    {(['all', 'contact_us', 'order', 'dispute', 'refund'] as const).map((source) => (
                        <button
                            key={source}
                            onClick={() => setSourceFilter(source)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${getFilterClasses(source, sourceFilter)}`}
                        >
                            {source !== 'all' && getSourceIcon(source)}
                            {source === 'all' ? 'All Sources' : getSourceLabel(source)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!error && filteredTickets.length === 0 && (
                <div className="text-center py-20 bg-surface border border-border rounded-2xl">
                    <MessageSquare size={48} className="mx-auto text-textMuted mb-4" />
                    <h3 className="text-lg font-bold text-textMain mb-2">No tickets found</h3>
                    <p className="text-textMuted">
                        {statusFilter === 'all' && sourceFilter === 'all'
                            ? "No support tickets have been created yet."
                            : `No matching tickets for the selected filters.`}
                    </p>
                </div>
            )}

            {/* Tickets Table */}
            {filteredTickets.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight border-b border-border">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Ticket</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Source</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Category</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Created</th>
                                <th className="text-center p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-textMuted">{ticket.ticket_number}</span>
                                                <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority === 'urgent' && '🔴'}
                                                    {ticket.priority === 'high' && '🟠'}
                                                </span>
                                            </div>
                                            <p className="font-medium text-textMain truncate max-w-[250px]">{ticket.subject}</p>
                                            {ticket.creator && (
                                                <p className="text-xs text-textMuted mt-1">
                                                    by {ticket.creator.full_name}
                                                </p>
                                            )}
                                            {ticket.contact_email && !ticket.creator && (
                                                <p className="text-xs text-textMuted mt-1">
                                                    📧 {ticket.contact_email}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5">
                                            {getSourceIcon(ticket.source || 'order')}
                                            <span className="text-xs text-textMuted">
                                                {getSourceLabel(ticket.source || 'order')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-sm ${ticket.category === 'refund_request' ? 'text-red-400 font-medium' : 'text-textMuted'}`}>
                                            {getCategoryLabel(ticket.category)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-textMuted">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                to={`/tickets/${ticket.id}`}
                                                className="p-2 text-textMuted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                                                title="View Ticket"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            {ticket.status !== 'resolved' && (
                                                <button
                                                    onClick={() => handleStatusChange(ticket.id, 'resolved')}
                                                    disabled={isUpdating}
                                                    className="p-2 text-textMuted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminTickets;
