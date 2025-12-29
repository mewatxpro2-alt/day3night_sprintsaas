import React, { useState } from 'react';
import { Wallet, Clock, CheckCircle, XCircle, Calendar, ArrowUpRight, X, Loader2, DollarSign, Building2 } from 'lucide-react';
import { useSellerPayouts } from '../../hooks/useSeller';
import { useSellerBalance, useMyWithdrawals, useRequestWithdrawal, useSellerBankDetails } from '../../hooks/useRefundsAndWithdrawals';
import { useNavigate } from 'react-router-dom';

const SellerPayouts: React.FC = () => {
    const navigate = useNavigate();
    const { payouts, isLoading: payoutsLoading } = useSellerPayouts(); // Keep for legacy/history if needed
    const { balance, isLoading: balanceLoading } = useSellerBalance();
    const { withdrawals, isLoading: withdrawalsLoading } = useMyWithdrawals();
    const { requestWithdrawal, isLoading: isRequesting } = useRequestWithdrawal();
    const { bankDetails, isLoading: bankLoading } = useSellerBankDetails();

    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [upiId, setUpiId] = useState('');

    const isLoading = payoutsLoading || balanceLoading || withdrawalsLoading || bankLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
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

    const handleOpenWithdrawal = () => {
        if (!bankDetails) {
            if (window.confirm('You need to add bank details before withdrawing. Go to setup now?')) {
                navigate('/seller/bank');
            }
            return;
        }
        setUpiId(bankDetails.upi_id || '');
        setPaymentMethod(bankDetails.upi_id ? 'upi' : 'bank_transfer');
        setShowWithdrawModal(true);
    };

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

        // Use saved bank details
        const paymentDetails = paymentMethod === 'upi'
            ? { upi_id: upiId }
            : {
                bank_name: bankDetails?.bank_name,
                account_number_last4: bankDetails?.account_number_last4,
                account_holder: bankDetails?.account_holder_name
            };

        const result = await requestWithdrawal(amount, paymentMethod, paymentDetails);
        if (result.success) {
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            alert('Withdrawal request submitted! Admin will review shortly.');
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
                    onClick={handleOpenWithdrawal}
                    disabled={balance.available <= 0}
                    className="px-6 py-3 bg-accent-primary text-accent-primary-fg rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-primary/20"
                >
                    <DollarSign size={18} />
                    Request Withdrawal
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                        <span className="text-textMuted font-medium">Pending Orders</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-textMain">
                        ₹{balance.pending.toLocaleString()}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        From recent orders
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-tertiary/10">
                            <Loader2 size={20} className="text-accent-tertiary animate-spin-slow" />
                        </div>
                        <span className="text-textMuted font-medium">Processing</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-accent-tertiary">
                        ₹{withdrawals
                            .filter(w => ['pending', 'processing'].includes(w.status))
                            .reduce((sum, w) => sum + Number(w.amount), 0)
                            .toLocaleString()}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        Withdrawals in progress
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
                        ₹{balance.withdrawn.toLocaleString()}
                    </p>
                    <p className="text-sm text-textMuted mt-1">
                        All-time payouts
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-accent-tertiary/10">
                            <Building2 size={20} className="text-accent-tertiary" />
                        </div>
                        <span className="text-textMuted font-medium">Bank Account</span>
                    </div>
                    {bankDetails ? (
                        <div>
                            <p className="font-medium text-textMain">{bankDetails.bank_name}</p>
                            <p className="text-sm text-textMuted">•••• {bankDetails.account_number_last4}</p>
                            <a href="/seller/bank" className="text-xs text-accent-tertiary hover:underline mt-2 inline-flex items-center gap-1">
                                Update details <ArrowUpRight size={12} />
                            </a>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-textMuted mb-2">No account added</p>
                            <a href="/seller/bank" className="text-sm text-accent-tertiary hover:underline inline-flex items-center gap-1">
                                Add Bank Details <ArrowUpRight size={14} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Requests */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-bold text-textMain mb-6">Withdrawal History</h2>
                {withdrawals.length === 0 ? (
                    <div className="text-center py-8 text-textMuted">
                        <Wallet size={32} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No withdrawal requests yet</p>
                    </div>
                ) : (
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
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(w.status)}`}>
                                        {w.status}
                                    </span>
                                    {w.admin_notes && (
                                        <p className="text-xs text-textMuted mt-1 max-w-[200px] truncate">
                                            Note: {w.admin_notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
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
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="0.00"
                                        max={balance.available}
                                        className="w-full bg-surfaceHighlight border border-border rounded-lg pl-8 pr-4 py-3 text-textMain text-lg font-bold placeholder:text-textMuted focus:border-accent-primary focus:outline-none"
                                    />
                                </div>
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
                                    {bankDetails?.upi_id && (
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
                                    )}
                                </div>
                                <p className="text-xs text-textMuted mt-1">
                                    Sending to: {paymentMethod === 'upi' ? upiId : `Bank Account ending in ${bankDetails?.account_number_last4}`}
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleWithdrawRequest}
                                disabled={isRequesting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                                className="w-full py-4 bg-accent-primary text-accent-primary-fg rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/20"
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
                                Withdrawals are typically processed within 24-48 hours.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerPayouts;
