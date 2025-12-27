import React, { useState } from 'react';
import { Loader2, Mail, Calendar, Check, X, Search } from 'lucide-react';
import { useContactMessages, type ContactMessage } from '../../hooks/useContactMessages';

const Messages: React.FC = () => {
    const { messages, isLoading, error, updateStatus } = useContactMessages();
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMessages = messages.filter(msg => {
        // Search filter
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            if (!(msg.name?.toLowerCase().includes(search) ||
                msg.email?.toLowerCase().includes(search) ||
                msg.message?.toLowerCase().includes(search))) {
                return false;
            }
        }
        // Status filter
        if (filter === 'all') return true;
        return msg.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'text-green-400 bg-green-500/10';
            case 'read':
                return 'text-blue-400 bg-blue-500/10';
            default:
                return 'text-yellow-400 bg-yellow-500/10';
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        await updateStatus(messageId, 'read');
    };

    const handleMarkAsResolved = async (messageId: string) => {
        await updateStatus(messageId, 'resolved');
        setSelectedMessage(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Contact Messages</h1>
                    <p className="text-textMuted">{messages.length} total messages</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-textMain placeholder:text-textMuted focus:outline-none focus:border-accent-tertiary transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'unread', 'read', 'resolved'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
                                ? 'bg-blue-500 text-white'
                                : 'bg-surface text-textMuted hover:text-white hover:bg-surfaceHighlight border border-border'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status === 'unread' && messages.filter(m => m.status === 'unread').length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    {messages.filter(m => m.status === 'unread').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages List */}
            {filteredMessages.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-textMuted">No {filter !== 'all' ? filter : ''} messages found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMessages.map((message) => (
                        <div
                            key={message.id}
                            onClick={() => {
                                setSelectedMessage(message);
                                if (message.status === 'unread') {
                                    handleMarkAsRead(message.id);
                                }
                            }}
                            className="p-6 rounded-xl bg-surface border border-border hover:border-blue-500/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Mail size={16} className="text-blue-400" />
                                        <h3 className="font-semibold text-white truncate">{message.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(message.status)}`}>
                                            {message.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-textMuted mb-2">{message.email}</p>
                                    {message.company && (
                                        <p className="text-xs text-textMuted mb-2">Company: {message.company}</p>
                                    )}
                                    <p className="text-sm text-white line-clamp-2">{message.message}</p>
                                    <div className="flex items-center gap-2 text-xs text-textMuted mt-3">
                                        <Calendar size={12} />
                                        {new Date(message.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 animate-fade-in" onClick={() => setSelectedMessage(null)}>
                    <div className="bg-surface border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
                            <h2 className="text-xl font-bold text-white">Message Details</h2>
                            <button onClick={() => setSelectedMessage(null)} className="text-textMuted hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-textMuted uppercase tracking-wider">Name</label>
                                    <p className="text-white mt-1">{selectedMessage.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-textMuted uppercase tracking-wider">Email</label>
                                    <p className="text-white mt-1">{selectedMessage.email}</p>
                                </div>
                                {selectedMessage.company && (
                                    <div>
                                        <label className="text-sm text-textMuted uppercase tracking-wider">Company</label>
                                        <p className="text-white mt-1">{selectedMessage.company}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm text-textMuted uppercase tracking-wider">Message</label>
                                    <p className="text-white mt-1 whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-textMuted uppercase tracking-wider">Received</label>
                                    <p className="text-white mt-1">{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            {selectedMessage.status !== 'resolved' && (
                                <div className="flex gap-3 pt-4 border-t border-border">
                                    <button
                                        onClick={() => handleMarkAsResolved(selectedMessage.id)}
                                        className="flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} />
                                        Mark as Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
