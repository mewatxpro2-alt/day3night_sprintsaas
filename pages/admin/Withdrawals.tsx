import React, { useState } from 'react';
import {
    DollarSign, Loader2, Eye, Check, X,
    CreditCard, Calendar, User
} from 'lucide-react';
import { useAdminWithdrawals, useProcessWithdrawal, type SellerWithdrawal } from '../../hooks/useRefundsAndWithdrawals';

const AdminWithdrawals: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<SellerWithdrawal | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const { withdrawals, isLoading, refetch } = useAdminWithdrawals(statusFilter);
    const { processWithdrawal, isLoading: isProcessing } = useProcessWithdrawal();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-surfaceHighlight text-textMuted border-border';
        }
    };

    const handleAction = async (status: 'processing' | 'completed' | 'rejected') => {
        if (!selectedWithdrawal) return;

        const result = await processWithdrawal(selectedWithdrawal.id, status, adminNotes);
        if (result.success) {
            setSelectedWithdrawal(null);
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
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Seller Withdrawals</h1>
                    <p className="text-textMuted">Process seller payout requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'processing', 'completed', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${getFilterClasses(status)}`}
                    >
                        {status.replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {withdrawals.length === 0 && (
                <div className="text-center py-20 bg-surface border border-border rounded-2xl">
                    <DollarSign size={48} className="mx-auto text-textMuted mb-4" />
                    <h3 className="text-lg font-bold text-textMain mb-2">No withdrawal requests</h3>
                    <p className="text-textMuted">
                        {statusFilter === 'all'
                            ? "No withdrawal requests have been submitted yet."
                            : `No ${statusFilter} requests.`}
                    </p>
                </div>
            )}

            {/* Withdrawals Table */}
            {withdrawals.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surfaceHighlight border-b border-border">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Seller</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Amount</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Method</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Date</th>
                                <th className="text-left p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                                <th className="text-center p-4 text-xs font-bold text-textMuted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {withdrawals.map((withdrawal) => (
                                <tr key={withdrawal.id} className="hover:bg-surfaceHighlight/50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-medium text-textMain">
                                            {withdrawal.seller?.full_name || 'Unknown Seller'}
                                        </p>
                                        <p className="text-xs text-textMuted">
                                            {withdrawal.seller?.email}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-lg text-accent-primary">
                                            ₹{withdrawal.amount}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-textMuted capitalize">
                                            {withdrawal.payment_method || 'Not specified'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-textMuted">
                                        {new Date(withdrawal.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                                            {withdrawal.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedWithdrawal(withdrawal);
                                                    setAdminNotes(withdrawal.admin_notes || '');
                                                }}
                                                className="p-2 text-textMuted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                                                title="Review"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {withdrawal.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedWithdrawal(withdrawal);
                                                        handleAction('completed');
                                                    }}
                                                    className="p-2 text-textMuted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Mark Completed"
                                                >
                                                    <Check size={16} />
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

            {/* Review Modal */}
            {selectedWithdrawal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl border border-border max-w-lg w-full shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-textMain">Process Withdrawal</h3>
                                    <p className="text-textMuted text-sm mt-1">
                                        {selectedWithdrawal.seller?.full_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedWithdrawal(null)}
                                    className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-textMuted" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Amount */}
                            <div className="text-center py-6 bg-surfaceHighlight rounded-xl">
                                <p className="text-xs text-textMuted uppercase mb-2">Withdrawal Amount</p>
                                <p className="text-4xl font-bold text-accent-primary">₹{selectedWithdrawal.amount}</p>
                            </div>

                            {/* Payment Details */}
                            <div className="p-4 bg-surfaceHighlight rounded-lg">
                                <p className="text-xs text-textMuted uppercase mb-2">Payment Method</p>
                                <p className="text-textMain font-medium capitalize">
                                    {selectedWithdrawal.payment_method || 'Not specified'}
                                </p>
                                {selectedWithdrawal.payment_details && (
                                    <div className="mt-3 pt-3 border-t border-border text-sm">
                                        {Object.entries(selectedWithdrawal.payment_details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between py-1">
                                                <span className="text-textMuted capitalize">{key.replace('_', ' ')}</span>
                                                <span className="text-textMain">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textMuted uppercase">Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this withdrawal..."
                                    rows={2}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none resize-none"
                                />
                            </div>

                            {/* Actions */}
                            {selectedWithdrawal.status !== 'completed' && selectedWithdrawal.status !== 'rejected' && (
                                <div className="flex gap-3 pt-4 border-t border-border">
                                    {selectedWithdrawal.status === 'pending' && (
                                        <button
                                            onClick={() => handleAction('processing')}
                                            disabled={isProcessing}
                                            className="flex-1 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-medium transition-colors disabled:opacity-50"
                                        >
                                            Mark Processing
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction('completed')}
                                        disabled={isProcessing}
                                        className="flex-1 px-4 py-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Mark Completed
                                    </button>
                                    <button
                                        onClick={() => handleAction('rejected')}
                                        disabled={isProcessing}
                                        className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-medium transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWithdrawals;
