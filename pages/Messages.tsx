import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, User, Paperclip, MoreVertical, X, Search, File, Menu, Image as ImageIcon, Download, Briefcase, ChevronRight, Check } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { useConversations, Conversation } from '../hooks/useConversations';
import { useOrder } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';

const MessagesPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Hooks
    const { conversations, isLoading: convLoading } = useConversations();
    const { order } = useOrder(orderId); // Current order context
    const { messages, isLoading: msgLoading, sendMessage, markAsRead } = useMessages(orderId);

    // State
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Left sidebar
    const [isContextOpen, setIsContextOpen] = useState(true); // Right context sidebar
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat' | 'info'
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived State
    const activeConversation = conversations.find(c => c.order_id === orderId);

    // Effects
    useEffect(() => {
        if (orderId) {
            setMobileView('chat');
            // Mark visible messages as read
            messages
                .filter(m => m.receiver_id === user?.id && !m.is_read)
                .forEach(m => markAsRead(m.id));
        } else if (conversations.length > 0 && !orderId) {
            // Auto-select first conversation on desktop
            if (window.innerWidth >= 768) {
                navigate(`/messages/${conversations[0].order_id}`);
            }
        }
    }, [orderId, messages, user, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, attachments]);

    // Handlers
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || sending) return;

        setSending(true);
        const success = await sendMessage(newMessage, attachments);
        if (success) {
            setNewMessage('');
            setAttachments([]);
        }
        setSending(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Responsive classes
    const layoutClass = "min-h-screen bg-background flex overflow-hidden pt-[64px]"; // Pt for navbar

    return (
        <div className={layoutClass}>
            {/* LEFT SIDEBAR - CONVERSATION LIST */}
            <div className={`
                ${mobileView === 'list' ? 'flex' : 'hidden md:flex'} 
                w-full md:w-80 lg:w-96 flex-col border-r border-border bg-surface shrink-0
            `}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-display font-bold text-lg text-textMain">Messages</h2>
                    <div className="p-2 bg-surfaceHighlight rounded-lg">
                        <Search size={18} className="text-textMuted" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {convLoading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-textMuted">
                            <Briefcase size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No active conversations</p>
                            <p className="text-xs mt-1">Chat starts after you purchase a kit</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.order_id}
                                onClick={() => navigate(`/messages/${conv.order_id}`)}
                                className={`
                                    p-4 border-b border-border hover:bg-surfaceHighlight cursor-pointer transition-colors
                                    ${conv.order_id === orderId ? 'bg-accent-primary/5 border-l-4 border-l-accent-primary' : 'border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {conv.other_party.avatar_url ? (
                                            <img src={conv.other_party.avatar_url} className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-accent-secondary/10 flex items-center justify-center text-xs text-accent-secondary font-bold">
                                                {conv.other_party.full_name[0]}
                                            </div>
                                        )}
                                        <span className="font-medium text-textMain text-sm truncate max-w-[120px]">
                                            {conv.other_party.full_name}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${conv.role === 'buyer' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {conv.role}
                                        </span>
                                    </div>
                                    <span className="text-xs text-textMuted whitespace-nowrap">
                                        {conv.last_message ? new Date(conv.last_message.created_at).toLocaleDateString() : ''}
                                    </span>
                                </div>

                                <p className="text-xs font-medium text-textMain truncate mb-1">
                                    {conv.listing_title}
                                </p>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-textMuted truncate max-w-[200px]">
                                        {conv.last_message?.content || 'Started a conversation'}
                                    </span>
                                    {conv.unread_count > 0 && (
                                        <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className={`
                ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'} 
                flex-1 flex-col bg-background relative
            `}>
                {!orderId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-textMuted">
                        <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                            <Briefcase size={32} />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                ) : (msgLoading || convLoading) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-textMuted">
                        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full mb-4" />
                        <p>Loading conversation...</p>
                    </div>
                ) : !activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-textMuted">
                        <div className="w-16 h-16 bg-surfaceHighlight rounded-full flex items-center justify-center mb-4">
                            <Briefcase size={32} />
                        </div>
                        <p className="text-textMain font-medium mb-2">Conversation Not Found</p>
                        <p className="text-sm text-textMuted mb-4">This order may not exist or you don't have access.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-surfaceHighlight transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileView('list')} // Back to list on mobile
                                    className="md:hidden p-2 -ml-2 hover:bg-surfaceHighlight rounded-lg text-textMuted"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                <div className="flex flex-col">
                                    <h3 className="font-bold text-textMain flex items-center gap-2">
                                        {activeConversation?.other_party.full_name}
                                        {activeConversation?.role === 'buyer' && (
                                            <span className="text-xs font-medium text-textMuted px-2 py-0.5 rounded-full bg-surfaceHighlight">
                                                Purchased Item
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-green-500 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsContextOpen(!isContextOpen)}
                                    className={`p-2 rounded-lg hover:bg-surfaceHighlight transition-colors ${isContextOpen ? 'text-accent-primary bg-accent-primary/5' : 'text-textMuted'}`}
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map((msg, i) => {
                                const isOwn = msg.sender_id === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                            <div className={`
                                                p-4 rounded-2xl relative group shadow-sm
                                                ${isOwn ? 'bg-accent-primary text-accent-primary-fg rounded-br-none' : 'bg-surface border border-border text-textMain rounded-bl-none'}
                                            `}>
                                                {/* Text Content */}
                                                {msg.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>}

                                                {/* Attachments */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className={`grid gap-2 mt-2 ${msg.content ? 'pt-2 border-t border-white/20' : ''}`}>
                                                        {msg.attachments.map((url, idx) => (
                                                            <a
                                                                href={url}
                                                                key={idx}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${isOwn ? 'bg-black/10 hover:bg-black/20' : 'bg-surfaceHighlight hover:bg-border'}`}
                                                            >
                                                                <File size={16} />
                                                                <span className="truncate max-w-[150px]">Attachment {idx + 1}</span>
                                                                <Download size={14} className="ml-auto opacity-70" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-textMuted px-1">
                                                <span>{formatTime(msg.created_at)}</span>
                                                {isOwn && (
                                                    <span>{msg.is_read ? '• Read' : '• Sent'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Attachments Preview Area */}
                        {attachments.length > 0 && (
                            <div className="px-6 py-3 border-t border-border bg-surfaceHighlight/30 flex gap-3 overflow-x-auto">
                                {attachments.map((file, i) => (
                                    <div key={i} className="relative group shrink-0">
                                        <div className="w-16 h-16 rounded-lg bg-surface border border-border flex flex-col items-center justify-center">
                                            {file.type.startsWith('image/') ? (
                                                <ImageIcon size={20} className="text-textMuted" />
                                            ) : (
                                                <File size={20} className="text-textMuted" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeAttachment(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                        <span className="text-[10px] text-textMuted truncate w-16 block text-center mt-1">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-surface border-t border-border">
                            <form onSubmit={handleSend} className="flex gap-4 items-end bg-surfaceHighlight p-2 rounded-xl border border-border focus-within:border-accent-primary/50 focus-within:ring-1 focus-within:ring-accent-primary/20 transition-all shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-textMuted hover:text-accent-primary transition-colors hover:bg-surface rounded-lg"
                                    title="Attach files"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                />

                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                    placeholder={attachments.length > 0 ? "Add a message..." : "Type a message to start conversation..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-textMain placeholder:text-textMuted resize-none py-3 max-h-32 text-sm"
                                    rows={1}
                                />

                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                                    className="p-3 bg-accent-primary text-accent-primary-fg rounded-lg hover:bg-accent-primary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20"
                                >
                                    {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                            <p className="text-[10px] text-textMuted text-center mt-2">
                                Press Enter to send, Shift + Enter for new line
                            </p>
                        </div>
                    </>
                )
                }
            </div >

            {/* RIGHT CONTEXT PANEL - UPWORK STYLE */}
            {
                isContextOpen && order && (
                    <div className={`
                    absolute inset-y-0 right-0 w-80 bg-surface border-l border-border shadow-xl transform transition-transform z-20 pt-[64px]
                    ${mobileView === 'chat' && isContextOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:relative md:block hidden'}
                `}>
                        <div className="h-16 px-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-textMain">Contract Details</h3>
                            <button onClick={() => setIsContextOpen(false)} className="md:hidden p-2">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-128px)]">
                            {/* Status Card */}
                            <div className="p-4 rounded-xl bg-surfaceHighlight border border-border">
                                <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-accent-primary animate-pulse'}`} />
                                    <span className="text-sm font-medium text-textMain capitalize">{order.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            {/* Amounts */}
                            <div>
                                <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3">Financials</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-textSecondary">Total Amount</span>
                                        <span className="font-mono font-medium text-textMain">₹{order.price_amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-textSecondary">Escrow Status</span>
                                        <span className="text-green-500 font-medium text-xs bg-green-500/10 px-2 py-0.5 rounded">Funded</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Link
                                    to={`/order/${orderId}`}
                                    className="block w-full py-2.5 text-center rounded-lg border border-border hover:bg-accent-primary/5 hover:border-accent-primary/30 hover:text-accent-primary transition-all text-sm font-medium"
                                >
                                    View Original Order
                                </Link>

                                {activeConversation?.role === 'buyer' ? (
                                    <button className="block w-full py-2.5 text-center rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all text-sm font-medium shadow-lg shadow-green-600/20">
                                        Approve & Release Payment
                                    </button>
                                ) : (
                                    <button className="block w-full py-2.5 text-center rounded-lg bg-accent-primary text-accent-primary-fg hover:bg-accent-primary-dim transition-all text-sm font-medium shadow-lg shadow-accent-primary/20">
                                        Submit Work for Approval
                                    </button>
                                )}
                            </div>

                            {/* Safety Note */}
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                                <Briefcase className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-blue-400/80 leading-relaxed">
                                    Keep all communication within the platform. Payments made outside are not protected.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MessagesPage;
