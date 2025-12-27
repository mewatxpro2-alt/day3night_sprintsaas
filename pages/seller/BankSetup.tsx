import React, { useState } from 'react';
import { Building2, CreditCard, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface BankDetails {
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    confirm_account_number: string;
    ifsc_code: string;
    upi_id: string;
}

const SellerBankSetup: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [details, setDetails] = useState<BankDetails>({
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        confirm_account_number: '',
        ifsc_code: '',
        upi_id: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const validateDetails = (): string | null => {
        if (!details.account_holder_name.trim()) return 'Account holder name is required';
        if (!details.bank_name.trim()) return 'Bank name is required';
        if (!details.account_number.trim()) return 'Account number is required';
        if (details.account_number !== details.confirm_account_number) return 'Account numbers do not match';
        if (!details.ifsc_code.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) return 'Invalid IFSC code format';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateDetails();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Store only last 4 digits for display
            const last4 = details.account_number.slice(-4);

            const { error: upsertError } = await supabase
                .from('seller_bank_accounts')
                .upsert({
                    seller_id: user?.id,
                    account_holder_name: details.account_holder_name,
                    bank_name: details.bank_name,
                    account_number_last4: last4,
                    ifsc_code: details.ifsc_code.toUpperCase(),
                    upi_id: details.upi_id || null,
                    is_verified: false,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'seller_id' });

            if (upsertError) throw upsertError;

            setSuccess(true);
            setTimeout(() => navigate('/seller/payouts'), 2000);
        } catch (err) {
            console.error('[SellerBankSetup] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save bank details');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-accent-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-textMain mb-2">Bank Details Saved!</h2>
                    <p className="text-textMuted">Redirecting to payouts page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Bank Account Setup</h1>
                <p className="text-textMuted">Add your bank details to receive payouts</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-xl">
                <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
                    {/* Warning */}
                    <div className="p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-start gap-3">
                        <AlertCircle size={18} className="text-accent-secondary-fg mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-textMain">Important</p>
                            <p className="text-textMuted">
                                Ensure your bank details are accurate. Incorrect details may delay your payouts.
                            </p>
                        </div>
                    </div>

                    {/* Account Holder Name */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Account Holder Name
                        </label>
                        <input
                            type="text"
                            name="account_holder_name"
                            value={details.account_holder_name}
                            onChange={handleChange}
                            placeholder="As per bank records"
                            className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                        />
                    </div>

                    {/* Bank Name */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Bank Name
                        </label>
                        <div className="relative">
                            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                            <input
                                type="text"
                                name="bank_name"
                                value={details.bank_name}
                                onChange={handleChange}
                                placeholder="e.g., HDFC Bank"
                                className="w-full pl-12 pr-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Account Number */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="account_number"
                            value={details.account_number}
                            onChange={handleChange}
                            placeholder="Enter account number"
                            className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                        />
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            Confirm Account Number
                        </label>
                        <input
                            type="text"
                            name="confirm_account_number"
                            value={details.confirm_account_number}
                            onChange={handleChange}
                            placeholder="Re-enter account number"
                            className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                        />
                    </div>

                    {/* IFSC Code */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            IFSC Code
                        </label>
                        <input
                            type="text"
                            name="ifsc_code"
                            value={details.ifsc_code}
                            onChange={handleChange}
                            placeholder="e.g., HDFC0001234"
                            maxLength={11}
                            className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors uppercase"
                        />
                    </div>

                    {/* UPI ID (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                            UPI ID <span className="text-textMuted">(Optional)</span>
                        </label>
                        <div className="relative">
                            <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                            <input
                                type="text"
                                name="upi_id"
                                value={details.upi_id}
                                onChange={handleChange}
                                placeholder="yourname@upi"
                                className="w-full pl-12 pr-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Bank Details
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellerBankSetup;
