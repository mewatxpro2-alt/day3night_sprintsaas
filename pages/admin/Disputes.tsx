import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Dispute } from '../../types/marketplace';

const AdminDisputes: React.FC = () => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
    const [resolution, setResolution] = useState('');
    const [resolving, setResolving] = useState(false);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('disputes')
                .select(`
          *,
          order:orders(
            id, order_number, price_amount, status,
            listing:listings(id, title),
            buyer:profiles!orders_buyer_id_fkey(id, full_name, email),
            seller:profiles!orders_seller_id_fkey(id, full_name, email)
          ),
          raiser:profiles!disputes_raised_by_fkey(id, full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setDisputes(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch disputes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (disputeId: string, outcome: 'resolved_refund' | 'resolved_no_refund') => {
        if (!resolution.trim()) {
            alert('Please provide a resolution note');
            return;
        }

        setResolving(true);
        try {
            const { error: updateError } = await supabase
                .from('disputes')
                .update({
                    status: outcome,
                    resolution: resolution,
                    resolved_at: new Date().toISOString(),
                })
                .eq('id', disputeId);

            if (updateError) throw updateError;

            // If refund, update order status
            if (outcome === 'resolved_refund') {
                const dispute = disputes.find(d => d.id === disputeId);
                if (dispute?.order?.id) {
                    await supabase
                        .from('orders')
                        .update({ status: 'refunded' })
                        .eq('id', dispute.order.id);
                }
            }

            setSelectedDispute(null);
            setResolution('');
            fetchDisputes();
        } catch (err) {
            alert('Failed to resolve dispute');
        } finally {
            setResolving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
            open: { bg: 'bg-orange-500/10 text-orange-500', icon: <AlertTriangle size={14} /> },
            under_review: { bg: 'bg-accent-tertiary/10 text-accent-tertiary', icon: <Clock size={14} /> },
            resolved_refund: { bg: 'bg-accent-primary/10 text-accent-primary', icon: <CheckCircle size={14} /> },
            resolved_no_refund: { bg: 'bg-accent-secondary/10 text-accent-secondary-fg', icon: <XCircle size={14} /> },
            closed: { bg: 'bg-surfaceHighlight text-textMuted', icon: <CheckCircle size={14} /> },
        };
        return styles[status] || styles.open;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const openDisputes = disputes.filter(d => ['open', 'under_review'].includes(d.status));

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Disputes</h1>
                    <p className="text-textMuted">
                        {openDisputes.length} open dispute{openDisputes.length !== 1 ? 's' : ''} requiring attention
                    </p>
                </div>
                <button
                    onClick={fetchDisputes}
                    className="p-2 rounded-lg bg-surfaceHighlight hover:bg-accent-tertiary/10 text-textMuted hover:text-accent-tertiary transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                    {error}
                </div>
            )}

            {/* Disputes List */}
            {disputes.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                    <CheckCircle size={48} className="text-accent-primary mx-auto mb-4 opacity-50" />
                    <p className="text-textMain font-medium text-lg">No disputes</p>
                    <p className="text-textMuted text-sm">All clear! No disputes to resolve.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {disputes.map((dispute) => {
                        const statusInfo = getStatusBadge(dispute.status);
                        return (
                            <div
                                key={dispute.id}
                                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent-primary/20 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg}`}>
                                                {statusInfo.icon}
                                                {dispute.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-textMuted text-sm">
                                                Order #{dispute.order?.order_number}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-textMain">
                                            {dispute.order?.listing?.title || 'Unknown Kit'}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-textMuted">
                                        {new Date(dispute.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-surfaceHighlight">
                                        <p className="text-xs text-textMuted mb-1">Raised by</p>
                                        <p className="text-sm text-textMain">{dispute.raiser?.full_name}</p>
                                        <p className="text-xs text-textMuted">{dispute.raiser?.email}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-surfaceHighlight">
                                        <p className="text-xs text-textMuted mb-1">Order Value</p>
                                        <p className="text-sm font-medium text-textMain">
                                            ₹{dispute.order?.price_amount}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-medium text-textMuted uppercase mb-2">Reason</p>
                                    <p className="text-sm text-textMain bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                                        <strong>{dispute.reason}</strong>
                                        {dispute.description && (
                                            <>
                                                <br />
                                                <span className="text-textMuted">{dispute.description}</span>
                                            </>
                                        )}
                                    </p>
                                </div>

                                {dispute.resolution && (
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-textMuted uppercase mb-2">Resolution</p>
                                        <p className="text-sm text-textMain bg-accent-primary/5 border border-accent-primary/10 rounded-lg p-3">
                                            {dispute.resolution}
                                        </p>
                                    </div>
                                )}

                                {['open', 'under_review'].includes(dispute.status) && (
                                    <button
                                        onClick={() => setSelectedDispute(dispute)}
                                        className="px-4 py-2 bg-accent-tertiary/10 text-accent-tertiary rounded-xl font-medium hover:bg-accent-tertiary/20 transition-colors"
                                    >
                                        Resolve Dispute
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Resolution Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-display font-bold text-textMain mb-4">Resolve Dispute</h2>

                        <div className="mb-4 p-3 rounded-xl bg-surfaceHighlight">
                            <p className="text-sm text-textMain">
                                Order #{selectedDispute.order?.order_number}
                            </p>
                            <p className="text-xs text-textMuted">
                                Value: ₹{selectedDispute.order?.price_amount}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-textMuted mb-2">
                                Resolution Notes
                            </label>
                            <textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-tertiary resize-none"
                                placeholder="Explain the resolution..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleResolve(selectedDispute.id, 'resolved_refund')}
                                disabled={resolving}
                                className="flex-1 px-4 py-3 bg-accent-primary text-accent-primary-fg rounded-xl font-medium hover:brightness-110 disabled:opacity-50"
                            >
                                Approve Refund
                            </button>
                            <button
                                onClick={() => handleResolve(selectedDispute.id, 'resolved_no_refund')}
                                disabled={resolving}
                                className="flex-1 px-4 py-3 bg-surfaceHighlight text-textMuted hover:text-textMain rounded-xl font-medium disabled:opacity-50"
                            >
                                Deny Refund
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedDispute(null);
                                setResolution('');
                            }}
                            className="w-full mt-3 px-4 py-2 text-textMuted hover:text-textMain text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputes;
