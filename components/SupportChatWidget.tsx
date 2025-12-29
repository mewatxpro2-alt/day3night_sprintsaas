import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useSupportChat } from '../hooks/useSupportChat';
import { useAuth } from '../hooks/useAuth';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import PresetQuestions from './PresetQuestions';
import { SUPPORT_CONFIG } from '../config/support';

interface SupportChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const {
        conversation,
        messages,
        isLoading,
        error,
        startConversation,
        sendMessage,
        closeConversation,
    } = useSupportChat();

    const [messageInput, setMessageInput] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestName, setGuestName] = useState('');
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check if we need guest form
    useEffect(() => {
        if (!user && !conversation) {
            setShowGuestForm(true);
        } else {
            setShowGuestForm(false);
        }
    }, [user, conversation]);

    const handleStartNewChat = () => {
        closeConversation();
        setShowGuestForm(!user);
    };

    const handlePresetQuestionSelect = (question: string) => {
        setMessageInput(question);
        // Focus the textarea
        setTimeout(() => {
            messageInputRef.current?.focus();
        }, 100);
    };

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestEmail.trim()) return;

        await startConversation(guestEmail, guestName || undefined);
        setShowGuestForm(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToSend = messageInput.trim();
        if (!textToSend || isSending) return;

        setIsSending(true);
        setMessageInput(''); // Clear immediately for optimistic UI

        try {
            // If no conversation exists, create one first
            if (!conversation) {
                let newConversationId: string | undefined;

                if (user) {
                    // Authenticated user
                    const result = await startConversation(user.email!, user.user_metadata?.full_name);
                    newConversationId = result?.id;
                } else {
                    // Guest - shouldn't happen as they go through guest form
                    setIsSending(false);
                    return;
                }

                if (newConversationId) {
                    // Pass the ID explicitly to avoid state race condition
                    await sendMessage(textToSend, newConversationId);
                    return;
                }
            }

            await sendMessage(textToSend);
        } catch (err) {
            console.error('Error sending message:', err);
            setMessageInput(textToSend); // Restore on error
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Widget */}
            <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-[380px] h-[100dvh] md:h-[600px] bg-background border-l md:border border-border md:rounded-3xl shadow-2xl z-50 flex flex-col animate-slide-up overflow-hidden font-sans ring-1 ring-black/5">
                {/* Header */}
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-5 text-white relative overflow-hidden shrink-0">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Logo container with status dot */}
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg transition-transform hover:scale-105 active:scale-95">
                                    {SUPPORT_CONFIG.websiteLogo ? (
                                        <img
                                            src={SUPPORT_CONFIG.websiteLogo}
                                            alt={SUPPORT_CONFIG.websiteName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-7 h-7 flex items-center justify-center">
                                            <svg viewBox="0 0 32 32" className="w-full h-full text-green-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 16L12 4H26L20 16H6Z" fill="currentColor" className="opacity-90" />
                                                <path d="M26 16L20 28H6L12 16H26Z" fill="currentColor" fillOpacity="0.6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full shadow-sm animate-pulse-slow"></div>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="font-bold text-lg leading-tight tracking-tight">{SUPPORT_CONFIG.websiteName}</h3>
                                <div className="flex items-center gap-1.5 mt-1 opacity-90">
                                    <span className="text-xs font-light text-zinc-300">Chat with {SUPPORT_CONFIG.adminName}</span>
                                    <span className="bg-white/15 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase shadow-sm border border-white/10">{SUPPORT_CONFIG.adminTitle}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 -mt-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white active:scale-90"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && !conversation ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-accent-primary" size={32} />
                        </div>
                    ) : showGuestForm ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-full max-w-sm space-y-4">
                                <div className="text-center mb-6">
                                    <h4 className="text-lg font-bold text-textMain mb-2">Get in Touch</h4>
                                    <p className="text-sm text-textMuted">
                                        We'll get back to you as soon as possible.
                                    </p>
                                </div>

                                <form onSubmit={handleGuestSubmit} className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-textSecondary block mb-1">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-textSecondary block mb-1">
                                            Name <span className="text-textMuted">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-textMain focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-accent-primary text-black font-bold py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
                                    >
                                        Start Chat
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 ? (
                                <PresetQuestions onSelect={handlePresetQuestionSelect} />
                            ) : (
                                messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        isCurrentUser={message.sender_type === 'user'}
                                    />
                                ))
                            )}

                            {/* Typing indicator placeholder */}
                            {/* <TypingIndicator /> */}

                            <div ref={messagesEndRef} />
                        </>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}
                </div>

                {/* Input */}
                {!showGuestForm && (
                    <form onSubmit={handleSendMessage} className="p-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-t border-border/50">
                        <div className="relative flex items-end gap-2 bg-surfaceHighlight/50 border border-border/50 rounded-[24px] p-1.5 focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-700 transition-all shadow-sm">
                            <textarea
                                ref={messageInputRef}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                rows={1}
                                className="flex-1 bg-transparent border-none rounded-2xl px-4 py-2.5 text-textMain placeholder:text-textMuted focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[44px]"
                            />
                            <button
                                type="submit"
                                disabled={!messageInput.trim() || isSending}
                                className="h-10 w-10 flex items-center justify-center bg-accent-primary text-black rounded-full hover:bg-accent-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 mb-0.5 mr-0.5 active:scale-95 shadow-sm"
                            >
                                {isSending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} className="ml-0.5" />
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-textMuted text-center mt-2.5 opacity-60">
                            Powered by {SUPPORT_CONFIG.websiteName} Support
                        </p>
                    </form>
                )}
            </div >
        </>
    );
};

export default SupportChatWidget;
