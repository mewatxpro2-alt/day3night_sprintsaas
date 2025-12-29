import React from 'react';
import { SupportConversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { User, Mail, Circle } from 'lucide-react';

interface ConversationListProps {
    conversations: SupportConversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    sortBy: 'new' | 'unread' | 'old';
    onSortChange: (sort: 'new' | 'unread' | 'old') => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
    sortBy,
    onSortChange,
}) => {
    const formatTime = (timestamp: string | null) => {
        if (!timestamp) return 'No messages yet';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface border-r border-border">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-bold text-textMain mb-3">Support Inbox</h2>

                {/* Sort Buttons */}
                <div className="flex gap-2">
                    {(['new', 'unread', 'old'] as const).map((sort) => (
                        <button
                            key={sort}
                            onClick={() => onSortChange(sort)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${sortBy === sort
                                    ? 'bg-accent-primary text-black'
                                    : 'bg-surfaceHighlight text-textMuted hover:text-textMain'
                                }`}
                        >
                            {sort === 'new' ? 'Newest' : sort === 'unread' ? 'Unread' : 'Oldest'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-textMuted text-sm">
                        <Mail size={32} className="mx-auto mb-3 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={`w-full p-4 border-b border-border text-left hover:bg-surfaceHighlight transition-colors ${selectedId === conv.id ? 'bg-surfaceHighlight' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                                    <User size={20} className="text-accent-primary" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-textMain text-sm truncate">
                                            {conv.name || conv.email}
                                        </h3>

                                        {/* Status Badge */}
                                        <span
                                            className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${conv.status === 'open'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                        >
                                            {conv.status}
                                        </span>
                                    </div>

                                    <p className="text-xs text-textMuted truncate mb-1">
                                        {conv.email}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-textMuted font-mono">
                                            {formatTime(conv.last_message_at)}
                                        </span>

                                        {/* Unread Indicator */}
                                        {conv.unread_count && conv.unread_count > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Circle size={8} className="text-accent-primary fill-accent-primary" />
                                                <span className="text-[10px] font-bold text-accent-primary">
                                                    {conv.unread_count}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConversationList;
