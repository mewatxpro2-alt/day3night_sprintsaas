import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
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
}

const InquiryModal: React.FC<InquiryModalProps> = ({
    isOpen,
    onClose,
    listingId,
    listingTitle,
    sellerId,
    sellerName
}) => {
    const { user } = useAuth();
    const { sendInquiry, isLoading: sendLoading, error: sendError } = useSendInquiry();

    const [subject, setSubject] = useState('Product Question');
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const result = await sendInquiry(
            listingId,
            sellerId,
            subject,
            message
        );

        if (result) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setMessage('');
                setSubject('Product Question');
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-textMuted hover:text-textMain hover:bg-surfaceHighlight rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                {!user ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send size={24} className="text-accent-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">Sign in to Message</h3>
                        <p className="text-textMuted mb-6">
                            You need to be logged in to send a message to {sellerName}.
                        </p>
                        <Button href="/signin" className="w-full">Sign In</Button>
                    </div>
                ) : success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Send size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-textMain mb-2">Message Sent!</h3>
                        <p className="text-textMuted">
                            {sellerName} will receive your message and get back to you shortly.
                        </p>
                    </div>
                ) : (
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-textMain mb-1">Contact Seller</h3>
                        <p className="text-textMuted text-sm mb-6">
                            Regarding <span className="font-medium text-textMain">{listingTitle}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMain uppercase">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain focus:outline-none focus:border-accent-primary transition-colors appearance-none"
                                >
                                    <option>Product Question</option>
                                    <option>Customization Request</option>
                                    <option>Pricing Inquiry</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-textMain uppercase">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi ${sellerName}, I have a question about...`}
                                    className="w-full px-4 py-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                                />
                            </div>

                            {sendError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {sendError}
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={sendLoading || !message.trim()}
                                >
                                    {sendLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </span>
                                    ) : (
                                        'Send Message'
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
