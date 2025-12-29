import React, { useState } from 'react';
import { X, Send, Loader2, ShieldCheck, DollarSign, Clock } from 'lucide-react';
import { useSendInquiry } from '../hooks/useSellerInquiries';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    listingTitle: string;
    sellerId: string;
    sellerName: string;
    sellerVerified?: boolean;
}

const BUDGET_RANGES = [
    { value: '', label: 'Not specified' },
    { value: '$500-1k', label: '$500 - $1,000' },
    { value: '$1k-5k', label: '$1,000 - $5,000' },
    { value: '$5k-10k', label: '$5,000 - $10,000' },
    { value: '$10k+', label: '$10,000+' }
];

const TIMELINE_OPTIONS = [
    { value: '', label: 'Not specified' },
    { value: 'urgent', label: 'Urgent (< 1 week)' },
    { value: 'normal', label: 'Normal (1-4 weeks)' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'not_sure', label: 'Not sure yet' }
];

const InquiryModal: React.FC<InquiryModalProps> = ({
    isOpen,
    onClose,
    listingId,
    listingTitle,
    sellerId,
    sellerName,
    sellerVerified = false
}) => {
    const { user } = useAuth();
    const { sendInquiry, isLoading: sendLoading, error: sendError } = useSendInquiry();

    const [message, setMessage] = useState('');
    const [budgetRange, setBudgetRange] = useState('');
    const [timeline, setTimeline] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const result = await sendInquiry(
            listingId,
            sellerId,
            'Project Inquiry', // Default subject - simplified
            message,
            budgetRange || undefined,
            timeline || undefined
        );

        if (result) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setMessage('');
                setBudgetRange('');
                setTimeline('');
            }, 2500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded-lg transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {!user ? (
                    /* Auth Required State */
                    <div className="p-8 text-center">
                        <div className="w-14 h-14 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send size={28} className="text-accent-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">Sign in to Message</h3>
                        <p className="text-textMuted mb-6">
                            You need to be logged in to send a message to {sellerName}.
                        </p>
                        <Button href="/signin" className="w-full">Sign In</Button>
                    </div>
                ) : success ? (
                    /* Success State */
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">Message Sent!</h3>
                        <p className="text-textMuted">
                            {sellerName} will receive your message and get back to you shortly.
                        </p>
                    </div>
                ) : (
                    /* Main Form */
                    <div className="p-6">
                        {/* Header with Seller Info */}
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-textMain">Get in Touch</h3>
                            {sellerVerified && (
                                <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                    <ShieldCheck size={10} /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-textMuted text-sm mb-6">
                            You're contacting <span className="font-medium text-textMain">{sellerName}</span> about <span className="font-medium text-textMain">"{listingTitle}"</span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Project Message - Required */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMain uppercase flex items-center gap-2">
                                    Project Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe what you're building or what you need help with..."
                                    className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted/60 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all resize-none"
                                />
                                <p className="text-xs text-textMuted">
                                    Be specific about your requirements for a faster response.
                                </p>
                            </div>

                            {/* Optional Fields Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Budget Range - Optional */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-textMain uppercase flex items-center gap-1">
                                        <DollarSign size={12} className="text-textMuted" />
                                        Budget Range
                                    </label>
                                    <select
                                        value={budgetRange}
                                        onChange={(e) => setBudgetRange(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surfaceHighlight border border-border rounded-xl text-textMain text-sm focus:outline-none focus:border-accent-primary transition-colors appearance-none cursor-pointer"
                                    >
                                        {BUDGET_RANGES.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Timeline - Optional */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-textMain uppercase flex items-center gap-1">
                                        <Clock size={12} className="text-textMuted" />
                                        Timeline
                                    </label>
                                    <select
                                        value={timeline}
                                        onChange={(e) => setTimeline(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-surfaceHighlight border border-border rounded-xl text-textMain text-sm focus:outline-none focus:border-accent-primary transition-colors appearance-none cursor-pointer"
                                    >
                                        {TIMELINE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Error Display */}
                            {sendError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {sendError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full py-3"
                                    disabled={sendLoading || !message.trim()}
                                >
                                    {sendLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send size={16} />
                                            Send Message
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryModal;
