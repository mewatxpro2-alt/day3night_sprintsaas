import React, { useState, useRef, useEffect } from 'react';
import { SupportConversation, SupportMessage } from '../../types';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from '../MessageBubble';

interface AdminChatViewProps {
    conversation: SupportConversation;
    messages: SupportMessage[];
    onSendReply: (message: string) => Promise<void>;
}

const AdminChatView: React.FC<AdminChatViewProps> = ({
    conversation,
    messages,
    onSendReply,
}) => {
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendReply(messageInput);
            setMessageInput('');
        } catch (err) {
            console.error('Error sending message:', err);
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

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-textMuted text-sm py-8">
                        <p>No messages yet in this conversation.</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isCurrentUser={message.sender_type === 'admin'}
                        />
                    ))
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface">
                <div className="flex items-end gap-2">
                    <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your reply..."
                        rows={2}
                        className="flex-1 bg-surfaceHighlight border border-border rounded-lg px-3 py-2 text-textMain placeholder:text-textMuted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none max-h-32"
                    />
                    <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="bg-accent-primary text-black p-3 rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                        {isSending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
                <p className="text-[10px] text-textMuted mt-2 font-mono">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </form>
        </div>
    );
};

export default AdminChatView;
