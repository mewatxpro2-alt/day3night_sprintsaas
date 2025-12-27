import React, { useState } from 'react';
import { Wallet, Clock, CheckCircle, XCircle, Calendar, ArrowUpRight, X, Loader2, DollarSign } from 'lucide-react';
import { useSellerPayouts } from '../../hooks/useSeller';
import { useSellerBalance, useMyWithdrawals, useRequestWithdrawal } from '../../hooks/useRefundsAndWithdrawals';

const SellerPayouts: React.FC = () => {
    const { payouts, isLoading: payoutsLoading, error } = useSellerPayouts();
    const { balance, isLoading: balanceLoading } = useSellerBalance();
    const { withdrawals, isLoading: withdrawalsLoading } = useMyWithdrawals();
    const { requestWithdrawal, isLoading: isRequesting } = useRequestWithdrawal();

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [upiId, setUpiId] = useState('');

    const isLoading = payoutsLoading || balanceLoading || withdrawalsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={16} className="text-accent-primary" />;
            case 'failed':
            case 'rejected':
                return <XCircle size={16} className="text-red-500" />;
            case 'processing':
                return <div className="w-4 h-4 border-2 border-accent-tertiary border-t-transparent rounded-full animate-spin" />;
            default:
                return <Clock size={16} className="text-accent-secondary" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-surfaceHighlight text-textMuted',
            scheduled: 'bg-accent-secondary/10 text-accent-secondary-fg',
            processing: 'bg-accent-tertiary/10 text-accent-tertiary',
            completed: 'bg-accent-primary/10 text-accent-primary',
            failed: 'bg-red-500/10 text-red-500',
            rejected: 'bg-red-500/10 text-red-500',
        };
        return styles[status] || 'bg-surfaceHighlight text-textMuted';
    };

    // Group payouts by status
    const pendingPayouts = payouts.filter(p => ['pending', 'scheduled', 'processing'].includes(p.status));
    const completedPayouts = payouts.filter(p => p.status === 'completed');

    // Calculate totals
    const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCompleted = completedPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

    const handleWithdrawRequest = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (amount > balance.available) {
            alert('Insufficient balance');
            return;
        }

        const paymentDetails = paymentMethod === 'upi'
            ? { upi_id: upiId }
            : {};

        const result = await requestWithdrawal(amount, paymentMethod, paymentDetails);
        if (result.success) {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            setUpiId('');
            alert('Withdrawal request submitted successfully!');
            window.location.reload();
        } else {
            alert(result.error || 'Failed to submit withdrawal request');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Payouts</h1>
                    <p className="text-textMuted">Track your earnings and request withdrawals</p>
                </div>
                <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={balance.available <= 0}
                    className="px-6 py-3 bg-accent-primary text-accent-primary-fg rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <DollarSign size={18} />
                    Request Withdrawal
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Available Balance */}
                <div className="p-6 rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-primary/20">
                            <Wallet size={20} className="text-accent-primary" />
                        </div>
                        <span className="text-accent-primary font-medium">Available</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-accent-primary">
                        ₹{balance.available.toLocaleString()}
                    </p>
                    <p className="text-sm text-accent-primary/70 mt-1">
                        Ready to withdraw
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-secondary/10">
                            <Clock size={20} className="text-accent-secondary" />
                        </div>
                        <span className="text-textMuted font-medium">Pending</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-textMain">
                        ₹{(balance.pending + totalPending).toLocaleString()}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        Processing
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-primary/10">
                            <CheckCircle size={20} className="text-accent-primary" />
                        </div>
                        <span className="text-textMuted font-medium">Total Withdrawn</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-accent-primary">
                        ₹{(balance.withdrawn + totalCompleted).toLocaleString()}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        All-time payouts
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-tertiary/10">
                            <Wallet size={20} className="text-accent-tertiary" />
                        </div>
                        <span className="text-textMuted font-medium">Bank Account</span>
                    </div>
                    <a
                        href="/seller/bank"
                        className="text-accent-tertiary hover:underline flex items-center gap-1"
                    >
                        Manage bank details <ArrowUpRight size={14} />
                    </a>
                </div>
            </div>

            {/* Withdrawal Requests */}
            {withdrawals.length > 0 && (
                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <h2 className="text-lg font-bold text-textMain mb-6">Withdrawal Requests</h2>
                    <div className="space-y-4">
                        {withdrawals.map((w) => (
                            <div
                                key={w.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-surfaceHighlight border border-border/50"
                            >
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(w.status)}
                                    <div>
                                        <p className="font-medium text-textMain">
                                            ₹{Number(w.amount).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-textMuted flex items-center gap-2">
                                            <Calendar size={12} />
                                            {new Date(w.created_at).toLocaleDateString()}
                                            {w.payment_method && ` • ${w.payment_method.replace('_', ' ')}`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(w.status)}`}>
                                    {w.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payouts List */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-bold text-textMain mb-6">Payout History</h2>

                {payouts.length === 0 ? (
                    <div className="text-center py-12 text-textMuted">
                        <Wallet size={40} className="mx-auto mb-4 opacity-30" />
                        <p>No payouts yet</p>
                        <p className="text-sm">Payouts are scheduled after order completion</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payouts.map((payout) => (
                            <div
                                key={payout.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-surfaceHighlight border border-border/50"
                            >
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(payout.status)}
                                    <div>
                                        <p className="font-medium text-textMain">
                                            ₹{Number(payout.amount).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-textMuted flex items-center gap-2">
                                            <Calendar size={12} />
                                            {payout.processed_at
                                                ? `Paid on ${new Date(payout.processed_at).toLocaleDateString()}`
                                                : payout.scheduled_at
                                                    ? `Scheduled for ${new Date(payout.scheduled_at).toLocaleDateString()}`
                                                    : 'Processing'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(payout.status)}`}>
                                    {payout.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-2xl border border-border max-w-md w-full shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-xl font-display font-bold text-textMain">Request Withdrawal</h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="p-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                            >
                                <X size={20} className="text-textMuted" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Available Balance */}
                            <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-center">
                                <p className="text-xs text-accent-primary uppercase mb-1">Available Balance</p>
                                <p className="text-3xl font-bold text-accent-primary">₹{balance.available.toLocaleString()}</p>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textMuted uppercase">Withdrawal Amount</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    max={balance.available}
                                    className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain text-lg font-bold placeholder:text-textMuted focus:border-accent-primary focus:outline-none"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-textMuted uppercase">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                        className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'bank_transfer'
                                                ? 'bg-accent-primary/10 border-accent-primary/30'
                                                : 'bg-surfaceHighlight border-border'
                                            }`}
                                    >
                                        <p className={`font-medium ${paymentMethod === 'bank_transfer' ? 'text-accent-primary' : 'text-textMain'}`}>
                                            Bank Transfer
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`p-4 rounded-xl border text-center transition-all ${paymentMethod === 'upi'
                                                ? 'bg-accent-primary/10 border-accent-primary/30'
                                                : 'bg-surfaceHighlight border-border'
                                            }`}
                                    >
                                        <p className={`font-medium ${paymentMethod === 'upi' ? 'text-accent-primary' : 'text-textMain'}`}>
                                            UPI
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* UPI ID */}
                            {paymentMethod === 'upi' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-textMuted uppercase">UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full bg-surfaceHighlight border border-border rounded-lg px-4 py-3 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none"
                                    />
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleWithdrawRequest}
                                disabled={isRequesting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                                className="w-full py-4 bg-accent-primary text-accent-primary-fg rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isRequesting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <DollarSign size={20} />
                                        Request Withdrawal
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-textMuted text-center">
                                Withdrawals are typically processed within 2-3 business days.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPayouts;

