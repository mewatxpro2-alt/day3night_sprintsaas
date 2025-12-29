import React, { useState } from 'react';
import {
    RefreshCw, Loader2, Eye, Check, X, AlertTriangle,
    DollarSign, Calendar, User, MessageSquare
} from 'lucide-react';
import { useAdminRefundRequests, useUpdateRefundStatus, type RefundRequest } from '../../hooks/useRefundsAndWithdrawals';

const AdminRefunds: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('reported');
    const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const { requests, isLoading, error, refetch } = useAdminRefundRequests(statusFilter);
    const { updateStatus, isLoading: isUpdating } = useUpdateRefundStatus();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'reported': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'under_review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-surfaceHighlight text-textMuted border-border';
        }
    };

    const getReasonLabel = (reason: string) => {
        switch (reason) {
            case 'not_as_described': return 'Not as Described';
            case 'technical_issues': return 'Technical Issues';
            case 'missing_files': return 'Missing Files';
            case 'quality_issues': return 'Quality Issues';
            default: return 'Other';
        }
    };

    const handleAction = async (status: 'under_review' | 'approved' | 'rejected' | 'completed') => {
        if (!selectedRequest) return;

        const result = await updateStatus(selectedRequest.id, status, adminNotes);
        if (result.success) {
            setSelectedRequest(null);
            setAdminNotes('');
            refetch();
        }
    };

    const getFilterClasses = (status: string) => {
        if (statusFilter === status) {
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
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Refund Requests</h1>
                    <p className="text-textMuted">Review and process buyer refund requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'reported', 'under_review', 'approved', 'completed', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${getFilterClasses(status)}`}
                    >
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {!error && requests.length === 0 && (
                <div className="text-center py-20 bg-surface border border-border rounded-2xl">
                    <RefreshCw size={48} className="mx-auto text-textMuted mb-4" />
                    <h3 className="text-lg font-bold text-textMain mb-2">No refund requests</h3>
                    <p className="text-textMuted">
                        {statusFilter === 'all'
                            ? "No refund requests have been submitted yet."
                            : `No ${statusFilter.replace('_', ' ')} requests.`}
                    </p>
                </div>
            )}

            {/* Requests Table */}
            {requests.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight border-b border-border">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Order</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Buyer</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Reason</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Amount</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                                <th className="text-center p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-xs font-mono text-textMuted">
                                                {request.order?.order_number || 'N/A'}
                                            </p>
                                            <p className="font-medium text-textMain text-sm truncate max-w-[200px]">
                                                {request.order?.listing?.title || 'Unknown Product'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-textMain">
                                            {request.buyer?.full_name || 'Unknown'}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-textMuted">
                                            {getReasonLabel(request.reason)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-accent-primary">
                                            ₹{request.refund_amount || request.order?.price_amount || 0}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(request.status)}`}>
                                            {request.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setAdminNotes(request.admin_notes || '');
                                                }}
                                                className="p-2 text-textMuted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                                                title="Review"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-textMain">Review Refund Request</h3>
                                    <p className="text-textMuted text-sm mt-1">
                                        {selectedRequest.order?.order_number}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-textMuted" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Request Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-surfaceHighlight rounded-lg">
                                    <p className="text-xs text-textMuted uppercase mb-1">Product</p>
                                    <p className="font-medium text-textMain">
                                        {selectedRequest.order?.listing?.title || 'Unknown'}
                                    </p>
                                </div>
                                <div className="p-4 bg-surfaceHighlight rounded-lg">
                                    <p className="text-xs text-textMuted uppercase mb-1">Refund Amount</p>
                                    <p className="font-bold text-accent-primary text-lg">
                                        ₹{selectedRequest.refund_amount || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-surfaceHighlight rounded-lg">
                                    <p className="text-xs text-textMuted uppercase mb-1">Buyer</p>
                                    <p className="font-medium text-textMain">
                                        {selectedRequest.buyer?.full_name || selectedRequest.order?.buyer?.full_name || 'Unknown'}
                                    </p>
                                </div>
                                <div className="p-4 bg-surfaceHighlight rounded-lg">
                                    <p className="text-xs text-textMuted uppercase mb-1">Seller</p>
                                    <p className="font-medium text-textMain">
                                        {selectedRequest.order?.seller?.full_name || 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-400 mb-1">
                                            Reason: {getReasonLabel(selectedRequest.reason)}
                                        </p>
                                        <p className="text-sm text-textMain whitespace-pre-wrap">
                                            {selectedRequest.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textMuted uppercase">Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this request..."
                                    rows={3}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none resize-none"
                                />
                            </div>

                            {/* Actions */}
                            {selectedRequest.status !== 'refunded' && (
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                    {selectedRequest.status === 'reported' && (
                                        <button
                                            onClick={() => handleAction('under_review')}
                                            disabled={isUpdating}
                                            className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 font-medium text-sm transition-colors disabled:opacity-50"
                                        >
                                            Mark Under Review
                                        </button>
                                    )}
                                    {selectedRequest.status !== 'rejected' && (
                                        <>
                                            <button
                                                onClick={() => handleAction('approved')}
                                                disabled={isUpdating}
                                                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-medium text-sm transition-colors disabled:opacity-50"
                                            >
                                                Approve Refund
                                            </button>
                                            <button
                                                onClick={() => handleAction('completed')}
                                                disabled={isUpdating}
                                                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 font-medium text-sm transition-colors disabled:opacity-50"
                                            >
                                                <Check size={14} className="inline mr-1" />
                                                Mark Completed
                                            </button>
                                            <button
                                                onClick={() => handleAction('rejected')}
                                                disabled={isUpdating}
                                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-medium text-sm transition-colors disabled:opacity-50"
                                            >
                                                Reject Request
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRefunds;
