import React, { useState } from 'react';
import { MessageSquare, Lock, Unlock, Eye, AlertTriangle, Search, Filter, User, Calendar, Package, Loader2, X } from 'lucide-react';
import { useAdminConversations, useAdminOrderMessages, AdminConversation } from '../../hooks/useAdminConversations';

const AdminConversations: React.FC = () => {
    const { conversations, isLoading, lockConversation, unlockConversation, refetch } = useAdminConversations();
    const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
    const [lockReason, setLockReason] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'locked' | 'disputed'>('all');
    const [search, setSearch] = useState('');

    const filteredConversations = conversations.filter(conv => {
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            if (!conv.buyer.full_name.toLowerCase().includes(searchLower) &&
                !conv.seller.full_name.toLowerCase().includes(searchLower) &&
                !conv.order_number.toLowerCase().includes(searchLower) &&
                !conv.listing_title.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        // Status filter
        switch (filter) {
            case 'locked': return conv.messages_locked;
            case 'disputed': return conv.has_dispute;
            case 'active': return conv.message_count > 0 && !conv.messages_locked;
            default: return true;
        }
    });

    const handleLock = async () => {
        if (!selectedConversation || !lockReason.trim()) return;
        await lockConversation(selectedConversation.order_id, lockReason);
        setShowLockModal(false);
        setLockReason('');
    };

    const handleUnlock = async (orderId: string) => {
        await unlockConversation(orderId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-textMain mb-2">Conversations</h1>
                    <p className="text-textMuted">Monitor and manage buyer-seller communications</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-textMuted">{conversations.length} total</span>
                    <div className="h-10 w-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                        <MessageSquare className="text-accent-primary" size={20} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user, order, or item..."
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-primary"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-surfaceHighlight/50 rounded-xl border border-border/50">
                    {(['all', 'active', 'locked', 'disputed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                    ? 'bg-accent-tertiary text-textInverse shadow'
                                    : 'text-textMuted hover:text-textMain'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-surfaceHighlight/50">
                            <th className="px-6 py-4 text-left text-xs font-bold text-textMuted uppercase tracking-wider">Order</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-textMuted uppercase tracking-wider">Participants</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-textMuted uppercase tracking-wider">Item</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-textMuted uppercase tracking-wider">Messages</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-textMuted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredConversations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-textMuted">
                                    No conversations found
                                </td>
                            </tr>
                        ) : (
                            filteredConversations.map((conv) => (
                                <tr key={conv.order_id} className="hover:bg-surfaceHighlight/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-medium text-textMain">{conv.order_number}</span>
                                            <span className="text-xs text-textMuted capitalize">{conv.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold">BUYER</span>
                                                <span className="text-sm text-textMain truncate max-w-[120px]">{conv.buyer.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold">SELLER</span>
                                                <span className="text-sm text-textMain truncate max-w-[120px]">{conv.seller.full_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-textMain truncate block max-w-[150px]">{conv.listing_title}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold ${conv.message_count > 0 ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surfaceHighlight text-textMuted'
                                            }`}>
                                            {conv.message_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            {conv.messages_locked && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <Lock size={10} /> LOCKED
                                                </span>
                                            )}
                                            {conv.has_dispute && (
                                                <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <AlertTriangle size={10} /> DISPUTE
                                                </span>
                                            )}
                                            {!conv.messages_locked && !conv.has_dispute && (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedConversation(conv)}
                                                className="p-2 hover:bg-accent-primary/10 text-textMuted hover:text-accent-primary rounded-lg transition-colors"
                                                title="View Messages"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {conv.messages_locked ? (
                                                <button
                                                    onClick={() => handleUnlock(conv.order_id)}
                                                    className="p-2 hover:bg-green-500/10 text-textMuted hover:text-green-500 rounded-lg transition-colors"
                                                    title="Unlock Conversation"
                                                >
                                                    <Unlock size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedConversation(conv); setShowLockModal(true); }}
                                                    className="p-2 hover:bg-red-500/10 text-textMuted hover:text-red-500 rounded-lg transition-colors"
                                                    title="Lock Conversation"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Message Viewer Modal */}
            {selectedConversation && !showLockModal && (
                <MessageViewerModal
                    conversation={selectedConversation}
                    onClose={() => setSelectedConversation(null)}
                />
            )}

            {/* Lock Conversation Modal */}
            {showLockModal && selectedConversation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setShowLockModal(false)}>
                    <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                            <Lock className="text-red-500" size={20} />
                            Lock Conversation
                        </h3>
                        <p className="text-sm text-textMuted mb-4">
                            Locking will prevent both buyer and seller from sending new messages. Use during disputes or policy violations.
                        </p>
                        <textarea
                            value={lockReason}
                            onChange={(e) => setLockReason(e.target.value)}
                            placeholder="Reason for locking (visible to admin only)..."
                            className="w-full p-3 bg-surfaceHighlight border border-border rounded-xl text-textMain placeholder:text-textMuted resize-none h-24 focus:outline-none focus:border-accent-primary mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowLockModal(false)} className="flex-1 py-2.5 border border-border rounded-xl text-textMuted hover:text-textMain transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleLock} disabled={!lockReason.trim()} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
                                Lock Conversation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for viewing messages
const MessageViewerModal: React.FC<{ conversation: AdminConversation; onClose: () => void }> = ({ conversation, onClose }) => {
    const { messages, isLoading } = useAdminOrderMessages(conversation.order_id);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="font-bold text-textMain">{conversation.order_number}</h3>
                        <p className="text-xs text-textMuted">{conversation.buyer.full_name} ↔ {conversation.seller.full_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surfaceHighlight rounded-lg text-textMuted">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-accent-primary" size={24} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-textMuted">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No messages in this conversation</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isBuyer = msg.sender_id === conversation.buyer.id;
                            const senderName = isBuyer ? conversation.buyer.full_name : conversation.seller.full_name;
                            const role = isBuyer ? 'BUYER' : 'SELLER';
                            const roleColor = isBuyer ? 'blue' : 'green';
                            return (
                                <div key={msg.id} className="flex flex-col gap-1 p-3 bg-surfaceHighlight/50 rounded-xl border border-border/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] bg-${roleColor}-500/10 text-${roleColor}-500 px-1.5 py-0.5 rounded font-bold`}>{role}</span>
                                            <span className="text-sm font-medium text-textMain">{senderName}</span>
                                        </div>
                                        <span className="text-xs text-textMuted">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-textMain whitespace-pre-wrap">{msg.content}</p>
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {msg.attachments.map((url: string, i: number) => (
                                                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-accent-tertiary hover:underline">
                                                    Attachment {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Info */}
                {conversation.messages_locked && (
                    <div className="p-3 border-t border-border bg-red-500/5 flex items-center gap-2 text-sm text-red-500 shrink-0">
                        <Lock size={14} />
                        <span>Conversation locked: {conversation.messages_lock_reason}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminConversations;
